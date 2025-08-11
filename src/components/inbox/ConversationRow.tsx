import { MessageCircle, Paperclip, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InboxMessage } from "@/hooks/useInboxMessages";

export interface Conversation {
  id: string;
  from_msisdn: string;
  profile_name: string | null;
  last_message: InboxMessage;
  message_count: number;
  unread_count: number;
  has_media: boolean;
}

interface ConversationRowProps {
  conversation: Conversation;
  onClick: () => void;
}

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 24 * 60) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
  }
};

export function ConversationRow({ conversation, onClick }: ConversationRowProps) {
  const displayName = conversation.profile_name || conversation.from_msisdn;
  const hasUnread = conversation.unread_count > 0;

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-medium border-l-4",
        hasUnread 
          ? "border-l-primary bg-primary-muted/20" 
          : "border-l-transparent",
        "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-whatsapp-accent" />
            <h3 className={cn(
              "text-sm font-medium truncate",
              hasUnread && "font-semibold"
            )}>
              {displayName}
            </h3>
            {hasUnread && (
              <Badge variant="default" className="text-xs px-2 py-1">
                {conversation.unread_count}
              </Badge>
            )}
            {conversation.has_media && (
              <Paperclip className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2 truncate">
            WhatsApp • {conversation.from_msisdn} • {conversation.message_count} messages
          </p>
          <p className={cn(
            "text-sm truncate",
            hasUnread 
              ? "text-foreground font-medium" 
              : "text-muted-foreground"
          )}>
            {conversation.last_message.body || "(No text content)"}
          </p>
        </div>
        <div className="flex items-center text-xs text-muted-foreground ml-4">
          <Clock className="w-3 h-3 mr-1" />
          {formatTimeAgo(conversation.last_message.created_at)}
        </div>
      </div>
    </Card>
  );
}