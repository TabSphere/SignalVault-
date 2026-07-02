# SignalVault - AI Trading Signals Platform

SignalVault is a full-stack AI-powered trading signals platform with credit-based pricing. Users buy credits, spend them on AI-generated trading signals and chat assistance. Built with React, Supabase, OpenAI, and Stripe.

## What's New

- **Credit-Based Pricing** — No subscriptions. Buy credits from £4.99, use when you want
- **AI Chat Widget** — Floating chat assistant on every page (1 credit per message)
- **Referral System** — Invite friends, earn 10% of their first purchase as credits
- **Credit Calculator** — See how long your credits will last based on usage
- **Polished Animations** — GSAP scroll reveals + Framer Motion micro-interactions

---

## Architecture

```
Frontend (React + Vite + Tailwind + shadcn/ui + Framer Motion + GSAP)
    |
    v
Supabase (Auth + Postgres + Storage + Edge Functions)
    |
    +-----------+-----------+-----------+-----------+
    |           |           |           |           |
 OpenAI      Stripe      OpenAI      Yahoo Finance
(GPT-4o      (Credit     (GPT-4o-mini (Live
Signals)     Purchases)  Chat)        Prices)
```

---

## Credit Pricing

| Package | Price | Credits | Bonus | Signals* | Best For |
|---------|-------|---------|-------|----------|----------|
| **Mini** | £4.99 | 35 | — | ~7 | First try |
| **Starter** | £9.99 | 85 | +10 | ~19 | Casual traders |
| **Trader** | £14.99 | 150 | +25 | ~35 | Regular traders |
| **Pro** | £19.99 | 250 | +50 | ~60 | Power users |

*Based on 5-credit detailed signals. New users get **5 free credits** on signup.

### Credit Costs

| Action | Credits | Est. Cost |
|--------|---------|-----------|
| Generate signal (basic) | 3 | ~£0.09 |
| Generate signal (detailed) | 5 | ~£0.15 |
| Generate signal (full analysis) | 8 | ~£0.24 |
| AI chat message | 1 | ~£0.03 |
| Live price refresh | 1 | ~£0.03 |

---

## Referral Program

- **Inviter**: Earn 10% of friend's first purchase as credits (no limit)
- **Friend**: Gets 10 bonus credits when signing up with your link
- Share via: Copy link, Email, WhatsApp, Telegram

---

## Project Structure

```
SignalVault/
|
|-- frontend/                    # React + Vite source (deploy to Vercel)
|   |-- src/
|   |   |-- components/
|   |   |   |-- ChatWidget.tsx      # Floating AI chat
|   |   |   |-- ChatMessage.tsx     # Message bubbles
|   |   |   |-- CreditCalculator.tsx # Usage calculator
|   |   |   |-- Navbar.tsx          # With credit balance
|   |   |   |-- Layout.tsx          # ChatWidget included
|   |   |-- pages/
|   |   |   |-- Home.tsx
|   |   |   |-- Dashboard.tsx
|   |   |   |-- Credits.tsx         # Credit packages + calculator
|   |   |   |-- Referrals.tsx       # Referral program
|   |   |   |-- Signals.tsx
|   |   |   |-- Performance.tsx
|   |   |   |-- Pricing.tsx         # Redirects to /credits
|   |   |   |-- Onboarding.tsx
|   |   |-- App.tsx                 # Routes: /credits, /referrals
|
|-- backend/
|   |-- supabase/
|       |-- migrations/
|       |   |-- 001_schema.sql      # Original schema (run first)
|       |   |-- 002_credit_system.sql # Credits + referrals (run second)
|       |
|       |-- functions/
|       |   |-- generate-signal/     # AI signal generation (deducts credits)
|       |   |-- live-prices/         # Yahoo Finance price feeds
|       |   |-- stripe-webhook/       # Stripe payment + credit purchases
|       |   |-- ai-voice-call/        # ElevenLabs voice (VIP feature)
|       |   |-- chat-assistant/       # OpenAI GPT-4o-mini chat
|       |   |-- deduct-credits/       # Atomic credit deduction
|       |   |-- purchase-credits/     # Stripe checkout for credit packs
|       |   |-- process-referral/     # Referral tracking & rewards
|
|-- .env.example                  # Environment variables template
|-- README.md                     # This file
```

---

## Quick Start

### Prerequisites

- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)
- OpenAI API key (https://platform.openai.com)
- Vercel account (https://vercel.com) — optional, for frontend deploy

### Step 1: Set Up Supabase Database

1. Go to https://supabase.com/dashboard
2. Create/select your SignalVault project
3. Go to **SQL Editor** > **New Query**
4. Run migrations in order:
   ```
   backend/supabase/migrations/001_schema.sql    # Run first
   backend/supabase/migrations/002_credit_system.sql  # Run second
   ```

This creates:
- All tables (profiles, signals, subscriptions, credits, transactions, referrals, conversations)
- RLS policies, indexes, triggers
- 5 free starter credits for new users
- Credit packages (Mini, Starter, Trader, Pro)

### Step 2: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New Bucket**
3. Name: `voice-calls`
4. Enable **Public bucket**
5. Click **Save**

### Step 3: Add Environment Secrets

1. Go to **Project Settings** > **Edge Functions**
2. Add these secrets:

```bash
OPENAI_API_KEY=sk-proj-your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
ELEVENLABS_API_KEY=sk_your_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your_key_here
ALLOWED_ORIGIN=https://your-domain.com  # Or * for development
CHAT_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
```

### Step 4: Set Up Stripe Products

**For Credit Packages (one-time payments):**

1. Go to https://dashboard.stripe.com/products
2. Create 4 products with one-time prices:
   - SignalVault Mini — £4.99
   - SignalVault Starter — £9.99
   - SignalVault Trader — £14.99
   - SignalVault Pro — £19.99
3. Copy the Price IDs (look like `price_1ABC...`)
4. Update `credit_packages` table in Supabase with these Price IDs:
   ```sql
   UPDATE public.credit_packages SET stripe_price_id = 'price_...' WHERE slug = 'mini';
   UPDATE public.credit_packages SET stripe_price_id = 'price_...' WHERE slug = 'starter';
   UPDATE public.credit_packages SET stripe_price_id = 'price_...' WHERE slug = 'trader';
   UPDATE public.credit_packages SET stripe_price_id = 'price_...' WHERE slug = 'pro';
   ```

**For Subscriptions (legacy, optional):**

1. Create 3 products with recurring prices (if keeping subscription model):
   - SignalVault Standard — GBP 29/month
   - SignalVault Pro — GBP 79/month
   - SignalVault VIP — GBP 149/month
2. Go to https://dashboard.stripe.com/webhooks
3. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
5. Copy the Webhook Signing Secret

### Step 5: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy generate-signal
supabase functions deploy live-prices
supabase functions deploy stripe-webhook
supabase functions deploy ai-voice-call
supabase functions deploy chat-assistant
supabase functions deploy deduct-credits
supabase functions deploy purchase-credits
supabase functions deploy process-referral
```

### Step 6: Deploy Frontend to Vercel

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

Add these environment variables in Vercel:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

## API Endpoints

| Endpoint | Method | Auth | Credits | Description |
|----------|--------|------|---------|-------------|
| `/functions/v1/generate-signal` | POST | Yes | 3-8 | Generate AI trading signal |
| `/functions/v1/live-prices` | GET | No | 1 | Get live market prices |
| `/functions/v1/stripe-webhook` | POST | No | — | Stripe payment webhooks |
| `/functions/v1/ai-voice-call` | POST | Yes | — | Generate voice call (VIP) |
| `/functions/v1/chat-assistant` | POST | Yes | 1 | AI chat message |
| `/functions/v1/deduct-credits` | POST | Yes | — | Atomic credit deduction |
| `/functions/v1/purchase-credits` | POST | Yes | — | Stripe checkout for credits |
| `/functions/v1/process-referral` | POST | Yes | — | Referral tracking & rewards |

---

## Testing

```bash
# Test live prices (no auth required)
curl https://your-project.supabase.co/functions/v1/live-prices

# Test chat (requires auth)
curl -X POST https://your-project.supabase.co/functions/v1/chat-assistant \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"message":"What is Gold's current signal?","userId":"YOUR_USER_ID"}'

# Test signal generation (requires auth + credits)
curl -X POST https://your-project.supabase.co/functions/v1/generate-signal \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"asset":"XAUUSD","plan":"pro","userId":"YOUR_USER_ID"}'
```

---

## Features

### AI Chat Widget
- Floating button on all pages
- OpenAI GPT-4o-mini powered
- Context-aware (last 10 messages remembered)
- Quick actions: Latest Signals, My Credits, Risk Tips
- Email support link to info@tabsphere.co.uk
- 1 credit per message, 50 messages/hour limit

### Credit System
- Buy credits once, use anytime (never expire)
- 5 free credits for every new signup
- Real-time balance display in navbar
- Low credit warnings (amber < 10, red < 3)
- Transaction history in dashboard

### Credit Calculator
- Interactive usage estimator
- Sliders for signals/day, detail level, chat usage
- Package recommendation based on usage
- Visual progress indicator

### Referral Program
- Unique referral code for every user
- 10% of friend's first purchase as credits
- 10 bonus credits for referred users
- Share via WhatsApp, Telegram, Email, or copy link
- Stats tracking (clicks, signups, purchases, credits earned)

### Animations
- GSAP scroll-triggered page reveals
- Framer Motion micro-interactions
- Credit balance count-up animations
- Chat widget spring physics
- Card hover effects and staggered entrances

### AI Voice Alerts (VIP)
- **TTS Mode**: Generate audio files for in-app playback
- **Call Mode**: Real phone calls via Twilio + ElevenLabs
- Play voice alerts directly in the dashboard
- Call history with playback controls
- Phone number input for outbound calls

---

## Voice Setup (Optional)

SignalVault supports two voice alert modes:

### Option 1: Text-to-Speech (TTS) — Audio Files

1. **Get ElevenLabs API key**:
   - Go to https://elevenlabs.io/app/settings/api-keys
   - Generate a new API key
   - Copy it to `ELEVENLABS_API_KEY` in Supabase secrets

2. **Choose a voice**:
   - Go to https://elevenlabs.io/app/voice-library
   - Pick a professional voice (e.g., "Adam" or "Bella")
   - Copy the Voice ID to `ELEVENLABS_VOICE_ID` in Supabase secrets

3. **Test TTS**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/ai-voice-call \
     -H "Authorization: Bearer YOUR_JWT" \
     -d '{"signalId":"YOUR_SIGNAL_ID","userId":"YOUR_USER_ID","action":"tts"}'
   ```

### Option 2: Real Phone Calls — Twilio + ElevenLabs

1. **Sign up for Twilio**:
   - Go to https://www.twilio.com/try-twilio
   - Verify your account

2. **Buy a phone number**:
   - In Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a Number**
   - Choose a number with Voice capability (~$1/month)
   - Copy the number to `TWILIO_PHONE_NUMBER` (e.g., `+441234567890`)

3. **Get Twilio credentials**:
   - In Console, go to **Account** > **API keys & tokens**
   - Copy **Account SID** to `TWILIO_ACCOUNT_SID`
   - Copy **Auth Token** to `TWILIO_AUTH_TOKEN`

4. **Add to Supabase secrets**:
   ```bash
   TWILIO_ACCOUNT_SID=AC...your_account_sid
   TWILIO_AUTH_TOKEN=...your_auth_token
   TWILIO_PHONE_NUMBER=+44...your_number
   ```

5. **Test phone call**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/ai-voice-call \
     -H "Authorization: Bearer YOUR_JWT" \
     -d '{"signalId":"YOUR_SIGNAL_ID","userId":"YOUR_USER_ID","action":"call"}'
   ```

### How It Works

| Mode | Action | Cost | Use Case |
|------|--------|------|----------|
| **TTS** | `action: "tts"` | ElevenLabs API cost (~$0.01) | In-app audio playback |
| **Call** | `action: "call"` | ElevenLabs + Twilio (~$0.02/min) | Real phone call to user |

The voice script includes: asset name, direction (Buy/Sell), entry price, stop loss, take profit, confidence, and timeframe.

---

## Legal Compliance

- No guaranteed returns stated anywhere
- "For educational purposes only" on all pages
- "Past performance is not indicative of future results"
- Clear statement: SignalVault is NOT a broker
- Users trade on their own platforms
- Full risk disclaimers in footer
- 7-day money-back guarantee on credit purchases

---

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui + Framer Motion + GSAP + Recharts
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI**: OpenAI GPT-4o (signals) + GPT-4o-mini (chat)
- **Payments**: Stripe Checkout (one-time credit purchases)
- **Voice**: ElevenLabs for VIP AI voice calls
- **Prices**: Yahoo Finance API for live market data
- **Deploy**: Vercel (frontend) + Supabase (backend)

---

## Support

- **Email**: info@tabsphere.co.uk
- **Supabase**: https://supabase.com/support
- **Stripe**: https://support.stripe.com
- **OpenAI**: https://help.openai.com
- **ElevenLabs**: https://elevenlabs.io/docs

---

*SignalVault - AI-Powered Trading Signals. For educational purposes only.*
*Trading involves significant risk of loss. This is not financial advice.*
