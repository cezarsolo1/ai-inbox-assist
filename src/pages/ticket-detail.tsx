import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type Ticket } from "@/hooks/useTickets";

function getPriorityColor(priority: string): "default" | "secondary" | "destructive" | "outline" {
  switch (priority.toLowerCase()) {
    case "high":
    case "emergency":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "default";
  }
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [noteTab, setNoteTab] = useState("new-note");
  const [noteText, setNoteText] = useState("");
  const [makeNoteVisible, setMakeNoteVisible] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      if (!id) throw new Error("No ticket ID provided");
      
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Ticket;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Ticket not found</div>
      </div>
    );
  }

  const progressSteps = [
    "Pending",
    "Scheduling", 
    "Work Date Scheduled",
    "Confirming Completion",
    "Getting Invoice",
    "Completed",
    "Cancelled"
  ];

  const currentStepIndex = progressSteps.indexOf(ticket.status.replace('_', ' '));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          {/* Header Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-sm text-muted-foreground">Work Order</div>
              <h1 className="text-xl font-semibold text-foreground">
                {ticket.id.slice(0, 8)}
              </h1>
            </div>
          </div>

          {/* Title and Priority */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground mb-2">{ticket.title}</h2>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Priority</div>
                <Badge variant={getPriorityColor(ticket.priority)} className="capitalize">
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={ticket.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Search for a job trade category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Approved Budget</label>
              <div className="flex items-center gap-1">
                <span className="text-sm">$</span>
                <Input placeholder="200" className="text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Hard Budget Limit</label>
              <div className="flex items-center gap-1">
                <span className="text-sm">$</span>
                <Input placeholder="1000" className="text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Scheduled Work Date</label>
              <Input placeholder="Not scheduled yet" className="text-sm" />
            </div>
          </div>

          {/* Action Button and Progress */}
          <div className="flex items-center justify-between mb-4">
            <Button className="bg-primary text-primary-foreground">
              Take Action
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {progressSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    index <= currentStepIndex 
                      ? 'bg-primary border-primary' 
                      : 'bg-background border-muted-foreground'
                  }`} />
                  {index === currentStepIndex && (
                    <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                      {step === "work_date_scheduled" ? "Work Date Scheduled" : step}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content with proper top margin */}
      <div className="flex-1 mt-[280px] overflow-hidden">
        <div className="h-full">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-fit ml-4 mt-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Panel - Description */}
                <Card>
                  <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center justify-between">
                          Description
                          <ChevronDown className={`h-4 w-4 transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`} />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <Textarea 
                          value={ticket.description || ""}
                          placeholder="Enter description..."
                          className="min-h-[200px] resize-none"
                        />
                        <div className="mt-4 text-sm text-muted-foreground">
                          <div className="font-medium mb-2">Call Log Details:</div>
                          <div className="space-y-1 text-xs">
                            <div>Maintenance Coordinator: Do you have a clogged toilet?</div>
                            <div>Tenant: Yes</div>
                            <div>Maintenance Coordinator: Have you tried to plunge it?</div>
                            <div>Tenant: Yes</div>
                            <div>Maintenance Coordinator: Is this the only toilet in the house?</div>
                            <div>Tenant: Yes</div>
                            <div>Maintenance Coordinator: Can this issue wait until the next business day?</div>
                            <div>Tenant: No</div>
                          </div>
                          <div className="mt-4">
                            <div className="font-medium">Description added by operator:</div>
                            <div className="text-xs">Only toilet in home is clogged. Tenant tried to plunge already but nothing has worked.</div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Right Panel - Notes/Tasks */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={noteTab === "new-note" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setNoteTab("new-note")}
                      >
                        New Note
                      </Button>
                      <Button
                        variant={noteTab === "new-task" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setNoteTab("new-task")}
                      >
                        New Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {noteTab === "new-note" && (
                      <div className="space-y-4">
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Leave a note here..."
                          className="min-h-[120px]"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="visible-note"
                              checked={makeNoteVisible}
                              onCheckedChange={(checked) => setMakeNoteVisible(checked === true)}
                            />
                            <label htmlFor="visible-note" className="text-sm">
                              Make note visible
                            </label>
                          </div>
                          <Button size="sm">Save Note</Button>
                        </div>
                      </div>
                    )}

                    {noteTab === "new-task" && (
                      <div className="space-y-4">
                        <Input placeholder="Task title..." />
                        <Textarea placeholder="Task description..." className="min-h-[120px]" />
                        <Button size="sm">Create Task</Button>
                      </div>
                    )}

                    {/* Activity Feed */}
                    <div className="mt-6">
                      <Tabs defaultValue="all-activity" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="all-activity">All Activity</TabsTrigger>
                          <TabsTrigger value="emails">Emails</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all-activity" className="mt-4">
                          <div className="space-y-3">
                            <div className="border-l-2 border-muted pl-4">
                              <div className="text-sm font-medium">Email sent: Emergency WorkOrder - Ops Notification</div>
                              <div className="text-xs text-muted-foreground">Feb 1, 2019 10:32 AM | Created by System</div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="emails" className="mt-4">
                          <div className="text-sm text-muted-foreground">No emails yet</div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="files" className="flex-1 p-4">
              <div className="text-muted-foreground">Files content coming soon</div>
            </TabsContent>

            <TabsContent value="reviews" className="flex-1 p-4">
              <div className="text-muted-foreground">Reviews content coming soon</div>
            </TabsContent>

            <TabsContent value="invoice" className="flex-1 p-4">
              <div className="text-muted-foreground">Invoice content coming soon</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}