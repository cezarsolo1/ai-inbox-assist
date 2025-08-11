import { X, Paperclip, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EmailMessage } from "./EmailRow";

interface EmailDetailsDrawerProps {
  message: EmailMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailDetailsDrawer({ message, isOpen, onClose }: EmailDetailsDrawerProps) {
  if (!isOpen || !message) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-background border-l border-border transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Email Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Headers</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Subject: </span>
                <span>{message.subject}</span>
              </div>
              <div>
                <span className="text-muted-foreground">From: </span>
                <span>{message.from}</span>
              </div>
              <div>
                <span className="text-muted-foreground">To: </span>
                <span>{message.to}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(message.created_at).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-2">Body</h3>
            <div className="text-sm whitespace-pre-wrap">{message.body}</div>
          </Card>

          {message.attachments && message.attachments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Attachments ({message.attachments.length})
              </h3>
              <div className="space-y-2">
                {message.attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                    <span className="truncate mr-2">{att.name}</span>
                    {att.url && (
                      <Button size="sm" variant="secondary" asChild>
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
