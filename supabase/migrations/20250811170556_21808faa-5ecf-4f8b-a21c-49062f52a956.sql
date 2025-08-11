-- Fix the security warning for function search path by setting search_path
CREATE OR REPLACE FUNCTION public.inbox_messages_validate_update()
RETURNS trigger AS $$
BEGIN
  -- If anon role, only allow changing the 'seen' column
  IF auth.role() = 'anon' THEN
    IF (NEW IS DISTINCT FROM OLD) THEN
      -- Temporarily copy OLD and NEW, zero out allowed field and compare
      IF (
        NEW.id           IS DISTINCT FROM OLD.id OR
        NEW.channel      IS DISTINCT FROM OLD.channel OR
        NEW.from_msisdn  IS DISTINCT FROM OLD.from_msisdn OR
        NEW.to_msisdn    IS DISTINCT FROM OLD.to_msisdn OR
        NEW.body         IS DISTINCT FROM OLD.body OR
        NEW.profile_name IS DISTINCT FROM OLD.profile_name OR
        NEW.twilio_sid   IS DISTINCT FROM OLD.twilio_sid OR
        NEW.media        IS DISTINCT FROM OLD.media OR
        NEW.raw          IS DISTINCT FROM OLD.raw OR
        NEW.created_at   IS DISTINCT FROM OLD.created_at
      ) THEN
        RAISE EXCEPTION 'Only the seen field can be updated by anon role';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';