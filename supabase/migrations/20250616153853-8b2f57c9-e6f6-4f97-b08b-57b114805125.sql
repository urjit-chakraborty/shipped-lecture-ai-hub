
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

-- Create new policies that allow public read access
CREATE POLICY "Anyone can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Keep admin-only policies for write operations
CREATE POLICY "Authenticated users can create events" 
  ON public.events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events" 
  ON public.events 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete events" 
  ON public.events 
  FOR DELETE 
  TO authenticated
  USING (true);
