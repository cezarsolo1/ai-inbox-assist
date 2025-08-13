import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EmailMessageDB = {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  from_email: string;
  to_email: string;
  body: string | null;
  attachments: any[];
  created_at: string;
  seen: boolean;
};

export type EmailThread = {
  id: string;
  subject: string;
  participant_email: string;
  updated_at: string;
  created_at: string;
  last_message?: EmailMessageDB;
  message_count: number;
  unread_count: number;
};

export function useEmailThreads(limit = 50) {
  return useQuery({
    queryKey: ["email-threads", limit],
    queryFn: async () => {
      const { data: threads, error: threadsErr } = await supabase
        .from("email_threads")
        .select("id, subject, participant_email, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (threadsErr) throw threadsErr;

      if (!threads || threads.length === 0) {
        return [] as EmailThread[];
      }

      const threadIds = threads.map((t) => t.id);

      const { data: messages, error: msgsErr } = await supabase
        .from("email_messages")
        .select("id, thread_id, direction, from_email, to_email, body, attachments, created_at, seen")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true });
      if (msgsErr) throw msgsErr;

      const byThread: Record<string, EmailMessageDB[]> = {};
      for (const m of messages || []) {
        (byThread[m.thread_id] ||= []).push(m as EmailMessageDB);
      }

      const enriched: EmailThread[] = threads.map((t) => {
        const arr = byThread[t.id] || [];
        const last = arr[arr.length - 1];
        const unread = arr.filter((m) => !m.seen).length;
        return {
          ...t,
          last_message: last,
          message_count: arr.length,
          unread_count: unread,
        } as EmailThread;
      });

      return enriched;
    },
    refetchInterval: 5000,
  });
}

export function useEmailThreadMessages(threadId?: string) {
  return useQuery({
    queryKey: ["email-thread-messages", threadId],
    enabled: !!threadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_messages")
        .select("id, thread_id, direction, from_email, to_email, body, attachments, created_at, seen")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as EmailMessageDB[];
    },
    refetchInterval: 5000,
  });
}
