import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing name or email" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const token = crypto.randomUUID();

    const { error } = await supabase.from("waitlist").insert({
      name,
      email,
      verification_token: token,
      verified: false,
    });

    if (error) {
      // handle duplicate email nicely
      if (error.message.includes("duplicate")) {
        return new Response(
          JSON.stringify({ error: "Email already joined" }),
          { status: 400, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Open the marketing site with a token; the SPA calls verify-email with Authorization headers.
    const siteUrl = (Deno.env.get("FRONTEND_URL") ?? "http://localhost:3000").replace(/\/$/, "");
    const verifyUrl = `${siteUrl}/?waitlist_verify=1&token=${encodeURIComponent(token)}#early-access`;

    await resend.emails.send({
      from: "Azendly <onboarding@azendly.net>",
      replyTo: "azendly.ai@gmail.com",
      to: email,
      subject: "Azendly - Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hi ${name}, Welcome to Azendly! 🚀</h2>
        <p>You're now among the first to access smarter resume screening that saves you hours and helps you hire the best candidates faster than your competitors.</p>
        
        <p>To confirm your email and secure your spot, click the button below:</p>
        
        <a href="${verifyUrl}" 
           style="display: inline-block; 
                  padding: 10px 20px; 
                  margin: 20px 0; 
                  background: #06b6d4; 
                  color: #fff; 
                  text-decoration: none; 
                  font-weight: bold; 
                  border-radius: 1rem; 
                  text-transform: uppercase; 
                  letter-spacing: 0.1em;
                  box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2);">
            Verify My Email
        </a>
                
        
        <p>Once verified, you'll get early access to Azendly before anyone else. 
        No spam only important updates and your exclusive invite.</p>
        
        <p style="font-size: 0.9rem; color: #555;">If you didn’t sign up for Azendly, simply ignore this email.</p>
    </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});