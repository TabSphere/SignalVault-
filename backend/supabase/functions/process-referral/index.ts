// SignalVault Edge Function: Process Referral
// Handles referral tracking and rewards
// Deploy: supabase functions deploy process-referral

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
    const { action, referralCode, userId, purchaseAmount } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Action: track_signup — when a new user signs up with a referral code
    if (action === "track_signup") {
      if (!referralCode || !userId) {
        return new Response(
          JSON.stringify({ error: "referralCode and userId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find referrer by referral code
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .single();

      if (!referrer) {
        return new Response(
          JSON.stringify({ error: "Invalid referral code" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create referral record
      const { error: insertError } = await supabase.from("referrals").insert({
        referrer_id: referrer.id,
        referred_id: userId,
        referral_code: referralCode,
        status: "converted",
        converted_at: new Date().toISOString(),
      });

      if (insertError) {
        // May already exist, that's ok
        console.log("Referral insert:", insertError.message);
      }

      // Give new user 10 bonus credits
      await supabase.rpc("add_credits", {
        p_user_id: userId,
        p_amount: 10,
        p_type: "bonus",
        p_description: "Referral bonus — 10 credits from friend's invite",
      });

      return new Response(
        JSON.stringify({ success: true, message: "Referral tracked. 10 bonus credits added!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: process_reward — when referred user makes first purchase
    if (action === "process_reward") {
      if (!referralCode || !purchaseAmount) {
        return new Response(
          JSON.stringify({ error: "referralCode and purchaseAmount required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use the database function to process reward
      const { data, error } = await supabase.rpc("process_referral_reward", {
        p_referral_code: referralCode,
        p_purchase_amount: purchaseAmount,
      });

      if (error) {
        throw new Error(error.message);
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: get_stats — get referral stats for a user
    if (action === "get_stats") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, total_referrals, referral_credits_earned")
        .eq("id", userId)
        .single();

      const { data: referrals, count } = await supabase
        .from("referrals")
        .select("*", { count: "exact" })
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      return new Response(
        JSON.stringify({
          success: true,
          referralCode: profile?.referral_code,
          totalReferrals: profile?.total_referrals || 0,
          creditsEarned: profile?.referral_credits_earned || 0,
          referrals: referrals || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: track_signup, process_reward, get_stats" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Process referral error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
