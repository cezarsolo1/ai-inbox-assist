import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { type Ticket } from "@/hooks/useTickets";
import { DraggableTicketCard } from "./DraggableTicketCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
  isUpdating: boolean;
}

export function KanbanColumn({ 
  id, 
  title, 
  color, 
  tickets, 
  onTicketClick,
  onDelete,
  isUpdating 
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Column Header */}
      <div className={cn(
        "p-3 rounded-t-lg border-2 border-b-0",
        color,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}>
        <h3 className="font-medium text-sm text-gray-700">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {tickets.length} {tickets.length === 1 ? t("kanban.ticket") : t("kanban.tickets")}
        </p>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[400px] max-h-[600px] overflow-y-auto p-2 space-y-2 border-2 border-t-0 rounded-b-lg bg-white/50",
          color.replace('bg-', 'border-').replace('100', '200'),
          isOver && "bg-primary/5 ring-2 ring-primary ring-offset-2",
          isUpdating && "pointer-events-none opacity-50"
        )}
      >
        {tickets.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            {t("kanban.noTicketsInStatus")}
          </div>
        ) : (
          tickets.map((ticket) => (
            <DraggableTicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={onTicketClick}
              onDelete={onDelete}
              isDragging={false}
            />
          ))
        )}
      </div>
    </div>
  );
}