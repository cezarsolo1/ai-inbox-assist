import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, X, Search, Phone, Mail } from "lucide-react";
import { sendWhatsAppReply } from "@/lib/sendOutbound";
import { FRISO_PHONE_NUMBER } from "@/lib/config";
import { toast } from "sonner";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [searchVendor, setSearchVendor] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [useRecommendedVendor, setUseRecommendedVendor] = useState(true);

  // Vendor data with descriptions
  const vendorData = {
    "altijd-omhoog": {
      id: "altijd-omhoog",
      name: "Altijd Omhoog B.V.",
      description: "Professional maintenance and repair services with 15+ years of experience. Specialized in residential and commercial property maintenance, plumbing, electrical work, and general repairs. Known for reliable service and competitive pricing.",
      phone: "+31 6 12345678",
      email: "info@altijdomhoog.nl"
    },
    "ghengis-plumbing": {
      id: "ghengis-plumbing",
      name: "Ghengis Plumbing",
      description: "Expert plumbing services for residential and commercial properties. Licensed professionals with 24/7 emergency service availability.",
      phone: "(510) 557-4475",
      email: "contact@ghengisplumbing.com"
    },
    "quickfix-services": {
      id: "quickfix-services", 
      name: "QuickFix Services",
      description: "Fast and reliable repair services covering electrical, plumbing, HVAC, and general maintenance. Same-day service available for urgent repairs.",
      phone: "(415) 555-0199",
      email: "info@quickfix.com"
    },
    "abc-maintenance": {
      id: "abc-maintenance",
      name: "ABC Maintenance",
      description: "Comprehensive property maintenance solutions including preventive maintenance, emergency repairs, and facility management services.",
      phone: "(650) 555-0156",
      email: "service@abcmaintenance.com"
    }
  };

  // Set recommended vendor on mount
  useEffect(() => {
    if (useRecommendedVendor) {
      setSelectedCompany("altijd-omhoog");
      setSearchVendor("Altijd Omhoog B.V.");
    }
  }, [useRecommendedVendor]);

  const companies = Object.values(vendorData);
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchVendor.toLowerCase())
  );

  const selectedCompanyData = selectedCompany ? vendorData[selectedCompany as keyof typeof vendorData] : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleVendorSubmit = async () => {
    if (selectedCompany && selectedCompanyData && !isSending) {
      setIsSending(true);
      
      try {
        // Show sending state in UI
        toast.loading("Sending notification to vendor...", { id: "vendor-notification" });
        
        // Send WhatsApp message to Friso
        const message = `You have 1 job that needs to be scheduled. Company: ${selectedCompanyData.name}. Please go to this link to schedule: https://preview--blocklane-contractor.lovable.app/plan. The code is 39303.`;
        
        // Send the WhatsApp message
        const messageId = await sendWhatsAppReply({
          to: FRISO_PHONE_NUMBER,
          text: message,
          threadId: id,
          tenantId: ticket?.tenant_id || undefined
        });

        // Success - message has been sent AND saved to conversation
        toast.success("Notification sent to vendor successfully!", { id: "vendor-notification" });
        console.log("Vendor assigned and notified for job:", id, "Message ID:", messageId);
        
        // Update ticket status to scheduling after successful vendor notification
        if (ticket?.id) {
          try {
            const { error: updateError } = await supabase
              .from("tickets")
              .update({ status: "scheduling" })
              .eq("id", ticket.id);
            
            if (updateError) {
              console.error("Failed to update ticket status:", updateError);
              toast.error("Vendor notified but failed to update ticket status");
            } else {
              toast.success("Ticket moved to scheduling status");
            }
          } catch (statusError) {
            console.error("Error updating ticket status:", statusError);
          }
        }
        
        // Reset modal state
        setIsVendorModalOpen(false);
        setSelectedCompany("");
        setSearchVendor("");
        setUseRecommendedVendor(true);
      } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        toast.error("Failed to send notification to vendor. Please try again.", { id: "vendor-notification" });
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleSearchForDifferentVendor = () => {
    setUseRecommendedVendor(false);
    setSelectedCompany("");
    setSearchVendor("");
  };

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full bg-background">
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
            <Button 
              className="bg-primary text-primary-foreground"
              onClick={() => setIsVendorModalOpen(true)}
            >
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

          {/* Tab Navigation */}
          <TabsList className="w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Content with proper top margin */}
      <div className="flex-1 mt-[320px]">
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="h-full pt-6">
              <TabsContent value="details" className="flex-1 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Panel - Ticket Details */}
                  <div className="space-y-4">
                    {/* Description Section */}
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
                            <div className="text-sm text-foreground mb-4">
                              {ticket.description || "needs to be replaced"}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>

                    {/* Property Section */}
                    <Card>
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-base flex items-center justify-between">
                              Property
                              <ChevronDown className="h-4 w-4" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {ticket.property_address || "999 Nine St. 9"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Noord Holland
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>

                    {/* Permission to Enter Section */}
                    <Card>
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-base flex items-center justify-between">
                              Permission to Enter
                              <ChevronDown className="h-4 w-4" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-foreground">The vendor does not have permission to enter.</span>
                              <div className="w-10 h-6 bg-muted rounded-full flex items-center">
                                <div className="w-4 h-4 bg-background rounded-full ml-1"></div>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>

                    {/* Access Instructions Section */}
                    <Card>
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-base flex items-center justify-between">
                              Access Instructions
                              <ChevronDown className="h-4 w-4" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              Add access instructions...
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>

                    {/* Tenant Section */}
                    <Card>
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-base flex items-center justify-between">
                              Tenant
                              <ChevronDown className="h-4 w-4" />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">CS</span>
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">Cezar Solovastru</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    +31681874782
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    solovastrucezar@gmail.com
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  </div>

                  {/* Right Panel - Notes & Tasks */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">New Note</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Leave a note here..."
                            className="min-h-[120px] resize-none"
                          />
                          <div className="text-xs text-muted-foreground">
                            (Creating a note does not notify Blocklane)
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm">Save Note</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card>
                      <CardContent className="pt-6">
                        <Tabs defaultValue="all-activity" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all-activity">All Activity</TabsTrigger>
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                            <TabsTrigger value="emails">Emails</TabsTrigger>
                          </TabsList>
                          <TabsContent value="all-activity" className="mt-4">
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    State Changed To: Scheduling with Vendor
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Jul 27, 2018 11:19 AM | Created by Ethan L
                                  </div>
                                </div>
                              </div>
                              {/* Add more activity items for demo */}
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    Ticket Created
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Jul 27, 2018 11:00 AM | Created by System
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    Priority Set to High
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Jul 27, 2018 11:05 AM | Created by Admin
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    Note Added: Initial assessment needed
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Jul 27, 2018 11:10 AM | Created by Manager
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    Vendor Assignment Pending
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Jul 27, 2018 11:15 AM | Created by System
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    Budget Approval Requested
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Jul 27, 2018 11:20 AM | Created by Finance
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="tasks" className="mt-4">
                            <div className="text-sm text-muted-foreground">No tasks yet</div>
                          </TabsContent>
                          <TabsContent value="emails" className="mt-4">
                            <div className="text-sm text-muted-foreground">No emails yet</div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
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
          </div>
        </ScrollArea>
      </div>

      {/* Vendor Assignment Modal */}
      <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {useRecommendedVendor ? (
              /* Recommended Vendor Display */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground mb-2">Recommended Vendor</div>
                  <div className="text-lg font-bold text-primary">Altijd Omhoog B.V.</div>
                </div>

                {/* Company Details Card */}
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start gap-3">
                    {/* Avatar Circle */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {getInitials("Altijd Omhoog B.V.")}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="font-medium text-sm">Altijd Omhoog B.V.</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          +31 6 12345678
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          info@altijdomhoog.nl
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Description */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      Professional maintenance and repair services with 15+ years of experience. Specialized in residential and commercial property maintenance, plumbing, electrical work, and general repairs. Known for reliable service and competitive pricing.
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleVendorSubmit}
                    disabled={isSending}
                    className="bg-primary text-primary-foreground w-full"
                  >
                    {isSending ? "Sending..." : "Assign Altijd Omhoog B.V."}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSearchForDifferentVendor}
                    className="w-full"
                  >
                    Search for Different Vendor
                  </Button>
                </div>
              </div>
            ) : (
              /* Company Search Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Search for Vendor:
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for a vendor..."
                      value={searchVendor}
                      onChange={(e) => setSearchVendor(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Company Dropdown */}
                  {searchVendor && (
                    <div className="space-y-1 max-h-[120px] overflow-y-auto border rounded-lg">
                      {filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          className={`p-2 cursor-pointer hover:bg-muted/50 ${
                            selectedCompany === company.id ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => {
                            setSelectedCompany(company.id);
                            setSearchVendor(company.name);
                          }}
                        >
                          {company.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Company Details */}
                {selectedCompanyData && (
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      {/* Avatar Circle */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {getInitials(selectedCompanyData.name)}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="font-medium text-sm">{selectedCompanyData.name}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {selectedCompanyData.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {selectedCompanyData.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Company Description */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm text-muted-foreground">
                        {selectedCompanyData.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmation Text */}
                {selectedCompanyData && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">By submitting this action:</div>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>This job will be assigned to {selectedCompanyData.name}.</li>
                      <li>We will send a message to the vendor asking them to schedule this job.</li>
                    </ul>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleVendorSubmit}
                    disabled={!selectedCompany || isSending}
                    className="bg-primary text-primary-foreground"
                  >
                    {isSending ? "Sending..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}