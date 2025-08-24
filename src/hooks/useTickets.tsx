import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Ticket = {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  property_address: string | null;
  created_at: string;
  updated_at: string;
};

interface UseTicketsProps {
  search?: string;
  status?: string;
  priority?: string;
  limit?: number;
}

export function useTickets({ 
  search = "", 
  status = "", 
  priority = "",
  limit = 50 
}: UseTicketsProps = {}) {
  return useQuery({
    queryKey: ["tickets", search, status, priority, limit],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,property_address.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (priority) {
        query = query.eq("priority", priority);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Ticket[];
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const { error } = await supabase
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) throw error;
}

export async function deleteTicket(ticketId: string) {
  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", ticketId);

  if (error) throw error;
}