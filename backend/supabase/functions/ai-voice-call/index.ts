// SignalVault Edge Function: AI Voice Calling for VIP Members via ElevenLabs
// Deploy: supabase functions deploy ai-voice-call

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignalData {
  asset_name: string;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence: number;
  analysis: string;
  timeframe: string;
}

function buildVoiceScript(signal: SignalData): string {
  const direction = signal.direction === "buy" ? "Buy" : "Sell";
  return `SignalVault VIP Alert. ${signal.asset_name}. ${direction} signal. Entry at ${signal.entry_price}. Stop loss at ${signal.stop_loss}. Take profit at ${signal.take_profit}. Confidence ${signal.confidence} percent. ${signal.analysis} Timeframe ${signal.timeframe}.`;
}

async function generateVoiceAudio(script: string, voiceId: string, apiKey: string): Promise<Uint8Array> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

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

    // Check environment variables
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID");
    if (!elevenLabsKey || !voiceId) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Connect to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user has VIP plan
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, phone")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.plan !== "vip") {
      return new Response(
        JSON.stringify({ error: "AI Voice Calling is a VIP-only feature" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signal details
    const { data: signal, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", signalId)
      .single();

    if (signalError || !signal) {
      return new Response(
        JSON.stringify({ error: "Signal not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create call record
    const { data: callRecord, error: callError } = await supabase
      .from("ai_calls")
      .insert({
        user_id: userId,
        signal_id: signalId,
        phone_number: profile.phone,
        call_status: "in_progress",
      })
      .select()
      .single();

    if (callError) throw callError;

    // Build voice script
    const script = buildVoiceScript(signal);

    // Generate voice audio
    const audioBuffer = await generateVoiceAudio(script, voiceId, elevenLabsKey);

    // Upload to Supabase Storage
    const fileName = `calls/${userId}/${signalId}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("voice-calls")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("voice-calls")
      .getPublicUrl(fileName);

    // Update call record as completed
    await supabase
      .from("ai_calls")
      .update({
        call_status: "completed",
        recording_url: publicUrl.publicUrl,
        transcript: script,
        completed_at: new Date().toISOString(),
      })
      .eq("id", callRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        callId: callRecord.id,
        audioUrl: publicUrl.publicUrl,
        transcript: script,
        duration_estimate: Math.ceil(script.length / 15), // rough estimate
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Voice Call error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
