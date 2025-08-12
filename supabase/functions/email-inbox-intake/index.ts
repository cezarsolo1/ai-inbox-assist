import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface EmailAddress {
  email: string;
  name?: string;
}

interface EmailWebhookPayload {
  from?: EmailAddress | string;
  to?: EmailAddress[] | string;
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, string> | Array<[string, string]> | any;
  attachments?: any[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables");
    return new Response(
      JSON.stringify({ error: "Server not configured correctly" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Verify webhook secret if configured
    if (webhookSecret) {
      const provided = req.headers.get("x-webhook-secret") ?? req.headers.get("X-Webhook-Secret");
      if (provided !== webhookSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const payload = (await req.json()) as EmailWebhookPayload;
    console.log("Received email payload:", JSON.stringify(payload, null, 2));

    // Normalize addresses
    // Normalize addresses (be defensive)
    const rawFrom = payload.from;
    const fromEmail = typeof rawFrom === "string"
      ? rawFrom.trim() || null
      : (rawFrom && typeof rawFrom === "object" && typeof (rawFrom as any).email === "string")
      ? ((rawFrom as any).email as string).trim() || null
      : null;

    const rawTo = payload.to;
    const toList: string[] = Array.isArray(rawTo)
      ? (rawTo as EmailAddress[])
          .map((t) => (t && typeof t.email === "string" ? t.email.trim() : ""))
          .filter(Boolean)
      : typeof rawTo === "string"
      ? rawTo.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const subject = payload.subject ?? "(no subject)";
    const body = payload.text ?? payload.html ?? "";
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
    const headers = Array.isArray(payload.headers) ? payload.headers : [];

    // At least one email needed to anchor a thread
    if (!fromEmail && toList.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid payload: missing both from and to addresses" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Choose a participant to anchor the thread (prefer sender)
    const participant = fromEmail ?? toList[0] ?? null;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1) Find or create thread based on external participant + subject
    const { data: existingThread, error: selectErr } = await supabase
      .from("email_threads")
      .select("id")
      .eq("participant_email", participant)
      .eq("subject", subject)
      .maybeSingle();

    if (selectErr) {
      console.error("Error selecting thread:", selectErr);
      return new Response(JSON.stringify({ error: selectErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let threadId = existingThread?.id as string | undefined;

    if (!threadId) {
      const { data: newThread, error: insertThreadErr } = await supabase
        .from("email_threads")
        .insert({ participant_email: participant, subject })
        .select("id")
        .single();

      if (insertThreadErr) {
        console.error("Error creating thread:", insertThreadErr);
        return new Response(JSON.stringify({ error: insertThreadErr.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      threadId = newThread.id as string;
    }

    // 2) Insert inbound email message
    const { data: msg, error: msgErr } = await supabase
      .from("email_messages")
      .insert({
        thread_id: threadId,
        direction: "incoming",
        from_email: fromEmail ?? null,
        to_email: toList.length > 0 ? toList.join(", ") : null,
        body,
        attachments,
      })
      .select("id, created_at")
      .single();

    if (msgErr) {
      console.error("Error inserting email message:", msgErr);
      return new Response(JSON.stringify({ ok: false, error: msgErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, thread_id: threadId, message_id: msg.id, created_at: msg.created_at }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("Unhandled error in email-inbox-intake:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
