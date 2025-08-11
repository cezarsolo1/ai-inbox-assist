import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Loader2, Bot, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConversationMessage, useConversationMessages } from "@/hooks/useConversationMessages";
import { sendWhatsAppReply } from "@/lib/sendOutbound";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface ConversationViewProps {
  contactName: string;
  contactNumber: string;
  onBack: () => void;
  onMessageDeleted?: () => void;
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

const MessageBubble = ({ message, onDelete }: { message: ConversationMessage; onDelete: () => void }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (message.direction === 'inbound') {
        await supabase.from('inbox_messages').delete().eq('id', message.id);
      } else {
        await supabase.from('outbound_messages').delete().eq('id', message.id);
      }
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete the message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isInbound = message.direction === 'inbound';
  const displayName = isInbound ? (message.counterparty || message.counterparty) : 'You';
  
  return (
    <div className={`flex items-start gap-3 p-4 border-b group ${!isInbound ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-1 ${!isInbound ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${!isInbound ? 'justify-end' : ''}`}>
          <span className="font-medium text-sm">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
        </div>
        
        {message.body && (
          <p className="text-sm text-foreground mb-2">{message.body}</p>
        )}
        
        {message.media && message.media.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            📎 {message.media.length} attachment(s)
          </div>
        )}
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function ConversationView({ 
  contactName, 
  contactNumber, 
  onBack, 
  onMessageDeleted 
}: ConversationViewProps) {
  const [replyText, setReplyText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();
  
  // Use the new unified conversation messages hook
  const { data: messages = [], refetch, isLoading } = useConversationMessages({
    counterparty: contactNumber
  });

  const handleSendMessage = async () => {
    const messageText = replyText || "";
    if (!messageText.trim()) return;
    
    setIsSending(true);
    try {
      await sendWhatsAppReply({
        to: contactNumber,
        body: messageText.trim()
      });

      toast({
        title: "Message sent",
        description: "Your WhatsApp message has been sent successfully.",
      });
      setReplyText("");
      refetch(); // Refresh the conversation to show the new message
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAIReply = async () => {
    if (messages.length === 0) return;
    
    setIsGeneratingAI(true);
    try {
      // Get the last inbound message for AI context
      const lastInboundMessage = messages.filter(m => m.direction === 'inbound').slice(-1)[0];
      
      const { data, error } = await supabase.functions.invoke('ai-draft-reply', {
        body: {
          lastMessage: lastInboundMessage?.body || "",
          contactName: contactName
        }
      });

      if (error) throw error;

      setReplyText(data.reply);
      toast({
        title: "AI reply generated",
        description: "An AI-powered reply has been generated for you.",
      });
    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ConversationMessage[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
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
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : Object.entries(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No messages yet
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="text-center py-2">
                <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                  {date}
                </span>
              </div>
              {dateMessages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  onDelete={() => {
                    refetch();
                    onMessageDeleted?.();
                  }} 
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Message Composer */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Textarea
            value={replyText || ""}
            onChange={(e) => setReplyText(e.target.value || "")}
            placeholder="Type your WhatsApp message..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIReply}
              disabled={isGeneratingAI || messages.length === 0}
            >
              {isGeneratingAI ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              AI
            </Button>
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={isSending || !(replyText || "").trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}