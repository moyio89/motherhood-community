-- Add timezone column to workshops table
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'GMT-5';
