-- Migration: 20260113_add_payment_instruction_column
-- Description: Add optional payment_instruction column for user-provided payment details

-- Add payment_instruction column (nullable TEXT)
ALTER TABLE split_bill_results 
ADD COLUMN IF NOT EXISTS payment_instruction TEXT;

-- Comment on column for documentation
COMMENT ON COLUMN split_bill_results.payment_instruction IS 'User-provided payment instruction (e.g., bank account, e-wallet). Stored verbatim, NOT processed by AI.';
