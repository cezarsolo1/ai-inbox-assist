import { Mail, Paperclip, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type EmailMessage = {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  attachments?: { name: string; url?: string }[];
  created_at: string;
  seen: boolean;
};

interface EmailRowProps {
  message: EmailMessage;
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

export function EmailRow({ message, onClick }: EmailRowProps) {
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-medium border-l-4",
        !message.seen ? "border-l-primary bg-primary-muted/20" : "border-l-transparent",
        "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-accent" />
            <h3 className={cn("text-sm font-medium truncate", !message.seen && "font-semibold")}>{message.subject}</h3>
            {!message.seen && <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />}
            {hasAttachments && <Paperclip className="w-3 h-3 text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mb-2 truncate">From • {message.from}</p>
          <p className={cn("text-sm truncate", !message.seen ? "text-foreground font-medium" : "text-muted-foreground")}>{message.snippet}</p>
        </div>
        <div className="flex items-center text-xs text-muted-foreground ml-4">
          <Clock className="w-3 h-3 mr-1" />
          {formatTimeAgo(message.created_at)}
        </div>
      </div>
    </Card>
  );
}
