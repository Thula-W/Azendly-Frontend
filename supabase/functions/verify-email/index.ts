import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let token: string | null = null;
    try {
      const body = await req.json();
      token = typeof body?.token === "string" ? body.token : null;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    if (!token) {
      return json({ error: "Missing token" }, 400);
    }

    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (error || !data) {
      return json({ error: "Invalid or expired link" }, 400);
    }

    await supabase
      .from("waitlist")
      .update({ verified: true })
      .eq("id", data.id);

    await resend.emails.send({
      from: "Azendly <onboarding@azendly.net>",
      to: "azendly.ai@gmail.com",
      subject: "New Verified User 🎉",
      html: `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
      `,
    });

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return json({ error: message }, 500);
  }
});
