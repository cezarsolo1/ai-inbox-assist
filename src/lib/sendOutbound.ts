import { supabase } from "@/integrations/supabase/client";
import { MAKE_OUTBOUND_WEBHOOK_URL, MAKE_OUTBOUND_TOKEN, TWILIO_WA_NUMBER } from "./config";

export async function sendWhatsAppReply({
  to,
  text,
  media = [],
  threadId,
  tenantId,
}: {
  to: string;
  text: string;
  media?: string[];
  threadId?: string;
  tenantId?: string;
}) {
  // 1) insert locally so bubble shows immediately
  const { data, error } = await supabase
    .from("outbound_messages")
    .insert([{
      channel: "whatsapp",
      to_msisdn: to.replace(/^whatsapp:/, "").replace(/^\+?/, "+"),
      from_msisdn: TWILIO_WA_NUMBER.replace(/^whatsapp:/, "").replace(/^\+?/, "+"),
      body: text,
      media,
      status: "queued"
    }])
    .select("id")
    .single();
  if (error) throw error;
  const id = data.id;

  // 2) post to Make (the same 'text' string)
  const payload = {
    id,
    channel: "whatsapp",
    to,
    from: TWILIO_WA_NUMBER,
    text,
    media,
    threadId,
    tenantId,
    createdAt: new Date().toISOString(),
  };

  console.log("OUTBOUND → Make", { url: MAKE_OUTBOUND_WEBHOOK_URL, payload });

  const res = await fetch(MAKE_OUTBOUND_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(MAKE_OUTBOUND_TOKEN ? { "X-Inbox-Token": MAKE_OUTBOUND_TOKEN } : {}),
    },
    body: JSON.stringify(payload),
  });

  const txt = await res.text();
  console.log("Make response", res.status, txt);
  if (!res.ok) {
    await supabase.from("outbound_messages").update({ status: "failed", error: txt }).eq("id", id);
    throw new Error(`Make outbound failed: ${res.status}`);
  }

  return id;
}

export async function markOutboundSent(id: string, sid: string) {
  await supabase
    .from("outbound_messages")
    .update({ 
      status: "sent", 
      twilio_sid: sid, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);
}

export async function markOutboundFailed(id: string, msg: string) {
  await supabase
    .from("outbound_messages")
    .update({ 
      status: "failed", 
      error: msg, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);
}