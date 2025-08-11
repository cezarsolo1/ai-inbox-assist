import { useMemo } from "react";
import { useInboxMessages, type InboxMessage } from "@/hooks/useInboxMessages";
import type { Conversation } from "@/components/inbox/ConversationRow";

interface UseConversationsProps {
  search?: string;
  hasMedia?: boolean;
  unread?: boolean;
  limit?: number;
}

export function useConversations(props: UseConversationsProps = {}) {
  const { data: messages = [], isLoading, error } = useInboxMessages(props);

  const conversations = useMemo(() => {
    if (!messages.length) return [];

    // Group messages by sender (from_msisdn)
    const messagesBySender = messages.reduce((acc, message) => {
      const key = message.from_msisdn;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(message);
      return acc;
    }, {} as Record<string, InboxMessage[]>);

    // Convert to conversation objects
    const conversationList: Conversation[] = Object.entries(messagesBySender).map(([fromMsisdn, senderMessages]) => {
      // Sort messages by date (newest first for last message, but keep all)
      const sortedMessages = senderMessages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const lastMessage = sortedMessages[0];
      const unreadCount = senderMessages.filter(m => !m.seen).length;
      const hasMedia = senderMessages.some(m => 
        m.media && m.media.length > 0 && m.media.some(url => url && url.trim() !== "")
      );

      return {
        id: fromMsisdn,
        from_msisdn: fromMsisdn,
        profile_name: lastMessage.profile_name,
        last_message: lastMessage,
        message_count: senderMessages.length,
        unread_count: unreadCount,
        has_media: hasMedia
      };
    });

    // Sort conversations by last message date
    return conversationList.sort((a, b) => 
      new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
    );
  }, [messages]);

  return {
    conversations,
    isLoading,
    error
  };
}

export function useConversationMessages(fromMsisdn: string | null) {
  const { data: allMessages = [] } = useInboxMessages();

  const messages = useMemo(() => {
    if (!fromMsisdn) return [];
    
    return allMessages
      .filter(message => message.from_msisdn === fromMsisdn)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [allMessages, fromMsisdn]);

  return messages;
}
