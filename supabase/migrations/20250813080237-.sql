-- Update direction check constraint to accept both old and new values
ALTER TABLE public.email_messages
  DROP CONSTRAINT IF EXISTS email_messages_direction_check;

ALTER TABLE public.email_messages
  ADD CONSTRAINT email_messages_direction_check
  CHECK (direction IN ('incoming', 'outgoing', 'inbound', 'outbound'));
