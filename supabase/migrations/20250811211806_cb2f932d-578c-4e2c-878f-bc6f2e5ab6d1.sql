-- Add missing DELETE policy for outbound_messages table
CREATE POLICY "outbound_delete" ON outbound_messages FOR DELETE USING (true);