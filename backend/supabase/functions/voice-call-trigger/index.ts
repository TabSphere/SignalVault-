// SignalVault Edge Function: Voice Call Trigger
// Simple endpoint to trigger a voice call from the frontend
// Calls the ai-voice-call function with action="call"
// Deploy: supabase functions deploy voice-call-trigger

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { signalId, userId } = await req.json();

    if (!signalId || !userId) {
      return new Response(
        JSON.stringify({ error: "signalId and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has phone number
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone, plan")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.phone) {
      return new Response(
        JSON.stringify({ error: "No phone number on file. Add one in your profile settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the ai-voice-call function with action="call"
    const { data: callData, error: callError } = await supabase.functions.invoke("ai-voice-call", {
      body: { signalId, userId, action: "call" },
    });

    if (callError) throw callError;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Calling ${profile.phone}...`,
        callId: callData.callId,
        twilioCallSid: callData.twilioCallSid,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice call trigger error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
