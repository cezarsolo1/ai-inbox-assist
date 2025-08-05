import { useState } from "react";
import { Search, Filter, Mail, MessageCircle, Phone, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockConversations, type Conversation } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "email":
      return <Mail className="w-4 h-4 text-email-accent" />;
    case "whatsapp":
      return <MessageCircle className="w-4 h-4 text-whatsapp-accent" />;
    case "phone":
      return <Phone className="w-4 h-4 text-phone-accent" />;
    default:
      return <Mail className="w-4 h-4" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 24 * 60) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
  }
};

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "email" | "whatsapp" | "unread">("all");
  
  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "unread" && conv.unread) ||
                         conv.channel === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-1/2 border-r border-border bg-gradient-card">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
            <Badge variant="secondary" className="bg-primary-muted text-primary">
              {filteredConversations.length} conversations
            </Badge>
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
              variant={selectedFilter === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("email")}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button
              variant={selectedFilter === "whatsapp" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("whatsapp")}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/conversation/${conversation.id}`}
              className="block"
            >
              <Card className={cn(
                "m-4 p-4 transition-all hover:shadow-medium cursor-pointer border-l-4",
                conversation.unread 
                  ? "border-l-primary bg-primary-muted/20" 
                  : "border-l-transparent",
                "hover:bg-accent/50"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getChannelIcon(conversation.channel)}
                      <h3 className={cn(
                        "text-sm font-medium truncate",
                        conversation.unread && "font-semibold"
                      )}>
                        {conversation.tenantName}
                      </h3>
                      {conversation.unread && (
                        <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {conversation.propertyName}
                    </p>
                    <p className={cn(
                      "text-sm truncate",
                      conversation.unread 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground"
                    )}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground ml-4">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(conversation.lastMessageTime)}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
          <p>Choose a conversation from the list to view messages and respond</p>
        </div>
      </div>
    </div>
  );
}