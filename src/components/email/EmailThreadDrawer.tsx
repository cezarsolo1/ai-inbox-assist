import { useEffect, useMemo, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEmailThreadMessages, type EmailThread } from "@/hooks/useEmailThreads";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailThreadDrawerProps {
  thread: EmailThread | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailThreadDrawer({ thread, isOpen, onClose }: EmailThreadDrawerProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { data: messages = [], refetch } = useEmailThreadMessages(thread?.id);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // small delay to ensure DOM painted
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
    }
  }, [isOpen, messages.length]);

  const myEmail = "you@yourcompany.com"; // No auth for now

  const isOutgoing = (email: string) => email.toLowerCase() === myEmail.toLowerCase();

  const participantEmail = useMemo(() => {
    return thread?.participant_email || "";
  }, [thread]);

  if (!isOpen || !thread) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-background border-l border-border transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{thread.subject}</h2>
            <p className="text-xs text-muted-foreground truncate">{participantEmail}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close details">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Conversation */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {messages.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">No messages in this thread yet.</Card>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`group flex ${isOutgoing(m.from_email) ? "justify-end" : "justify-start"} items-start gap-2`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                    isOutgoing(m.from_email)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border"
                  }`}
                >
                  {!isOutgoing(m.from_email) && (
                    <p className="text-[11px] text-muted-foreground mb-1">{m.from_email}</p>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
                  <div className={`mt-1 text-[10px] ${isOutgoing(m.from_email) ? "opacity-90" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.functions.invoke("email-delete-message", {
                        body: { id: m.id },
                      });
                      if (error) throw error;
                      toast({ title: "Email deleted" });
                      refetch();
                    } catch (e: any) {
                      console.error("Failed to delete email:", e);
                      toast({ title: "Failed to delete email", description: e?.message ?? "", variant: "destructive" });
                    }
                  }}
                  aria-label="Delete email"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer meta */}
        <div className="p-3 border-t border-border bg-background flex items-center justify-between">
          <Badge variant="outline">{messages.length} messages</Badge>
          <span className="text-xs text-muted-foreground">Read-only</span>
        </div>
      </div>
    </div>
  );
}
