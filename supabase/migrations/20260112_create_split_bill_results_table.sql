-- Migration: 20260112_create_split_bill_results_table
-- Description: Create table for storing AI split bill results

-- Create the split_bill_results table
CREATE TABLE IF NOT EXISTS split_bill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_data JSONB NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  person_breakdown JSONB NOT NULL,
  fees_taxes JSONB NOT NULL DEFAULT '{}',
  receipt_image_url TEXT NOT NULL,
  ai_model_used TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE split_bill_results ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (no authentication required)
-- This allows anyone with the UUID to view the result
CREATE POLICY "Public read access"
  ON split_bill_results
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert (server-side writes only)
-- This prevents direct client-side inserts
CREATE POLICY "Service role insert"
  ON split_bill_results
  FOR INSERT
  WITH CHECK (true);

-- Create index for efficient UUID lookups
CREATE INDEX IF NOT EXISTS idx_split_bill_results_id ON split_bill_results(id);

-- Create index for created_at for potential future queries
CREATE INDEX IF NOT EXISTS idx_split_bill_results_created_at ON split_bill_results(created_at);

-- Grant usage on the table
GRANT SELECT ON split_bill_results TO anon;
GRANT SELECT ON split_bill_results TO authenticated;
GRANT ALL ON split_bill_results TO service_role;
