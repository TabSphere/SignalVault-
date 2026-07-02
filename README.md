# SignalVault - AI Trading Signals Platform

SignalVault is a full-stack AI-powered trading signals SaaS that delivers daily trading signals to users. Built with Next.js, Supabase, OpenAI, Stripe, and ElevenLabs.

## Architecture

```
Frontend (Next.js + Tailwind + shadcn/ui)
    |
    v
Supabase (Auth + Postgres + Storage + Edge Functions)
    |
    +-----------+-----------+-----------+
    |           |           |           |
 OpenAI      Stripe    ElevenLabs  Yahoo Finance
(Signals)  (Payments)  (Voice)    (Prices)
```

## Business Model

| Plan | Price | Signals/Day | Key Features |
|------|-------|-------------|-------------|
| **Standard** | GBP 29/mo | **1** | Email delivery, basic risk guide |
| **Pro** | GBP 79/mo | **3** | Instant alerts, risk calculator, entry/stop/target |
| **VIP** | GBP 149/mo | **5** | Everything in Pro + **AI Voice Calling** + priority support |

> SignalVault is an **educational signal provider only**. We are NOT a broker. Users trade on their own platforms (Trading 212, etc.). Trading involves significant risk.

## What's Included

```
SignalVault-FullStack/
|
|-- frontend/dist/               # Built frontend (deploy this to Vercel)
|   |-- index.html
|   |-- assets/
|   |-- images/
|
|-- backend/
|   |-- supabase/
|       |-- migrations/
|       |   |-- 001_schema.sql   # Complete database schema (run this first!)
|       |
|       |-- functions/
|           |-- generate-signal/  # OpenAI signal generation
|           |-- live-prices/      # Yahoo Finance price feeds
|           |-- stripe-webhook/   # Stripe payment handling
|           |-- ai-voice-call/    # ElevenLabs voice for VIP
|
|-- .env.example                  # Environment variables template
|-- README.md                     # This file
```

## Quick Start

### Step 1: Set Up Supabase Database

1. Go to https://supabase.com/dashboard
2. Select your SignalVault project
3. Go to **SQL Editor** > **New Query**
4. Open `backend/supabase/migrations/001_schema.sql`
5. Copy ALL contents and paste into SQL Editor
6. Click **Run**

This creates all tables, indexes, RLS policies, triggers, and seed data.

### Step 2: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New Bucket**
3. Name: `voice-calls`
4. Enable **Public bucket**
5. Click **Save**

### Step 3: Add Environment Secrets

1. Go to **Project Settings** > **Edge Functions**
2. Add these secrets one by one:

```
OPENAI_API_KEY=sk-proj-your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
ELEVENLABS_API_KEY=sk_your_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
SUPABASE_URL=https://dhmswqsggpdrnpaagsvp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your_key_here
```

### Step 4: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref dhmswqsggpdrnpaagsvp

# Deploy all 4 functions
supabase functions deploy generate-signal
supabase functions deploy live-prices
supabase functions deploy stripe-webhook
supabase functions deploy ai-voice-call
```

### Step 5: Set Up Stripe

1. Go to https://dashboard.stripe.com/products
2. Create 3 products with recurring prices:
   - SignalVault Standard - GBP 29/month
   - SignalVault Pro - GBP 79/month
   - SignalVault VIP - GBP 149/month
3. Copy the Price IDs (look like `price_1ABC...`)
4. Go to https://dashboard.stripe.com/webhooks
5. Add endpoint: `https://dhmswqsggpdrnpaagsvp.supabase.co/functions/v1/stripe-webhook`
6. Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
7. Copy the Webhook Signing Secret

### Step 6: Deploy Frontend to Vercel

```bash
# Option 1: Deploy via Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Drag and drop
# Go to https://vercel.com/new
# Drag the frontend/dist folder onto the page
```

Add these environment variables in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://dhmswqsggpdrnpaagsvp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/functions/v1/generate-signal` | POST | Yes | Generate AI trading signal |
| `/functions/v1/live-prices` | GET | No | Get all live prices |
| `/functions/v1/stripe-webhook` | POST | No | Stripe webhook handler |
| `/functions/v1/ai-voice-call` | POST | Yes | Generate voice call (VIP only) |

## Testing

```bash
# Test live prices (no auth required)
curl https://dhmswqsggpdrnpaagsvp.supabase.co/functions/v1/live-prices

# Test signal generation (requires auth)
curl -X POST https://dhmswqsggpdrnpaagsvp.supabase.co/functions/v1/generate-signal \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"asset":"XAUUSD","plan":"pro"}'
```

## Legal Compliance

- No guaranteed returns stated anywhere
- "For educational purposes only" on all pages
- "Past performance is not indicative of future results"
- Clear statement: SignalVault is NOT a broker
- Users trade on their own platforms
- Full risk disclaimers in footer
- 7-day money-back guarantee

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion + Recharts
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI**: OpenAI GPT-4o for signal generation
- **Payments**: Stripe Checkout + Customer Portal
- **Voice**: ElevenLabs for VIP AI voice calls
- **Prices**: Yahoo Finance API for live market data
- **Deploy**: Vercel (frontend) + Supabase (backend)

## Support

- Supabase: https://supabase.com/support
- Stripe: https://support.stripe.com
- OpenAI: https://help.openai.com
- ElevenLabs: https://elevenlabs.io/docs

---

*SignalVault - AI-Powered Trading Signals. For educational purposes only.*
*Trading involves significant risk of loss. This is not financial advice.*
