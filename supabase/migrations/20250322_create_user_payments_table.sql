-- Create a table for one-time payments
CREATE TABLE IF NOT EXISTS user_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  payment_type TEXT,
  product_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own payments
CREATE POLICY "Users can view their own payments"
  ON user_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own payments
CREATE POLICY "Users can insert their own payments"
  ON user_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all payments
CREATE POLICY "Service role can manage all payments"
  ON user_payments
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_stripe_payment_id ON user_payments(stripe_payment_id);
