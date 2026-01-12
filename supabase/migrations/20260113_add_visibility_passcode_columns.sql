-- Migration: 20260113_add_visibility_passcode_columns
-- Description: Add visibility and passcode_hash columns for private result support

-- Add visibility column (public or private)
ALTER TABLE split_bill_results 
ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';

-- Add passcode_hash column (nullable, only for private results)
ALTER TABLE split_bill_results 
ADD COLUMN IF NOT EXISTS passcode_hash TEXT;

-- Add check constraint for visibility values
ALTER TABLE split_bill_results 
ADD CONSTRAINT split_bill_results_visibility_check 
CHECK (visibility IN ('public', 'private'));

-- Create index for visibility lookups
CREATE INDEX IF NOT EXISTS idx_split_bill_results_visibility ON split_bill_results(visibility);

-- Comment on columns for documentation
COMMENT ON COLUMN split_bill_results.visibility IS 'Result visibility: public (no passcode) or private (requires passcode)';
COMMENT ON COLUMN split_bill_results.passcode_hash IS 'bcrypt hash of passcode for private results, NULL for public results';
