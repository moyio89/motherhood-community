-- Create a policy to allow any authenticated user to view workshops
CREATE POLICY "Allow authenticated users to view workshops" 
ON "public"."workshops"
FOR SELECT
TO authenticated
USING (true);
