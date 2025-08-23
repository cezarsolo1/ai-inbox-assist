import { useState } from "react";
import { useTickets, type Ticket } from "@/hooks/useTickets";
import { TicketKanbanBoard } from "@/components/tickets/TicketKanbanBoard";
import { TicketInboxView } from "@/components/tickets/TicketInboxView";
import { TicketDrawer } from "@/components/tickets/TicketDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"pending" | "orders">("pending");

  const { data: tickets, isLoading, error } = useTickets({ 
    search, 
    status: statusFilter === "all" ? "" : statusFilter 
  });

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTicket(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Error loading tickets: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background pt-16 pl-2 pr-2 pb-2">
      {/* Header */}
      <div className="flex-none p-2 border-b border-border bg-card/50">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Title */}
          <div className="min-w-0 flex-shrink-0">
            <h1 className="text-xl font-semibold text-foreground">Work Orders</h1>
            <p className="text-xs text-muted-foreground">
              Manage property maintenance tickets
            </p>
          </div>

          {/* Right side - Search and Filters */}
          <div className="flex gap-3 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={viewMode} onValueChange={(value: "pending" | "orders") => setViewMode(value)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Tickets</SelectItem>
                <SelectItem value="orders">Open Orders</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-2">
          {tickets && (
            <>
              {viewMode === "pending" ? (
                <div className="h-full overflow-x-auto overflow-y-hidden">
                  <TicketKanbanBoard 
                    tickets={tickets} 
                    onTicketClick={handleTicketClick} 
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <TicketInboxView 
                    tickets={tickets} 
                    onTicketClick={handleTicketClick} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ticket Details Drawer */}
      <TicketDrawer
        ticket={selectedTicket}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}