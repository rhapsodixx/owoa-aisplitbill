-- Migration: 20260116_add_original_result_data
-- Description: Add column for immutable AI output snapshot

-- Add column for immutable AI output snapshot
ALTER TABLE split_bill_results 
ADD COLUMN IF NOT EXISTS original_result_data JSONB;

-- Backfill: Copy existing result_data to original_result_data
UPDATE split_bill_results 
SET original_result_data = result_data 
WHERE original_result_data IS NULL;

-- Make column NOT NULL after backfill
ALTER TABLE split_bill_results 
ALTER COLUMN original_result_data SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN split_bill_results.original_result_data IS 'Immutable snapshot of original AI output. Never modified after creation.';
