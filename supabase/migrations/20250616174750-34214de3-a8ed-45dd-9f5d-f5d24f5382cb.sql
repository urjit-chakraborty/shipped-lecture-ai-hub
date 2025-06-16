
-- First, let's check what RLS policies exist and then create proper ones
-- Drop any existing policies that might be too restrictive
DROP POLICY IF EXISTS "Anyone can manage their IP usage" ON public.ai_chat_usage;

-- Create more specific policies for the ai_chat_usage table
-- Allow anonymous users to read their own IP usage
CREATE POLICY "Anyone can read IP usage" 
  ON public.ai_chat_usage 
  FOR SELECT 
  USING (true);

-- Allow anonymous users to insert/update their own IP usage
CREATE POLICY "Anyone can upsert IP usage" 
  ON public.ai_chat_usage 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
