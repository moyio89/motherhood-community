-- Enable RLS on workshops table (if not already enabled)
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- Create policy to allow any authenticated user to view workshops
CREATE POLICY "Allow authenticated users to view workshops" 
ON public.workshops
FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow only admins to insert, update, delete workshops
CREATE POLICY "Allow admins to manage workshops" 
ON public.workshops
FOR ALL 
TO authenticated
USING (auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true')
WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'is_admin' = 'true');
