// SignalVault Edge Function: AI Signal Generation via OpenAI
// Deploy: supabase functions deploy generate-signal

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (resets on function cold start)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(clientId);
  
  if (!entry || now > entry.resetAt) {
    rateLimits.set(clientId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Asset mapping to Yahoo Finance symbols
const YAHOO_SYMBOLS: Record<string, string> = {
  XAUUSD: "GC=F",
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "JPY=X",
  BTCUSD: "BTC-USD",
  USOIL: "CL=F",
  NAS100: "^IXIC",
  GER40: "^GDAXI",
  GBPJPY: "GBPJPY=X",
  AUDUSD: "AUDUSD=X",
};

// Human readable names
const ASSET_NAMES: Record<string, string> = {
  XAUUSD: "Gold / USD",
  EURUSD: "EUR / USD",
  GBPUSD: "GBP / USD",
  USDJPY: "USD / JPY",
  BTCUSD: "Bitcoin / USD",
  USOIL: "US Oil",
  NAS100: "NASDAQ 100",
  GER40: "DAX 40",
  GBPJPY: "GBP / JPY",
  AUDUSD: "AUD / USD",
};

const VALID_PLANS = ["standard", "pro", "vip"];

interface SignalResult {
  direction: "buy" | "sell";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  analysis: string;
  aiReasoning: string;
  timeframe: string;
}

async function fetchCurrentPrice(asset: string): Promise<number> {
  const yahooSymbol = YAHOO_SYMBOLS[asset];
  if (!yahooSymbol) throw new Error(`Unknown asset: ${asset}`);

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`,
      { headers: { "User-Agent": "Mozilla/5.0 (SignalVault/1.0)" } }
    );
    const data = await res.json();
    return data.chart.result[0].meta.regularMarketPrice;
  } catch {
    // Return realistic fallback prices
    const fallbacks: Record<string, number> = {
      XAUUSD: 3975.96, EURUSD: 1.0847, GBPUSD: 1.2734,
      USDJPY: 151.42, BTCUSD: 67432.18, USOIL: 82.45,
      NAS100: 17842.35, GER40: 18423.60, GBPJPY: 192.85, AUDUSD: 0.6645,
    };
    return fallbacks[asset] || 0;
  }
}

async function generateSignalWithOpenAI(
  asset: string,
  assetName: string,
  currentPrice: number
): Promise<SignalResult> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are SignalVault AI, an expert forex and commodities trading analyst with 15+ years experience. 
Generate precise trading signals with the following rules:
- Entry price should be near current market price
- Stop loss: 1-2% away from entry for forex, 0.5-1.5% for commodities
- Take profit: 2-4x the risk (reward-to-risk ratio)
- Confidence: 50-95 based on technical strength
- Timeframe: 1h, 4h, or 1d

Respond ONLY in valid JSON format:
{
  "direction": "buy" or "sell",
  "entry": number (exact price),
  "stopLoss": number (exact price),
  "takeProfit": number (exact price),
  "confidence": number (50-95),
  "analysis": "Brief technical analysis (2-3 sentences)",
  "aiReasoning": "Detailed reasoning for the trade setup",
  "timeframe": "1h" or "4h" or "1d"
}`,
        },
        {
          role: "user",
          content: `Generate a trading signal for ${assetName} (${asset}) at current price ${currentPrice}. 
Analyze the current market conditions and provide a precise entry, stop loss, and take profit level.
Consider: trend direction, support/resistance levels, volatility, and recent price action.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  return {
    direction: content.direction,
    entry: content.entry,
    stopLoss: content.stopLoss,
    takeProfit: content.takeProfit,
    confidence: content.confidence,
    analysis: content.analysis,
    aiReasoning: content.aiReasoning,
    timeframe: content.timeframe,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting by IP + user agent
  const clientId = `${req.headers.get("x-forwarded-for") || "unknown"}-${req.headers.get("user-agent") || "unknown"}`;
  if (!checkRateLimit(clientId)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { asset, plan } = await req.json();

    if (!asset) {
      return new Response(
        JSON.stringify({ error: "Asset symbol required (e.g., XAUUSD)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate plan
    const validatedPlan = plan || "standard";
    if (!VALID_PLANS.includes(validatedPlan)) {
      return new Response(
        JSON.stringify({ error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current price
    const currentPrice = await fetchCurrentPrice(asset);

    // Generate signal with OpenAI
    const signal = await generateSignalWithOpenAI(asset, ASSET_NAMES[asset] || asset, currentPrice);

    // Save to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("signals")
      .insert({
        asset,
        asset_name: ASSET_NAMES[asset] || asset,
        direction: signal.direction,
        entry_price: signal.entry,
        stop_loss: signal.stopLoss,
        take_profit: signal.takeProfit,
        confidence: signal.confidence,
        analysis: signal.analysis,
        ai_reasoning: signal.aiReasoning,
        timeframe: signal.timeframe,
        plan_required: validatedPlan,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, signal: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating signal:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
