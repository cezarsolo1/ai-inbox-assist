import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useTickets, deleteTicket, type Ticket } from "@/hooks/useTickets";
import { TicketKanbanBoard } from "@/components/tickets/TicketKanbanBoard";
import { TicketInboxView } from "@/components/tickets/TicketInboxView";
import { TicketDrawer } from "@/components/tickets/TicketDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";

export default function TicketsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"pending" | "orders">("pending");

  const { data: tickets, isLoading, error } = useTickets({ 
    search, 
    status: statusFilter === "all" ? "" : statusFilter 
  });

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleDelete = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(t("tickets.deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      toast.error(t("tickets.deleteError"));
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t("tickets.loadingTickets")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">{t("tickets.errorLoading")}: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between gap-4 p-4 pl-6">
          {/* Left side - Title */}
          <div className="min-w-0 flex-shrink-0">
            <h1 className="text-xl font-semibold text-foreground">{t("tickets.title")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("tickets.subtitle")}
            </p>
          </div>

          {/* Right side - Search and Filters */}
          <div className="flex gap-3 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("tickets.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={viewMode} onValueChange={(value: "pending" | "orders") => setViewMode(value)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t("common.view")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("tickets.dashboard")}</SelectItem>
                <SelectItem value="orders">{t("tickets.pendingTickets")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t("tickets.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("tickets.allStatus")}</SelectItem>
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
        </div>
      </div>

      {/* Content with proper top margin for fixed header */}
      <div className="flex-1 mt-[120px] overflow-hidden">
        <div className="h-full">
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
                <div className="h-full overflow-y-auto p-4">
                  <TicketInboxView 
                    tickets={tickets} 
                    onTicketClick={handleTicketClick}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}