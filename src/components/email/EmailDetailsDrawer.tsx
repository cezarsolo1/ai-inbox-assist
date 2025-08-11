import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { EmailMessage } from "./EmailRow";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EmailDetailsDrawerProps {
  message: EmailMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailDetailsDrawer({ message, isOpen, onClose }: EmailDetailsDrawerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const myEmail = user?.email || "you@yourcompany.com";

  const [composer, setComposer] = useState("");
  const [thread, setThread] = useState<EmailMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message) {
      // Initialize with the selected message as the first item of the conversation
      setThread([message]);
    } else {
      setThread([]);
    }
    setComposer("");
  }, [message]);

  useEffect(() => {
    // Auto-scroll to bottom when thread updates
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread, isOpen]);

  if (!isOpen || !message) return null;

  const isOutgoing = (m: EmailMessage) => m.from.toLowerCase() === myEmail.toLowerCase();

  const participantEmail = useMemo(() => {
    // Determine the other side of the conversation
    return message.from.toLowerCase() === myEmail.toLowerCase() ? message.to : message.from;
  }, [message, myEmail]);

  const handleSend = async () => {
    const body = composer.trim();
    if (!body) return;

    // Optimistic UI update
    const newMsg: EmailMessage = {
      id: `local-${Date.now()}`,
      from: myEmail,
      to: participantEmail,
      subject: message.subject,
      snippet: body.slice(0, 120),
      body,
      attachments: [],
      created_at: new Date().toISOString(),
      seen: true,
    };
    setThread((prev) => [...prev, newMsg]);
    setComposer("");

    try {
      const { error } = await supabase.functions.invoke("email-send-resend", {
        body: {
          to: participantEmail,
          subject: message.subject,
          body,
        },
      });
      if (error) throw error;
      toast({ title: "Email sent" });
    } catch (err: any) {
      toast({ title: "Failed to send email", description: err.message, variant: "destructive" });
      // Revert optimistic message on failure
      setThread((prev) => prev.filter((m) => m.id !== newMsg.id));
    }
  };

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
            <h2 className="text-lg font-semibold">{message.subject}</h2>
            <p className="text-xs text-muted-foreground truncate">{participantEmail}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close details">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Conversation */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {thread.map((m) => (
            <div key={m.id} className={`flex ${isOutgoing(m) ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  isOutgoing(m)
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                {!isOutgoing(m) && (
                  <p className="text-[11px] text-muted-foreground mb-1">{m.from}</p>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
                <div className={`mt-1 text-[10px] ${isOutgoing(m) ? "opacity-90" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-3 border-t border-border bg-background">
          <div className="space-y-2">
            <Textarea
              placeholder={`Reply to ${participantEmail}`}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="min-h-[88px]"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Sending from {myEmail}</div>
              <Button onClick={handleSend} disabled={!composer.trim()}>
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
