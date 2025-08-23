import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, AlertCircle, User, X, Play, CheckCircle, ArrowRight, Pause } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateTicketStatus } from "@/hooks/useTickets";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/hooks/useTickets";

interface TicketDrawerProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "default";
    case "in-progress":
      return "secondary";
    case "resolved":
      return "outline";
    case "closed":
      return "secondary";
    default:
      return "default";
  }
};

export function TicketDrawer({ ticket, isOpen, onClose }: TicketDrawerProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticket) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getQuickActions = () => {
    if (!ticket) return [];
    
    const actions = [];
    
    switch (ticket.status) {
      case "open":
        actions.push({ 
          status: "in_progress", 
          label: "Start Work", 
          icon: Play, 
          color: "bg-blue-500 hover:bg-blue-600" 
        });
        actions.push({ 
          status: "pending", 
          label: "Set Pending", 
          icon: Pause, 
          color: "bg-yellow-500 hover:bg-yellow-600" 
        });
        break;
      case "in_progress":
        actions.push({ 
          status: "resolved", 
          label: "Mark Complete", 
          icon: CheckCircle, 
          color: "bg-green-500 hover:bg-green-600" 
        });
        actions.push({ 
          status: "pending", 
          label: "Set Pending", 
          icon: Pause, 
          color: "bg-yellow-500 hover:bg-yellow-600" 
        });
        break;
      case "pending":
        actions.push({ 
          status: "in_progress", 
          label: "Resume Work", 
          icon: Play, 
          color: "bg-blue-500 hover:bg-blue-600" 
        });
        actions.push({ 
          status: "resolved", 
          label: "Mark Complete", 
          icon: CheckCircle, 
          color: "bg-green-500 hover:bg-green-600" 
        });
        break;
      case "resolved":
        actions.push({ 
          status: "closed", 
          label: "Close Ticket", 
          icon: ArrowRight, 
          color: "bg-gray-500 hover:bg-gray-600" 
        });
        actions.push({ 
          status: "open", 
          label: "Reopen", 
          icon: ArrowRight, 
          color: "bg-orange-500 hover:bg-orange-600" 
        });
        break;
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  if (!ticket) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-left border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              {ticket.title}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={getPriorityColor(ticket.priority)}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {ticket.priority} priority
            </Badge>
            <Badge variant={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge variant="outline">
              {ticket.category}
            </Badge>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.status}
                    size="sm"
                    className={cn(
                      "text-white border-0",
                      action.color,
                      isUpdatingStatus && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleStatusUpdate(action.status)}
                    disabled={isUpdatingStatus}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Update Status</h3>
            <Select 
              value={ticket.status} 
              onValueChange={handleStatusUpdate}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Description</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Details</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {ticket.property_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Property:</span>
                  <span>{ticket.property_address}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tenant ID:</span>
                <span className="font-mono text-xs">{ticket.tenant_id}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              </div>
              
              {ticket.updated_at !== ticket.created_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}