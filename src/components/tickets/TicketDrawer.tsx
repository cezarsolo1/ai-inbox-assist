import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, AlertCircle, User, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateTicketStatus } from "@/hooks/useTickets";
import { useTranslation } from "@/hooks/useTranslation";
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
    case "pending":
      return "default";
    case "scheduling":
      return "secondary";
    case "work_date_scheduled":
      return "outline";
    case "confirming_completion":
      return "secondary";
    case "getting_invoice":
      return "default";
    case "completed":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
};

export function TicketDrawer({ ticket, isOpen, onClose }: TicketDrawerProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const translatePriority = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return t("priority.high");
      case "medium": return t("priority.medium");
      case "low": return t("priority.low");
      default: return priority;
    }
  };

  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return t("ticketStatus.pending");
      case "scheduling": return t("ticketStatus.scheduling");
      case "work_date_scheduled": return t("ticketStatus.workDateScheduled");
      case "confirming_completion": return t("ticketStatus.confirmingCompletion");
      case "getting_invoice": return t("ticketStatus.gettingInvoice");
      case "completed": return t("ticketStatus.completed");
      case "cancelled": return t("ticketStatus.cancelled");
      default: return status;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticket) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      toast({
        title: t("drawer.success"),
        description: t("drawer.ticketStatusUpdated"),
      });
      // The query will auto-refresh and update the UI
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("drawer.failedToUpdate"),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
              {translatePriority(ticket.priority)} {t("ticketDetail.priority").toLowerCase()}
            </Badge>
            <Badge variant={getStatusColor(ticket.status)}>
              {translateStatus(ticket.status)}
            </Badge>
            <Badge variant="outline">
              {ticket.category}
            </Badge>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Status Update */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("drawer.updateStatus")}</h3>
            <Select 
              value={ticket.status} 
              onValueChange={handleStatusUpdate}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("drawer.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("ticketStatus.pending")}</SelectItem>
                <SelectItem value="scheduling">{t("ticketStatus.scheduling")}</SelectItem>
                <SelectItem value="work_date_scheduled">{t("ticketStatus.workDateScheduled")}</SelectItem>
                <SelectItem value="confirming_completion">{t("ticketStatus.confirmingCompletion")}</SelectItem>
                <SelectItem value="getting_invoice">{t("ticketStatus.gettingInvoice")}</SelectItem>
                <SelectItem value="completed">{t("ticketStatus.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("ticketStatus.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("ticketDetail.description")}</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("drawer.details")}</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {ticket.property_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("drawer.property")}:</span>
                  <span>{ticket.property_address}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("drawer.tenantId")}:</span>
                <span className="font-mono text-xs">{ticket.tenant_id}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("drawer.created")}:</span>
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              </div>
              
              {ticket.updated_at !== ticket.created_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("drawer.updated")}:</span>
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