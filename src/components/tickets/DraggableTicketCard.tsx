import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Trash2 } from "lucide-react";
import { type Ticket } from "@/hooks/useTickets";

interface DraggableTicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
  isDragging: boolean;
}

export function DraggableTicketCard({ ticket, onClick, onDelete, isDragging }: DraggableTicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, active } = useDraggable({
    id: ticket.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
              {ticket.priority}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(ticket.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
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

        {/* Tenant ID (for reference) */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span className="font-mono text-xs truncate">
            ID: {ticket.id.slice(0, 8)}...
          </span>
        </div>
      </div>
    </Card>
  );
}