import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, FileText, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/hooks/useTickets";

export default function VendorConfirmationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [vendorInstructions, setVendorInstructions] = useState("");

  // Fetch the actual ticket data
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("No job ID provided");
      
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", jobId)
        .single();
      
      if (error) throw error;
      return data as Ticket;
    },
    enabled: !!jobId,
  });

  // Update job description and vendor instructions when ticket data loads
  useEffect(() => {
    if (ticket) {
      setJobDescription(ticket.description || "");
      setVendorInstructions(`Need to address: ${ticket.title}`);
    }
  }, [ticket]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading job details...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Job not found</div>
      </div>
    );
  }

  // Mock data for fields not in tickets table - this would come from other tables in a real app
  const vendorData = {
    pmCompany: "Churchill Properties Associated", // This would come from a properties/companies table
    workOrderNumber: ticket.id.slice(-6).toUpperCase(), // Generate from ticket ID
    permissionToEnter: "No", // This would be a field in the ticket or property table
    maxBudget: "$300", // This would be a field in the tickets table
    tenants: [
      {
        name: "Property Tenant", // This would come from a tenants table
        phone: "(555) 000-0000",
        email: "tenant@email.com"
      }
    ],
    attachments: [] // This would come from a ticket_attachments table
  };

  

  const handleScheduleSelect = () => {
    // Just navigate to scheduling page - no WhatsApp functionality
    console.log("Navigating to schedule selection for job:", jobId);
    navigate("/");
  };

  const handleFindSomeoneElse = () => {
    // Handle vendor decline
    console.log("Vendor declined job:", jobId);
    // Navigate back or to decline confirmation
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Please schedule</h1>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PM Company</span>
              <span className="text-foreground">{vendorData.pmCompany}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Work Order Number</span>
              <span className="text-foreground">{vendorData.workOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permission to Enter?</span>
              <span className="text-foreground">{vendorData.permissionToEnter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Budget</span>
              <span className="text-foreground">{vendorData.maxBudget}</span>
            </div>
          </div>
        </div>

        {/* Job Name */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Job Name</h2>
          <p className="text-foreground">{ticket.title}</p>
        </div>

        {/* Job Site */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Job Site</h2>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-foreground">{ticket.property_address || "Address not provided"}</p>
              <p className="text-muted-foreground">Priority: {ticket.priority} | Category: {ticket.category}</p>
            </div>
          </div>
        </div>

        {/* Tenants */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Tenants</h2>
          {vendorData.tenants.map((tenant, index) => (
            <div key={index} className="space-y-1">
              <p className="text-foreground font-medium">{tenant.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{tenant.email}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Job Description</h2>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        {/* Vendor Instructions */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Vendor Instructions</h2>
          <Textarea
            value={vendorInstructions}
            onChange={(e) => setVendorInstructions(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Attachments</h2>
          {vendorData.attachments.length === 0 ? (
            <p className="text-muted-foreground">No attachments</p>
          ) : (
            <div className="space-y-2">
              {vendorData.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>{attachment}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            onClick={handleScheduleSelect}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Select Schedule
          </Button>
          <Button 
            onClick={handleFindSomeoneElse}
            variant="outline"
            className="flex-1"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Find someone else for this job
          </Button>
        </div>
      </div>
    </div>
  );
}