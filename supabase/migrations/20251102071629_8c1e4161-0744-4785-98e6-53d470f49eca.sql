-- Make message content optional since files can be sent without text
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;