-- ============================================================
-- SignalVault Complete Database Schema
-- Run this in Supabase SQL Editor to set up everything
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users)
-- Each user gets a profile automatically via trigger
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  plan text not null default 'standard' check (plan in ('standard', 'pro', 'vip')),
  risk_profile text not null default 'moderate' check (risk_profile in ('conservative', 'moderate', 'aggressive')),
  starting_capital integer default 100,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'User profiles extending Supabase Auth';
comment on column public.profiles.plan is 'Subscription tier: standard (1 signal), pro (3 signals), vip (5 signals + AI calls)';

-- 2. SUBSCRIPTIONS TABLE
-- Tracks Stripe subscriptions for each user
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  plan text not null check (plan in ('standard', 'pro', 'vip')),
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.subscriptions is 'Stripe subscription records';

-- 3. SIGNALS TABLE
-- AI-generated trading signals stored here
create table if not exists public.signals (
  id uuid default gen_random_uuid() primary key,
  asset text not null,
  asset_name text not null,
  direction text not null check (direction in ('buy', 'sell')),
  entry_price decimal(12,4) not null,
  stop_loss decimal(12,4) not null,
  take_profit decimal(12,4) not null,
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  plan_required text not null default 'standard' check (plan_required in ('standard', 'pro', 'vip')),
  analysis text,
  ai_reasoning text,
  timeframe text not null default '1h',
  result text check (result in ('win', 'loss', 'pending')),
  exit_price decimal(12,4),
  pips decimal(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.signals is 'AI-generated trading signals from OpenAI';
comment on column public.signals.plan_required is 'Minimum plan tier to receive this signal';

-- 4. USER_SIGNALS TABLE
-- Tracks which signals were delivered to which users
create table if not exists public.user_signals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  signal_id uuid references public.signals(id) on delete cascade not null,
  delivered_at timestamptz default now(),
  opened_at timestamptz,
  plan_at_delivery text not null check (plan_at_delivery in ('standard', 'pro', 'vip')),
  delivery_method text not null default 'dashboard' check (delivery_method in ('dashboard', 'email', 'push', 'voice_call')),
  unique(user_id, signal_id)
);

comment on table public.user_signals is 'Delivery log - which signals went to which users';

-- 5. AI_CALLS TABLE (VIP Feature)
-- Tracks AI voice calls for VIP members
create table if not exists public.ai_calls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  signal_id uuid references public.signals(id) on delete cascade not null,
  phone_number text,
  call_status text not null default 'queued' check (call_status in ('queued', 'in_progress', 'completed', 'failed', 'cancelled')),
  recording_url text,
  transcript text,
  duration_seconds integer,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

comment on table public.ai_calls is 'AI voice call records for VIP members via ElevenLabs';

-- 6. PRICE_SNAPSHOTS TABLE
-- Stores live price snapshots for reference
create table if not exists public.price_snapshots (
  id uuid default gen_random_uuid() primary key,
  symbol text not null,
  asset_name text not null,
  price decimal(12,4) not null,
  change decimal(12,4) default 0,
  change_percent decimal(8,4) default 0,
  high_24h decimal(12,4),
  low_24h decimal(12,4),
  volume bigint,
  source text not null default 'yahoo_finance',
  created_at timestamptz default now()
);

comment on table public.price_snapshots is 'Live price snapshots fetched from Yahoo Finance';

-- 7. TRADE_JOURNAL TABLE
-- Users can log their own trades
create table if not exists public.trade_journal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  signal_id uuid references public.signals(id) on delete set null,
  asset text not null,
  direction text not null check (direction in ('buy', 'sell')),
  entry_price decimal(12,4) not null,
  exit_price decimal(12,4),
  stop_loss decimal(12,4),
  take_profit decimal(12,4),
  position_size decimal(12,4),
  pnl decimal(12,4),
  pnl_percent decimal(8,4),
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  notes text,
  opened_at timestamptz default now(),
  closed_at timestamptz
);

comment on table public.trade_journal is 'User personal trade journal';

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_sub on public.subscriptions(stripe_subscription_id);
create index if not exists idx_signals_status on public.signals(status);
create index if not exists idx_signals_plan on public.signals(plan_required);
create index if not exists idx_signals_created on public.signals(created_at desc);
create index if not exists idx_user_signals_user on public.user_signals(user_id);
create index if not exists idx_ai_calls_user on public.ai_calls(user_id);
create index if not exists idx_price_snapshots_symbol on public.price_snapshots(symbol, created_at desc);
create index if not exists idx_trade_journal_user on public.trade_journal(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.signals enable row level security;
alter table public.user_signals enable row level security;
alter table public.ai_calls enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.trade_journal enable row level security;

-- PROFILES: Users can only see/update their own
-- Service role can see all (for admin)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow insert via trigger (security definer)
create policy "Service can create profiles"
  on public.profiles for insert
  with check (true);

-- SUBSCRIPTIONS: Users can only see their own
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- SIGNALS: All authenticated users can view signals (filtered by their plan in app)
create policy "Authenticated users can view signals"
  on public.signals for select
  to authenticated
  using (true);

-- Only service role can create/update signals
create policy "Service can manage signals"
  on public.signals for all
  using (true)
  with check (true);

-- USER_SIGNALS: Users can only see their own deliveries
create policy "Users can view own delivered signals"
  on public.user_signals for select
  using (auth.uid() = user_id);

-- AI_CALLS: VIP users can only see their own calls
create policy "Users can view own AI calls"
  on public.ai_calls for select
  using (auth.uid() = user_id);

-- PRICE_SNAPSHOTS: All authenticated users can view
create policy "Authenticated users can view prices"
  on public.price_snapshots for select
  to authenticated
  using (true);

-- TRADE_JOURNAL: Users can only see/manage their own trades
create policy "Users can view own trades"
  on public.trade_journal for select
  using (auth.uid() = user_id);

create policy "Users can create own trades"
  on public.trade_journal for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trade_journal for update
  using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trade_journal for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, plan)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'standard'
  );
  return new;
end;
$$;

-- Trigger: Create profile after auth user created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to all tables
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger handle_signals_updated_at
  before update on public.signals
  for each row execute procedure public.handle_updated_at();

-- Function to check user's plan
create or replace function public.get_user_plan(user_uuid uuid)
returns text
language plpgsql
security definer
as $$
declare
  user_plan text;
begin
  select plan into user_plan from public.profiles where id = user_uuid;
  return coalesce(user_plan, 'standard');
end;
$$;

-- Function to count signals delivered today
create or replace function public.count_today_signals(user_uuid uuid)
returns integer
language plpgsql
security definer
as $$
declare
  signal_count integer;
begin
  select count(*) into signal_count
  from public.user_signals
  where user_id = user_uuid
    and delivered_at >= current_date
    and delivered_at < current_date + interval '1 day';
  return signal_count;
end;
$$;

-- ============================================================
-- SEED DATA (Sample Signals for Demo)
-- ============================================================

-- Insert sample signals
insert into public.signals (asset, asset_name, direction, entry_price, stop_loss, take_profit, confidence, status, plan_required, analysis, timeframe)
values
  ('XAUUSD', 'Gold / USD', 'buy', 3975.96, 3930.00, 4050.00, 78, 'active', 'standard', 'Double bottom formation at $3,962 with bullish divergence on RSI. Support held at key $3,930 level. Targeting $4,050 resistance zone.', '1h'),
  ('EURUSD', 'EUR / USD', 'buy', 1.0847, 1.0800, 1.0920, 72, 'active', 'standard', 'Bullish engulfing on 4H chart. Support at 1.0800 psychological level. Euro showing strength against weakening USD.', '4h'),
  ('GBPUSD', 'GBP / USD', 'sell', 1.2734, 1.2780, 1.2650, 65, 'active', 'pro', 'Bearish pin bar at resistance. UK economic data disappointing. Targeting support at 1.2650.', '1h'),
  ('BTCUSD', 'Bitcoin / USD', 'buy', 67432.18, 66100.00, 69500.00, 82, 'active', 'pro', 'Breakout above $67,000 resistance with strong volume. Institutional buying detected. Next target $69,500.', '4h'),
  ('USDJPY', 'USD / JPY', 'sell', 151.42, 152.00, 150.50, 70, 'active', 'vip', 'Overbought on daily RSI. BOJ intervention risk elevated. Divergence forming on MACD.', '1d'),
  ('NAS100', 'NASDAQ 100', 'buy', 17842.35, 17650.00, 18100.00, 75, 'active', 'vip', 'Tech earnings beating expectations. Trendline support held. AI sector driving momentum.', '1d')
on conflict do nothing;

-- Insert sample price snapshots
insert into public.price_snapshots (symbol, asset_name, price, change, change_percent, high_24h, low_24h)
values
  ('XAUUSD', 'Gold / USD', 4024.54, 48.58, 1.22, 4049.70, 3962.50),
  ('EURUSD', 'EUR / USD', 1.0847, 0.0023, 0.21, 1.0865, 1.0812),
  ('GBPUSD', 'GBP / USD', 1.2734, -0.0012, -0.09, 1.2760, 1.2700),
  ('BTCUSD', 'Bitcoin / USD', 67432.18, 1245.30, 1.88, 68100.00, 66100.00),
  ('USDJPY', 'USD / JPY', 151.42, 0.35, 0.23, 151.85, 150.90),
  ('NAS100', 'NASDAQ 100', 17842.35, 125.40, 0.71, 17900.00, 17700.00)
on conflict do nothing;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

-- Allow service role full access
grant all on public.profiles to service_role;
grant all on public.subscriptions to service_role;
grant all on public.signals to service_role;
grant all on public.user_signals to service_role;
grant all on public.ai_calls to service_role;
grant all on public.price_snapshots to service_role;
grant all on public.trade_journal to service_role;

-- Allow authenticated users to insert their own trade journal entries
grant insert, select, update, delete on public.trade_journal to authenticated;
grant select on public.signals to authenticated;
grant select on public.price_snapshots to authenticated;
grant select on public.user_signals to authenticated;
grant select on public.ai_calls to authenticated;
grant select on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;

-- Allow sequence usage
grant usage on all sequences in schema public to authenticated;
grant usage on all sequences in schema public to service_role;

-- ============================================================
-- DONE! Your SignalVault database is ready.
-- Next steps:
-- 1. Deploy the 4 Edge Functions
-- 2. Set up environment variables in Supabase
-- 3. Connect your frontend to Supabase
-- 4. Test the signal generation flow
-- ============================================================
