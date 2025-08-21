import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Ticket } from "@/hooks/useTickets";

interface TicketRowProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
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

export function TicketRow({ ticket, onClick }: TicketRowProps) {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onClick(ticket)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getPriorityColor(ticket.priority)}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {ticket.priority}
              </Badge>
              <Badge variant={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {ticket.title}
            </h3>
            
            {ticket.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {ticket.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {ticket.property_address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{ticket.property_address}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}