import { useState } from "react";
import { Search, Filter, MessageCircle, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { markMessageAsSeen, type InboxMessage } from "@/hooks/useInboxMessages";
import { useConversations, useConversationMessages } from "@/hooks/useConversations";
import { ConversationRow, type Conversation } from "@/components/inbox/ConversationRow";
import ConversationView from "@/components/inbox/ConversationView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailRow, type EmailMessage } from "@/components/email/EmailRow";
import { EmailDetailsDrawer } from "@/components/email/EmailDetailsDrawer";
import { Link } from "react-router-dom";

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "hasMedia">("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    conversations, 
    isLoading, 
    error 
  } = useConversations({
    search: searchTerm,
    hasMedia: selectedFilter === "hasMedia",
    unread: selectedFilter === "unread",
  });

  const conversationMessages = useConversationMessages(selectedConversation?.from_msisdn || null);

  const handleConversationClick = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark all unread messages in this conversation as seen
    if (conversation.unread_count > 0) {
      try {
        const unreadMessages = conversationMessages.filter(m => !m.seen);
        await Promise.all(unreadMessages.map(message => markMessageAsSeen(message.id)));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to mark messages as seen",
          variant: "destructive",
        });
      }
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  const handleMessageDeleted = () => {
    // Force refresh of conversations and messages
    window.location.reload();
  };

  const emailMessages: EmailMessage[] = [
    {
      id: "demo-1",
      from: "alex.tenant@example.com",
      to: "you@yourcompany.com",
      subject: "Leaky faucet in unit 12B",
      snippet: "Hi, there's a small leak in the kitchen sink...",
      body:
        "Hi team,\n\nThere's a small leak in the kitchen sink in unit 12B. Could someone take a look this week?\n\nThanks,\nAlex",
      attachments: [{ name: "photo.jpg" }],
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      seen: false,
    },
  ];

  const handleEmailClick = (message: EmailMessage) => {
    setSelectedEmail(message);
    setIsEmailDrawerOpen(true);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load inbox messages",
      variant: "destructive",
    });
  }

  return (
    <Tabs defaultValue="whatsapp" className="h-full w-full">
      <TabsList className="m-4">
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>

      <TabsContent value="whatsapp" className="h-[calc(100%-3.5rem)]">
        <div className="flex h-full relative">
          {!selectedConversation ? (
            <>
              {/* Conversation List */}
              <div className="w-1/2 border-r border-border bg-gradient-card">
                {/* Header */}
                <div className="p-6 border-b border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold text-foreground">Conversations (WhatsApp)</h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary-muted text-primary">
                        {conversations.length} conversations
                      </Badge>
                      <Link to="/inbox/setup">
                        <Button variant="outline" size="sm">
                          Setup
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex gap-2">
                    <Button
                      variant={selectedFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedFilter === "unread" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("unread")}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Unread
                    </Button>
                    <Button
                      variant={selectedFilter === "hasMedia" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("hasMedia")}
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      Has Media
                    </Button>
                  </div>
                </div>
                
                {/* Conversation List */}
                <div className="overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Send a WhatsApp message to your Twilio number</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {conversations.map((conversation) => (
                        <ConversationRow
                          key={conversation.id}
                          conversation={conversation}
                          onClick={() => handleConversationClick(conversation)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Empty State */}
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
                  <p>Choose a conversation from the list to view messages</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <ConversationView
                contactName={selectedConversation.profile_name || selectedConversation.from_msisdn}
                contactNumber={selectedConversation.from_msisdn}
                onBack={handleBackToConversations}
                onMessageDeleted={handleMessageDeleted}
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="email" className="h-[calc(100%-3.5rem)]">
        <div className="flex h-full relative">
          {/* Email List */}
          <div className="w-1/2 border-r border-border bg-gradient-card">
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-foreground">Inbox (Email)</h1>
                <Badge variant="secondary" className="bg-primary-muted text-primary">
                  {emailMessages.length} conversation
                </Badge>
              </div>
            </div>
            <div className="overflow-y-auto">
              <div className="p-4 space-y-2">
                {emailMessages.map((m) => (
                  <EmailRow key={m.id} message={m} onClick={() => handleEmailClick(m)} />
                ))}
              </div>
            </div>
          </div>

          {/* Email Empty State */}
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Select a message</h2>
              <p>Choose a message from the list to view details</p>
            </div>
          </div>

          {/* Email Details Drawer */}
          <EmailDetailsDrawer
            message={selectedEmail}
            isOpen={isEmailDrawerOpen}
            onClose={() => setIsEmailDrawerOpen(false)}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}