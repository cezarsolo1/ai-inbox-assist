import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTicketStatus, deleteTicket, type Ticket } from "@/hooks/useTickets";
import { useTranslation } from "@/hooks/useTranslation";
import { KanbanColumn } from "./KanbanColumn";
import { DraggableTicketCard } from "./DraggableTicketCard";

interface TicketKanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export function TicketKanbanBoard({ tickets, onTicketClick }: TicketKanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const TICKET_STATUSES = [
    { id: "pending", label: t("ticketStatus.pending"), color: "bg-orange-100 border-orange-200" },
    { id: "scheduling", label: t("ticketStatus.scheduling"), color: "bg-yellow-100 border-yellow-200" },
    { id: "work_date_scheduled", label: t("ticketStatus.workDateScheduled"), color: "bg-blue-100 border-blue-200" },
    { id: "confirming_completion", label: t("ticketStatus.confirmingCompletion"), color: "bg-purple-100 border-purple-200" },
    { id: "getting_invoice", label: t("ticketStatus.gettingInvoice"), color: "bg-indigo-100 border-indigo-200" },
    { id: "completed", label: t("ticketStatus.completed"), color: "bg-green-100 border-green-200" },
    { id: "cancelled", label: t("ticketStatus.cancelled"), color: "bg-red-100 border-red-200" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find(t => t.id === event.active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over || active.id === over.id) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the ticket being moved
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    setIsUpdating(true);
    try {
      await updateTicketStatus(ticketId, newStatus);
      
      // Invalidate and refetch tickets query
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      
      toast.success(`${t("kanban.ticketMoved")} ${TICKET_STATUSES.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      toast.error(t("kanban.failedToUpdateStatus"));
      console.error("Error updating ticket status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const handleDelete = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(t("kanban.ticketDeletedSuccess"));
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      toast.error(t("kanban.failedToDeleteTicket"));
    }
  };

  return (
    <div className="p-2">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {TICKET_STATUSES.map((status) => {
            const columnTickets = getTicketsByStatus(status.id);
            return (
              <KanbanColumn
                key={status.id}
                id={status.id}
                title={status.label}
                color={status.color}
                tickets={columnTickets}
                onTicketClick={onTicketClick}
                onDelete={handleDelete}
                isUpdating={isUpdating}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTicket && (
            <div className="rotate-2 opacity-80">
              <DraggableTicketCard
                ticket={activeTicket}
                onClick={() => {}}
                onDelete={handleDelete}
                isDragging={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}