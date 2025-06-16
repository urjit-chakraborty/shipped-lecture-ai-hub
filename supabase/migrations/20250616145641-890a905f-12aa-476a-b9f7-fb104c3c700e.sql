
-- Create a table to track IP-based AI chat usage
CREATE TABLE public.ai_chat_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 1,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address, last_reset_date)
);

-- Add RLS to the table (allow anonymous access for this specific use case)
ALTER TABLE public.ai_chat_usage ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous users to read and write their own IP usage
CREATE POLICY "Anyone can manage their IP usage" 
  ON public.ai_chat_usage 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.ai_chat_usage
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
