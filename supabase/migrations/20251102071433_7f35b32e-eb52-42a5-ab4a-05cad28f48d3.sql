-- Add dm_users column to channels table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'channels' AND column_name = 'dm_users'
  ) THEN
    ALTER TABLE public.channels ADD COLUMN dm_users UUID[];
  END IF;
END $$;

-- Add file columns to messages table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN file_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN file_name TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN file_type TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN file_size INTEGER;
  END IF;
END $$;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for message attachments bucket (drop first to avoid conflicts)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view message attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload message attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own message attachments" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Anyone can view message attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);