import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ConversationMessage = {
  id: string;
  direction: 'inbound' | 'outbound';
  channel: string;
  counterparty: string;
  our_number: string;
  body: string | null;
  media: string[];
  created_at: string;
  status?: string | null;
  twilio_sid?: string | null;
};

interface UseConversationMessagesProps {
  counterparty?: string;
  limit?: number;
}

export function useConversationMessages({ 
  counterparty, 
  limit = 50 
}: UseConversationMessagesProps = {}) {
  return useQuery({
    queryKey: ["conversation-messages", counterparty, limit],
    queryFn: async () => {
      let query = supabase
        .from("conversation_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(limit);

      if (counterparty) {
        query = query.eq("counterparty", counterparty);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ConversationMessage[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}