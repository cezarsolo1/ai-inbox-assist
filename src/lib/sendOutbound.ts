import { supabase } from "@/integrations/supabase/client";
import { MAKE_OUTBOUND_WEBHOOK_URL, MAKE_OUTBOUND_TOKEN, TWILIO_WA_NUMBER } from "./config";

export async function sendWhatsAppReply({
  to,
  body,
  media = []
}: { to: string; body: string; media?: string[] }) {
  // 1) Insert as queued so it appears instantly in UI
  const { data, error } = await supabase
    .from("outbound_messages")
    .insert([{
      channel: "whatsapp",
      to_msisdn: to.replace(/^whatsapp:/, ""),
      from_msisdn: TWILIO_WA_NUMBER.replace(/^whatsapp:/, ""),
      body,
      media,
      status: "queued"
    }])
    .select("id")
    .single();
  
  if (error) throw error;
  const id = data.id;

  // 2) For now, just log since Make webhook is not configured
  console.log("Would send to Make webhook:", {
    id, 
    to, 
    from: TWILIO_WA_NUMBER, 
    text: body, 
    media
  });

  // Skip the webhook call for now since the URL is a placeholder
  // When you configure your Make webhook, uncomment the code below:
  /*
  try {
    await fetch(MAKE_OUTBOUND_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(MAKE_OUTBOUND_TOKEN ? { "X-Inbox-Token": MAKE_OUTBOUND_TOKEN } : {})
      },
      body: JSON.stringify({
        id, 
        to, 
        from: TWILIO_WA_NUMBER, 
        text: body, 
        media
      })
    });
  } catch (e) {
    // Mark as failed if webhook call fails
    await supabase
      .from("outbound_messages")
      .update({ status: "failed", error: String(e) })
      .eq("id", id);
    throw e;
  }
  */

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