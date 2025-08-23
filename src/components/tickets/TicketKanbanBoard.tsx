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
import { updateTicketStatus, type Ticket } from "@/hooks/useTickets";
import { KanbanColumn } from "./KanbanColumn";
import { DraggableTicketCard } from "./DraggableTicketCard";

const TICKET_STATUSES = [
  { id: "open", label: "Open", color: "bg-orange-100 border-orange-200" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-100 border-blue-200" },
  { id: "pending", label: "Pending", color: "bg-yellow-100 border-yellow-200" },
  { id: "resolved", label: "Resolved", color: "bg-green-100 border-green-200" },
  { id: "closed", label: "Closed", color: "bg-gray-100 border-gray-200" },
];

interface TicketKanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export function TicketKanbanBoard({ tickets, onTicketClick }: TicketKanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

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
      
      toast.success(`Ticket moved to ${TICKET_STATUSES.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Work Orders</h1>
        <p className="text-muted-foreground">Drag tickets between columns to update their status</p>
      </div>

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
                isDragging={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}