-- Add parent_id column to question_replies table
ALTER TABLE question_replies ADD COLUMN parent_id UUID REFERENCES question_replies(id) ON DELETE CASCADE;

-- Add index for faster queries on parent_id
CREATE INDEX idx_question_replies_parent_id ON question_replies(parent_id);
