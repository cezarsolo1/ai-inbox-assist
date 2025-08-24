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
  // 2) post to Make first - don't save to database until confirmed sent
  const payload = {
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

  let messageId: string;

  try {
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
      throw new Error(`Make webhook failed (${res.status}): ${txt}`);
    }

    // 1) Only insert to database AFTER successful send to Make
    const { data, error } = await supabase
      .from("outbound_messages")
      .insert([{
        channel: "whatsapp",
        to_msisdn: to.replace(/^whatsapp:/, "").replace(/^\+?/, "+"),
        from_msisdn: TWILIO_WA_NUMBER.replace(/^whatsapp:/, "").replace(/^\+?/, "+"),
        body: text,
        media,
        status: "sent" // Mark as sent immediately since Make call succeeded
      }])
      .select("id")
      .single();
    
    if (error) throw error;
    messageId = data.id;

  } catch (fetchError) {
    console.error("Failed to send WhatsApp message:", fetchError);
    throw fetchError; // Re-throw to allow caller to handle the error
  }

  return messageId;
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