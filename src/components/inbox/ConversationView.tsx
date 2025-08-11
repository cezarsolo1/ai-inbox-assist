import { ArrowLeft, MessageCircle, Paperclip, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { InboxMessage } from "@/hooks/useInboxMessages";

interface ConversationViewProps {
  messages: InboxMessage[];
  contactName: string;
  contactNumber: string;
  onBack: () => void;
}

const formatTime = (date: string) => {
  const messageDate = new Date(date);
  return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: string) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString();
  }
};

function MessageBubble({ message }: { message: InboxMessage }) {
  const hasMedia = message.media && message.media.length > 0 && message.media.some(url => url && url.trim() !== "");
  
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 bg-whatsapp-accent rounded-full flex items-center justify-center">
        <MessageCircle className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <Card className={cn(
          "p-3 max-w-[80%]",
          !message.seen && "border-primary/50 bg-primary-muted/10"
        )}>
          <div className="space-y-2">
            {message.body && (
              <p className="text-sm">{message.body}</p>
            )}
            {hasMedia && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                <span>Media attachment</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
              {!message.seen && (
                <Badge variant="secondary" className="text-xs">New</Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ConversationView({ messages, contactName, contactNumber, onBack }: ConversationViewProps) {
  // Group messages by date
  const messagesByDate = messages.reduce((acc, message) => {
    const date = formatDate(message.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, InboxMessage[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold">{contactName}</h2>
          <p className="text-sm text-muted-foreground">{contactNumber}</p>
        </div>
        <Badge variant="outline">
          {messages.length} messages
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(messagesByDate).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex items-center justify-center mb-4">
                <Badge variant="outline" className="bg-background">
                  {date}
                </Badge>
              </div>
              <div className="space-y-0">
                {dateMessages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}