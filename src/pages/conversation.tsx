import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, FileText, Clock, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockConversations, mockTemplates, type Message } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const getChannelIcon = (channel: string) => {
  const icons = {
    email: "📧",
    whatsapp: "💬", 
    phone: "📞"
  };
  return icons[channel as keyof typeof icons] || "📧";
};

const formatMessageTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const generateAIReply = (conversation: any) => {
  // Mock AI reply generation based on conversation context
  const lastMessage = conversation.messages[conversation.messages.length - 1]?.content || "";
  
  if (lastMessage.toLowerCase().includes("wifi") || lastMessage.toLowerCase().includes("password")) {
    return `Hi ${conversation.tenantName}! The WiFi network for ${conversation.propertyName} is "OakwoodResident" and the password is "Oak2024WiFi!". Let me know if you need any other information!`;
  }
  
  if (lastMessage.toLowerCase().includes("maintenance") || lastMessage.toLowerCase().includes("repair")) {
    return `Hi ${conversation.tenantName}, I've received your maintenance request. I'll have our team schedule a visit within the next 24-48 hours. I'll send you a confirmation with the exact time window soon. Thank you for reporting this!`;
  }
  
  return `Hi ${conversation.tenantName}, thank you for your message. I'll look into this and get back to you shortly. Please let me know if you have any other questions or concerns.`;
};

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const [replyText, setReplyText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { toast } = useToast();
  
  const conversation = mockConversations.find(conv => conv.id === id);
  
  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Conversation not found</h2>
          <Link to="/">
            <Button>Back to Inbox</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAIQuickWrite = () => {
    const aiReply = generateAIReply(conversation);
    setReplyText(aiReply);
  };

  const handleTemplateSelect = (template: any) => {
    // Simple template replacement - in real app, this would be more sophisticated
    let content = template.content;
    content = content.replace("{TenantName}", conversation.tenantName);
    content = content.replace("{PropertyName}", conversation.propertyName);
    content = content.replace("{RentAmount}", "1,350");
    content = content.replace("{DueDate}", "1st of the month");
    content = content.replace("{WiFiNetwork}", "OakwoodResident");
    content = content.replace("{WiFiPassword}", "Oak2024WiFi!");
    content = content.replace("{TrashSchedule}", "Tuesday and Friday mornings");
    
    setReplyText(content);
    setShowTemplates(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // In real app, this would send the message and update the conversation
    console.log("Sending reply:", replyText);
    setReplyText("");
    toast({
      title: "Message sent",
      description: "Your reply has been sent successfully.",
    });
  };

  const handleSendEmail = async () => {
    if (!replyText.trim()) return;
    
    setIsEmailSending(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: "solovastrucezar@gmail.com", // You can make this dynamic based on conversation
          subject: `Message from Property Management - ${conversation.propertyName}`,
          body: `Tenant: ${conversation.tenantName}\nProperty: ${conversation.propertyName}\n\nMessage:\n${replyText}`
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent successfully",
        description: "Your message has been sent via email.",
      });
      
      setReplyText("");
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast({
        title: "Failed to send email",
        description: error.message || "There was an error sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inbox
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getChannelIcon(conversation.channel)}</div>
              <div>
                <h1 className="text-xl font-semibold">{conversation.tenantName}</h1>
                <p className="text-sm text-muted-foreground">{conversation.propertyName}</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {conversation.channel}
          </Badge>
        </div>
        
        {/* AI Summary */}
        <Card className="mt-4 bg-primary-muted/20 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              AI Summary
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground">{conversation.aiSummary}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "me" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-lg p-4 shadow-soft",
                message.sender === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-xs opacity-70">
                  {message.sender === "me" ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <span>{conversation.tenantName}</span>
                  )}
                  <Clock className="w-3 h-3 ml-2" />
                  {formatMessageTime(message.timestamp)}
                </div>
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Reply Section */}
      <div className="border-t border-border bg-card p-4">
        {/* Templates dropdown */}
        {showTemplates && (
          <Card className="mb-4 max-h-48 overflow-y-auto">
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium">Quick Templates</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {template.content.substring(0, 80)}...
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
        
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIQuickWrite}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Quick Write
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Templates
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
          />
          <div className="flex flex-col gap-2 self-end">
            <Button
              onClick={handleSendEmail}
              disabled={!replyText.trim() || isEmailSending}
              variant="outline"
              size="sm"
            >
              <Mail className="w-4 h-4" />
              {isEmailSending ? "Sending..." : "Email"}
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}