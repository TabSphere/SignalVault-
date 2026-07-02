// SignalVault Edge Function: Purchase Credits via Stripe
// Creates Stripe checkout session for credit packages
// Deploy: supabase functions deploy purchase-credits

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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { packageSlug, userId, successUrl, cancelUrl } = await req.json();

    if (!packageSlug || !userId) {
      return new Response(
        JSON.stringify({ error: "packageSlug and userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("slug", packageSlug)
      .eq("active", true)
      .single();

    if (pkgError || !pkg) {
      return new Response(
        JSON.stringify({ error: "Package not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single();

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if not exists
    if (!customerId) {
      const customerRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: profile?.email || "",
          metadata: JSON.stringify({ user_id: userId }),
        }),
      });

      const customerData = await customerRes.json();
      if (customerData.error) {
        throw new Error(customerData.error.message);
      }

      customerId = customerData.id;

      // Save to profile
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
    }

    // Create checkout session
    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        "payment_method_types[]": "card",
        "line_items[0][price]": pkg.stripe_price_id || "",
        "line_items[0][quantity]": "1",
        mode: "payment",
        success_url: successUrl || `${Deno.env.get("NEXT_PUBLIC_APP_URL")}/credits?success=true`,
        cancel_url: cancelUrl || `${Deno.env.get("NEXT_PUBLIC_APP_URL")}/credits?canceled=true`,
        metadata: JSON.stringify({
          user_id: userId,
          package_id: pkg.id,
          package_slug: pkg.slug,
          credits: pkg.credits_included + pkg.bonus_credits,
        }),
      }),
    });

    const sessionData = await sessionRes.json();
    if (sessionData.error) {
      throw new Error(sessionData.error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sessionData.id,
        url: sessionData.url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Purchase credits error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
