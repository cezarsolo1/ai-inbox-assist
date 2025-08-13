import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DeletePayload {
  id?: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars");
    return json({ ok: false, error: "server_misconfigured" }, 500);
  }

  try {
    // Read body exactly once
    const raw = await req.text();
    let payload: DeletePayload;
    try {
      payload = JSON.parse(raw || "{}");
    } catch (e) {
      console.error("Invalid JSON in email-delete-message:", e);
      return json({ ok: false, error: "invalid_json" }, 400);
    }

    const id = payload.id?.trim();
    if (!id) {
      return json({ ok: false, error: "missing_id" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from("email_messages").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete email message:", error);
      return json({ ok: false, error: error.message }, 500);
    }

    return json({ ok: true });
  } catch (e: any) {
    console.error("Unhandled in email-delete-message:", e);
    return json({ ok: false, error: e?.message ?? "unknown" }, 500);
  }
});
