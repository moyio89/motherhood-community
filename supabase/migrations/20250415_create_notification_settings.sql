-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_topics BOOLEAN NOT NULL DEFAULT TRUE,
  email_new_questions BOOLEAN NOT NULL DEFAULT TRUE,
  email_comments BOOLEAN NOT NULL DEFAULT TRUE,
  email_subscription BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own settings
CREATE POLICY "Users can read their own notification settings"
  ON public.user_notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own settings
CREATE POLICY "Users can update their own notification settings"
  ON public.user_notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own settings
CREATE POLICY "Users can insert their own notification settings"
  ON public.user_notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add this table to the public schema
GRANT ALL ON public.user_notification_settings TO authenticated;
GRANT ALL ON public.user_notification_settings TO service_role;
