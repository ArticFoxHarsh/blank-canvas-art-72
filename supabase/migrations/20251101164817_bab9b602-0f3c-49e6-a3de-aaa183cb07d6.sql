-- Create calculator_state table for real-time collaboration
CREATE TABLE public.calculator_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  display TEXT NOT NULL DEFAULT '0',
  previous_value TEXT,
  operation TEXT,
  waiting_for_operand BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Enable Row Level Security
ALTER TABLE public.calculator_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read calculator state
CREATE POLICY "Anyone can view calculator state"
  ON public.calculator_state
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert calculator state
CREATE POLICY "Anyone can insert calculator state"
  ON public.calculator_state
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update calculator state
CREATE POLICY "Anyone can update calculator state"
  ON public.calculator_state
  FOR UPDATE
  USING (true);

-- Create policy to allow anyone to delete calculator state
CREATE POLICY "Anyone can delete calculator state"
  ON public.calculator_state
  FOR DELETE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_calculator_session_id ON public.calculator_state(session_id);

-- Enable realtime for calculator_state table
ALTER PUBLICATION supabase_realtime ADD TABLE public.calculator_state;