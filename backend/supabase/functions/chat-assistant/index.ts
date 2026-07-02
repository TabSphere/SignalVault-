// SignalVault Edge Function: AI Chat Assistant
// Deducts 1 credit per message, uses OpenAI GPT-4o-mini
// Deploy: supabase functions deploy chat-assistant

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiter: 50 messages per hour per user
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

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

// SignalVault AI system prompt
const SYSTEM_PROMPT = `You are SignalVault AI, a knowledgeable and friendly trading assistant for SignalVault — an AI-powered trading signals platform.

You help users with:
- Understanding their trading signals (entry, stop loss, take profit, confidence)
- Explaining market analysis and technical indicators
- Trading education (risk management, position sizing, forex basics)
- SignalVault features and how credits work
- General trading questions

IMPORTANT RULES:
- Always include risk disclaimers when discussing trades: "Trading involves significant risk. Past performance is not indicative of future results."
- Never guarantee profits or give personalized financial advice
- Keep responses concise (2-4 sentences for simple questions, use bullet points for complex topics)
- If you don't know something specific about the user's account, suggest they check their dashboard or email support at info@tabsphere.co.uk
- Be professional but friendly — traders are often stressed
- Use trading terminology correctly (pips, lots, leverage, spread, etc.)
- Credit costs: signals = 3-5 credits, chat = 1 credit per message
- Plans: Mini (£4.99, 35cr), Starter (£9.99, 95cr), Trader (£14.99, 175cr), Pro (£19.99, 300cr)
- Referrals: invite friends, earn 10% of their first purchase as credits

Current date: ${new Date().toISOString().split('T')[0]}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting
  const clientId = `${req.headers.get("x-forwarded-for") || "unknown"}-${req.headers.get("user-agent") || "unknown"}`;
  if (!checkRateLimit(clientId)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 50 messages per hour." }),
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

    const { message, userId } = await req.json();

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: "Message and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Deduct 1 credit for chat message
    const { data: deductResult, error: deductError } = await supabase.rpc("deduct_credits", {
      p_user_id: userId,
      p_amount: 1,
      p_description: "AI chat message",
      p_reference_id: null
    });

    if (deductError || !deductResult?.success) {
      const errorMsg = deductResult?.error || deductError?.message || "Failed to deduct credits";
      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          needsCredits: true,
          buyUrl: "/credits"
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch last 10 messages for context
    const { data: history } = await supabase
      .from("conversations")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history?.reverse().map((m) => ({ role: m.role, content: m.content })) || []),
      { role: "user", content: message }
    ];

    // Call OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const chatModel = Deno.env.get("CHAT_MODEL") || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: chatModel,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save conversation to database
    await supabase.from("conversations").insert([
      { user_id: userId, role: "user", content: message },
      { user_id: userId, role: "assistant", content: aiResponse }
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: aiResponse,
        creditsRemaining: deductResult.balance
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: "I'm having trouble connecting. Please try again or email info@tabsphere.co.uk for support."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
