-- ============================================================
-- SignalVault Credit System + Referrals + Chat
-- Run this in Supabase SQL Editor to add credit-based pricing
-- ============================================================

-- 1. CREDIT_PACKAGES TABLE (what users can buy)
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_gbp integer NOT NULL, -- in pence: 499 = £4.99
  credits_included integer NOT NULL,
  bonus_credits integer DEFAULT 0,
  description text,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  stripe_price_id text,
  created_at timestamptz DEFAULT now()
);

-- Insert ultra-affordable packages
INSERT INTO public.credit_packages (name, slug, price_gbp, credits_included, bonus_credits, description, featured) VALUES
  ('Mini', 'mini', 499, 35, 0, 'Perfect first try — 5-10 signals', false),
  ('Starter', 'starter', 999, 85, 10, 'Casual trading — 15-20 signals', false),
  ('Trader', 'trader', 1499, 150, 25, 'Most popular — 30-35 signals', true),
  ('Pro', 'pro', 1999, 250, 50, 'Power user — 50+ signals', false)
ON CONFLICT (slug) DO NOTHING;

-- 2. CREDITS TABLE (user balance)
CREATE TABLE IF NOT EXISTS public.credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  warning_threshold integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CREDIT_TRANSACTIONS TABLE (ledger)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'referral', 'refund', 'adjustment')),
  amount integer NOT NULL, -- positive = added, negative = spent
  balance_after integer NOT NULL,
  description text NOT NULL,
  reference_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 4. CONVERSATIONS TABLE (chat history)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 5. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  credits_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  converted_at timestamptz
);

-- 6. Add referral fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS total_referrals integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_credits_earned integer DEFAULT 0;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
CREATE POLICY "Users can view own credits"
  ON public.credits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active packages" ON public.credit_packages;
CREATE POLICY "Anyone can view active packages"
  ON public.credit_packages FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Users can view own messages" ON public.conversations;
CREATE POLICY "Users can view own messages"
  ON public.conversations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.conversations;
CREATE POLICY "Users can insert own messages"
  ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile + credit balance + referral code on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_code text;
  existing_profile public.profiles%ROWTYPE;
BEGIN
  -- Check if profile already exists
  SELECT * INTO existing_profile FROM public.profiles WHERE id = new.id;
  
  IF existing_profile.id IS NOT NULL THEN
    RETURN new;
  END IF;
  
  -- Generate unique referral code
  new_code := lower(substr(md5(random()::text), 1, 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) LOOP
    new_code := lower(substr(md5(random()::text), 1, 8));
  END LOOP;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, plan, referral_code)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'standard', new_code);
  
  -- Create credit balance with 5 free starter credits
  INSERT INTO public.credits (user_id, balance, lifetime_earned)
  VALUES (new.id, 5, 5);
  
  -- Log the free credits
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (new.id, 'bonus', 5, 5, 'Welcome bonus — 5 free credits');
  
  RETURN new;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Lock the row and get current balance
  SELECT balance INTO current_balance
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No credit account found');
  END IF;
  
  IF current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'balance', current_balance);
  END IF;
  
  new_balance := current_balance - p_amount;
  
  -- Update balance
  UPDATE public.credits
  SET balance = new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, reference_id)
  VALUES (p_user_id, 'usage', -p_amount, new_balance, p_description, p_reference_id);
  
  RETURN jsonb_build_object('success', true, 'balance', new_balance);
END;
$$;

-- Function to add credits (for purchases, referrals, bonuses)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_description text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get or create credit account
  SELECT balance INTO current_balance
  FROM public.credits
  WHERE user_id = p_user_id;
  
  IF current_balance IS NULL THEN
    INSERT INTO public.credits (user_id, balance, lifetime_earned)
    VALUES (p_user_id, p_amount, p_amount);
    new_balance := p_amount;
  ELSE
    new_balance := current_balance + p_amount;
    UPDATE public.credits
    SET balance = new_balance,
        lifetime_earned = lifetime_earned + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, reference_id)
  VALUES (p_user_id, p_type, p_amount, new_balance, p_description, p_reference_id);
  
  RETURN jsonb_build_object('success', true, 'balance', new_balance);
END;
$$;

-- Function to process referral reward
CREATE OR REPLACE FUNCTION public.process_referral_reward(
  p_referral_code text,
  p_purchase_amount integer  -- in pence
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id uuid;
  v_referral_id uuid;
  v_reward_credits integer;
BEGIN
  -- Find referrer
  SELECT r.id, r.referrer_id INTO v_referral_id, v_referrer_id
  FROM public.referrals r
  WHERE r.referral_code = p_referral_code
  AND r.status = 'converted'
  LIMIT 1;
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral not found or already rewarded');
  END IF;
  
  -- Calculate 10% reward in credits (1 credit per £0.10 spent)
  v_reward_credits := GREATEST(1, (p_purchase_amount / 10));
  
  -- Add credits to referrer
  PERFORM public.add_credits(v_referrer_id, v_reward_credits, 'referral', 
    'Referral reward: ' || v_reward_credits || ' credits from friend purchase');
  
  -- Update referral status
  UPDATE public.referrals
  SET status = 'rewarded',
      credits_earned = v_reward_credits
  WHERE id = v_referral_id;
  
  -- Update referrer stats
  UPDATE public.profiles
  SET total_referrals = total_referrals + 1,
      referral_credits_earned = referral_credits_earned + v_reward_credits
  WHERE id = v_referrer_id;
  
  RETURN jsonb_build_object('success', true, 'credits_earned', v_reward_credits);
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT ALL ON public.credits TO service_role;
GRANT ALL ON public.credit_transactions TO service_role;
GRANT ALL ON public.credit_packages TO service_role;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.referrals TO service_role;

GRANT SELECT ON public.credits TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.credit_packages TO authenticated;
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT ON public.referrals TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- DONE! Credit system, chat, and referrals are ready.
-- Next steps:
-- 1. Deploy the updated edge functions
-- 2. Build the frontend components
-- 3. Test credit purchase flow
-- 4. Test referral flow
-- ============================================================
