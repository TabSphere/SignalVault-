// SignalVault Edge Function: AI Voice - TTS Audio + Real Phone Calls
// Supports two modes:
//   action: "tts"     -> Generate audio file (existing behavior)
//   action: "call"    -> Make real phone call via Twilio + ElevenLabs Conversational AI
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

// ── TTS: Generate audio file ──────────────────────────────────

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

// ── REAL CALL: Twilio outbound call ───────────────────────────

async function makePhoneCall(
  toPhone: string,
  signal: SignalData,
  twilioAccountSid: string,
  twilioAuthToken: string,
  twilioPhoneNumber: string,
  elevenLabsKey: string,
  elevenLabsVoiceId: string
): Promise<{ callSid: string; status: string }> {
  // Generate the voice audio first
  const script = buildVoiceScript(signal);
  const audioBuffer = await generateVoiceAudio(script, elevenLabsVoiceId, elevenLabsKey);

  // Upload to Supabase Storage so Twilio can play it
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const fileName = `calls/twilio/${signal.asset_name}_${Date.now()}.mp3`;
  await supabase.storage
    .from("voice-calls")
    .upload(fileName, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: false,
    });

  const { data: publicUrl } = supabase.storage
    .from("voice-calls")
    .getPublicUrl(fileName);

  // Build TwiML that plays the audio + gathers user response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${publicUrl.publicUrl}</Play>
  <Gather action="${Deno.env.get("SUPABASE_URL")}/functions/v1/voice-call-webhook" method="POST" numDigits="1">
    <Say>To repeat, press 1. For more details, press 2. To end, press 3.</Say>
  </Gather>
  <Say>Thank you for using SignalVault. Goodbye.</Say>
  <Hangup/>
</Response>`;

  // Make the Twilio call
  const twilioResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toPhone,
        From: twilioPhoneNumber,
        Twiml: twiml,
      }),
    }
  );

  const twilioData = await twilioResponse.json();
  if (twilioData.error_message) {
    throw new Error(`Twilio error: ${twilioData.error_message}`);
  }

  return { callSid: twilioData.sid, status: twilioData.status };
}

// ── MAIN HANDLER ────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { signalId, userId, action = "tts" } = await req.json();

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
        JSON.stringify({ error: "ElevenLabs not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Connect to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user exists and has phone
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, phone, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // ── ACTION: TTS (Generate Audio File) ───────────────────
    if (action === "tts") {
      // Create call record
      const { data: callRecord, error: callError } = await supabase
        .from("ai_calls")
        .insert({
          user_id: userId,
          signal_id: signalId,
          phone_number: profile.phone,
          call_status: "in_progress",
          call_direction: "outbound",
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
      const { error: uploadError } = await supabase.storage
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

      // Update call record
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
          duration_estimate: Math.ceil(script.length / 15),
          mode: "tts",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: CALL (Real Phone Call) ────────────────────────
    if (action === "call") {
      // Check Twilio config
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        return new Response(
          JSON.stringify({ error: "Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!profile.phone) {
        return new Response(
          JSON.stringify({ error: "User has no phone number. Add phone in profile settings." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
          call_direction: "outbound",
        })
        .select()
        .single();

      if (callError) throw callError;

      // Make the actual phone call
      const { callSid, status } = await makePhoneCall(
        profile.phone,
        signal,
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
        elevenLabsKey,
        voiceId
      );

      // Update call record with Twilio SID
      await supabase
        .from("ai_calls")
        .update({
          twilio_call_sid: callSid,
          call_status: status === "queued" ? "in_progress" : status,
        })
        .eq("id", callRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          callId: callRecord.id,
          twilioCallSid: callSid,
          status: status,
          phone: profile.phone,
          mode: "call",
          message: `Calling ${profile.phone}...`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'tts' or 'call'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Voice error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
