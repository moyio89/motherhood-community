-- Create a new table for question replies
CREATE TABLE question_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries on question_id
CREATE INDEX idx_question_replies_question_id ON question_replies(question_id);

-- Create RLS policies for question_replies table
ALTER TABLE question_replies ENABLE ROW LEVEL SECURITY;

-- Policy for selecting replies (anyone can read)
CREATE POLICY "Anyone can read question replies"
ON question_replies
FOR SELECT
USING (true);

-- Policy for inserting replies (authenticated users only)
CREATE POLICY "Authenticated users can insert question replies"
ON question_replies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for updating replies (only the owner or admin can update)
CREATE POLICY "Users can update their own question replies"
ON question_replies
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
);

-- Policy for deleting replies (only the owner or admin can delete)
CREATE POLICY "Users can delete their own question replies"
ON question_replies
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
);

-- Create functions for incrementing and decrementing counts
CREATE OR REPLACE FUNCTION increment(row_id UUID, table_name TEXT, column_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_value INTEGER;
BEGIN
    EXECUTE format('SELECT %I FROM %I WHERE id = $1', column_name, table_name)
    INTO current_value
    USING row_id;
    
    RETURN COALESCE(current_value, 0) + 1;
END;
$$;

CREATE OR REPLACE FUNCTION decrement(row_id UUID, table_name TEXT, column_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_value INTEGER;
BEGIN
    EXECUTE format('SELECT %I FROM %I WHERE id = $1', column_name, table_name)
    INTO current_value
    USING row_id;
    
    RETURN GREATEST(0, COALESCE(current_value, 0) - 1);
END;
$$;
