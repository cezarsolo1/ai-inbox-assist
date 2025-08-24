import { format } from "date-fns";
import { type Ticket } from "@/hooks/useTickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface TicketInboxViewProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
}

function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "pending":
      return "outline";
    case "scheduling":
      return "secondary";
    case "work_date_scheduled":
      return "default";
    case "confirming_completion":
      return "secondary";
    case "getting_invoice":
      return "default";
    case "completed":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export function TicketInboxView({ tickets, onTicketClick, onDelete }: TicketInboxViewProps) {
  return (
    <div className="bg-card rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground font-medium">Order ID</TableHead>
            <TableHead className="text-muted-foreground font-medium">Title / Headline</TableHead>
            <TableHead className="text-muted-foreground font-medium">Address</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium">Date Created</TableHead>
            <TableHead className="text-muted-foreground font-medium w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors border-border"
              onClick={() => onTicketClick(ticket)}
            >
              <TableCell className="font-mono text-sm text-foreground">
                {ticket.id.slice(0, 8)}
              </TableCell>
              <TableCell className="font-medium text-foreground max-w-xs">
                <div className="truncate" title={ticket.title}>
                  {ticket.title}
                </div>
                {ticket.description && (
                  <div className="text-sm text-muted-foreground truncate mt-1" title={ticket.description}>
                    {ticket.description}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ticket.property_address || "N/A"}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(ticket.status)} className="capitalize">
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(ticket.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(ticket.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {tickets.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No tickets found matching your criteria.
        </div>
      )}
    </div>
  );
}