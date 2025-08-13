import { Mail, Paperclip, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/hooks/useEmailThreads";

interface EmailThreadRowProps {
  thread: EmailThread;
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

export function EmailThreadRow({ thread, onClick }: EmailThreadRowProps) {
  const hasAttachments = (thread.last_message?.attachments || []).length > 0;
  const hasUnread = thread.unread_count > 0;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-medium border-l-4",
        hasUnread ? "border-l-primary bg-primary-muted/20" : "border-l-transparent",
        "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-accent" />
            <h3 className={cn("text-sm font-medium truncate", hasUnread && "font-semibold")}>
              {thread.subject}
            </h3>
            {hasUnread && <Badge variant="default" className="text-xs px-2 py-1">{thread.unread_count}</Badge>}
            {hasAttachments && <Paperclip className="w-3 h-3 text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mb-2 truncate">
            Email • {thread.participant_email} • {thread.message_count} messages
          </p>
          <p className={cn("text-sm truncate", hasUnread ? "text-foreground font-medium" : "text-muted-foreground")}
          >
            {thread.last_message?.body || "(No text content)"}
          </p>
        </div>
        <div className="flex items-center text-xs text-muted-foreground ml-4">
          <Clock className="w-3 h-3 mr-1" />
          {formatTimeAgo(thread.last_message?.created_at || thread.updated_at)}
        </div>
      </div>
    </Card>
  );
}
