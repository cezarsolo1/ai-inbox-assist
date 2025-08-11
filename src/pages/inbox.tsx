import { useState } from "react";
import { Search, Filter, MessageCircle, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useInboxMessages, markMessageAsSeen, type InboxMessage } from "@/hooks/useInboxMessages";
import { MessageRow } from "@/components/inbox/MessageRow";
import { MessageDetailsDrawer } from "@/components/inbox/MessageDetailsDrawer";
import { Link } from "react-router-dom";

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "hasMedia">("all");
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    data: messages = [], 
    isLoading, 
    error 
  } = useInboxMessages({
    search: searchTerm,
    hasMedia: selectedFilter === "hasMedia",
    unread: selectedFilter === "unread",
  });

  const handleMessageClick = async (message: InboxMessage) => {
    setSelectedMessage(message);
    setIsDrawerOpen(true);
    
    // Mark as seen if not already seen
    if (!message.seen) {
      try {
        await markMessageAsSeen(message.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to mark message as seen",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load inbox messages",
      variant: "destructive",
    });
  }

  return (
    <div className="flex h-full relative">
      {/* Message List */}
      <div className="w-1/2 border-r border-border bg-gradient-card">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">Inbox (WhatsApp)</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary-muted text-primary">
                {messages.length} messages
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
              placeholder="Search messages..."
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
        
        {/* Message List */}
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
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Send a WhatsApp message to your Twilio number</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {messages.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  onClick={() => handleMessageClick(message)}
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
          <h2 className="text-xl font-medium mb-2">Select a message</h2>
          <p>Choose a message from the list to view details</p>
        </div>
      </div>

      {/* Message Details Drawer */}
      <MessageDetailsDrawer
        message={selectedMessage}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}