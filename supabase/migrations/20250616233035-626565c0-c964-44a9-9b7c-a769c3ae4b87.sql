
-- Create a table to track user credits
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, last_reset_date)
);

-- Add RLS to the table
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own credits
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to update their own credits
CREATE POLICY "Users can update their own credits" 
  ON public.user_credits 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create a function to atomically increment user credits
CREATE OR REPLACE FUNCTION increment_user_credits(
  p_user_id UUID,
  p_date DATE,
  p_limit INTEGER
) RETURNS TABLE (credits_used INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert or update the count atomically
  INSERT INTO user_credits (user_id, credits_used, last_reset_date)
  VALUES (p_user_id, 1, p_date)
  ON CONFLICT (user_id, last_reset_date)
  DO UPDATE SET 
    credits_used = LEAST(user_credits.credits_used + 1, p_limit + 1),
    updated_at = NOW()
  RETURNING credits_used INTO v_count;

  -- Return the current count
  RETURN QUERY SELECT v_count;
END;
$$;

-- Drop the old IP-based table since we're replacing it
DROP TABLE IF EXISTS public.ai_chat_usage;
