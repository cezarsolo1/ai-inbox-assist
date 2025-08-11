import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InboxMessage = {
  id: string;
  channel: string;
  from_msisdn: string;
  to_msisdn: string;
  body: string | null;
  profile_name: string | null;
  twilio_sid: string | null;
  media: string[];
  raw: any;
  seen: boolean;
  created_at: string;
};

interface UseInboxMessagesProps {
  search?: string;
  hasMedia?: boolean;
  unread?: boolean;
  limit?: number;
}

export function useInboxMessages({ 
  search = "", 
  hasMedia = false, 
  unread = false, 
  limit = 50 
}: UseInboxMessagesProps = {}) {
  return useQuery({
    queryKey: ["inbox-messages", search, hasMedia, unread, limit],
    queryFn: async () => {
      let query = supabase
        .from("inbox_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Apply filters
      if (search) {
        query = query.or(`profile_name.ilike.%${search}%,from_msisdn.ilike.%${search}%,body.ilike.%${search}%`);
      }

      if (hasMedia) {
        query = query.gt("media->0", null);
      }

      if (unread) {
        query = query.eq("seen", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as InboxMessage[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

export async function markMessageAsSeen(messageId: string) {
  const { error } = await supabase
    .from("inbox_messages")
    .update({ seen: true })
    .eq("id", messageId);

  if (error) throw error;
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from("inbox_messages")
    .delete()
    .eq("id", messageId);

  if (error) throw error;
}