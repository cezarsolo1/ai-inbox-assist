import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, FileText, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function VendorConfirmationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("needs to be replaced");
  const [vendorInstructions, setVendorInstructions] = useState("Need to replace garbage disposal.");

  // Mock data - replace with real data fetching based on jobId
  const jobData = {
    pmCompany: "Churchill Properties Associated",
    workOrderNumber: "30-480",
    permissionToEnter: "No",
    maxBudget: "$300",
    jobName: "Broken garbage disposal",
    jobSite: {
      address: "999 Nine St.",
      city: "Northridge, CA 91326"
    },
    tenants: [
      {
        name: "Ethan Malcolm Awesome",
        phone: "(555) 839-8475",
        email: "ethan+malcolmawesome@latchel.com"
      }
    ],
    attachments: []
  };

  const handleScheduleSelect = () => {
    // Handle vendor acceptance
    console.log("Vendor accepted job:", jobId);
    // Navigate to success page or back to vendor dashboard
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
              <span className="text-foreground">{jobData.pmCompany}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Work Order Number</span>
              <span className="text-foreground">{jobData.workOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permission to Enter?</span>
              <span className="text-foreground">{jobData.permissionToEnter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Budget</span>
              <span className="text-foreground">{jobData.maxBudget}</span>
            </div>
          </div>
        </div>

        {/* Job Name */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Job Name</h2>
          <p className="text-foreground">{jobData.jobName}</p>
        </div>

        {/* Job Site */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Job Site</h2>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-foreground">{jobData.jobSite.address}</p>
              <p className="text-muted-foreground">{jobData.jobSite.city}</p>
            </div>
          </div>
        </div>

        {/* Tenants */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">Tenants</h2>
          {jobData.tenants.map((tenant, index) => (
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
          {jobData.attachments.length === 0 ? (
            <p className="text-muted-foreground">No attachments</p>
          ) : (
            <div className="space-y-2">
              {jobData.attachments.map((attachment, index) => (
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