import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle, Play, Pause } from "lucide-react";
import { type Ticket, updateTicketStatus } from "@/hooks/useTickets";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

interface DraggableTicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  isDragging: boolean;
  showQuickActions?: boolean;
}

export function DraggableTicketCard({ ticket, onClick, isDragging, showQuickActions = true }: DraggableTicketCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  
  const { attributes, listeners, setNodeRef, transform, active } = useDraggable({
    id: ticket.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleStatusChange = async (newStatus: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsUpdating(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket moved to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStatusAction = () => {
    switch (ticket.status) {
      case "open":
        return { status: "in_progress", label: "Start", icon: Play, color: "bg-blue-500 hover:bg-blue-600" };
      case "in_progress":
        return { status: "resolved", label: "Complete", icon: CheckCircle, color: "bg-green-500 hover:bg-green-600" };
      case "pending":
        return { status: "in_progress", label: "Resume", icon: Play, color: "bg-blue-500 hover:bg-blue-600" };
      case "resolved":
        return { status: "closed", label: "Close", icon: ArrowRight, color: "bg-gray-500 hover:bg-gray-600" };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const isBeingDragged = active?.id === ticket.id;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 bg-white border border-gray-200",
        isBeingDragged && "opacity-50 scale-105 shadow-lg",
        isDragging && "shadow-2xl border-primary"
      )}
      onClick={() => !isBeingDragged && onClick(ticket)}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
            {ticket.title}
          </h4>
          <Badge variant={getPriorityColor(ticket.priority)} className="text-xs shrink-0">
            {ticket.priority}
          </Badge>
        </div>

        {/* Description */}
        {ticket.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {ticket.description}
          </p>
        )}

        {/* Property Address */}
        {ticket.property_address && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{ticket.property_address}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
          
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {ticket.category}
          </Badge>
        </div>

        {/* Quick Action Button */}
        {showQuickActions && nextAction && !isBeingDragged && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="font-mono text-xs truncate">
                ID: {ticket.id.slice(0, 8)}...
              </span>
            </div>
            <Button
              size="sm"
              className={cn(
                "text-xs px-2 py-1 h-6 text-white border-0",
                nextAction.color,
                isUpdating && "opacity-50 cursor-not-allowed"
              )}
              onClick={(e) => handleStatusChange(nextAction.status, e)}
              disabled={isUpdating}
            >
              <nextAction.icon className="w-3 h-3 mr-1" />
              {nextAction.label}
            </Button>
          </div>
        )}

        {/* Show ID when no quick action available */}
        {(!showQuickActions || !nextAction) && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span className="font-mono text-xs truncate">
              ID: {ticket.id.slice(0, 8)}...
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}