-- Add payment_type column to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'recurring';

-- Make stripe_subscription_id nullable for one-time payments
ALTER TABLE user_subscriptions 
ALTER COLUMN stripe_subscription_id DROP NOT NULL;
