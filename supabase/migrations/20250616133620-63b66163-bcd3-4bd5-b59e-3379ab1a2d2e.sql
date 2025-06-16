
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('Lecture', 'Fireside Chat', 'Workshop', 'Livestream')),
  youtube_url TEXT,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to read events
CREATE POLICY "Authenticated users can view events" 
  ON public.events 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to insert events
CREATE POLICY "Authenticated users can create events" 
  ON public.events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to update events
CREATE POLICY "Authenticated users can update events" 
  ON public.events 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to delete events
CREATE POLICY "Authenticated users can delete events" 
  ON public.events 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER handle_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
