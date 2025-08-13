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

function sanitizeJsonString(input: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (!inString) {
      if (ch === '"') {
        inString = true;
      }
      out += ch;
      continue;
    }
    // in string
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = false;
      out += ch;
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code <= 0x1f) {
      switch (ch) {
        case "\n":
          out += "\\n";
          break;
        case "\r":
          out += "\\r";
          break;
        case "\t":
          out += "\\t";
          break;
        case "\b":
          out += "\\b";
          break;
        case "\f":
          out += "\\f";
          break;
        default:
          out += "\\u" + code.toString(16).padStart(4, "0");
      }
      continue;
    }
    out += ch;
  }
  return out;
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

    let payload: EmailWebhookPayload;
    const raw = await req.text();
    try {
      payload = JSON.parse(raw) as EmailWebhookPayload;
    } catch (parseErr) {
      try {
        const sanitized = sanitizeJsonString(raw);
        payload = JSON.parse(sanitized) as EmailWebhookPayload;
      } catch (e2) {
        console.error("Invalid JSON payload for email-inbox-intake", {
          parseErr: (parseErr as Error).message,
          rawSnippet: raw.slice(0, 500),
        });
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid JSON: ensure strings escape newlines as \\n" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }
    console.log("Received email payload:", JSON.stringify(payload, null, 2));

    // Normalize addresses
    const fromEmail = typeof payload.from === "string" ? payload.from : payload.from?.email;
    const toList: string[] = Array.isArray(payload.to)
      ? (payload.to as EmailAddress[]).map((t) => t.email)
      : typeof payload.to === "string"
      ? payload.to.split(",").map((s) => s.trim())
      : [];

    const subject = payload.subject ?? "(no subject)";
    const body = payload.text ?? payload.html ?? "";
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

    if (!fromEmail || toList.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: from.email and at least one to are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1) Find or create thread based on external participant + subject
    const { data: existingThread, error: selectErr } = await supabase
      .from("email_threads")
      .select("id")
      .eq("participant_email", fromEmail)
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
        .insert({ participant_email: fromEmail, subject })
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
        direction: "inbound",
        from_email: fromEmail,
        to_email: toList.join(", "),
        body,
        attachments,
      })
      .select("id, created_at")
      .single();

    if (msgErr) {
      console.error("Error inserting email message:", msgErr);
      return new Response(JSON.stringify({ error: msgErr.message }), {
        status: 500,
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
