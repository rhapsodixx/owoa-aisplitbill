-- Migration: 20260115_create_passcode_attempts
-- Description: Create table to track failed passcode attempts for rate limiting

CREATE TABLE IF NOT EXISTS passcode_attempts (
    result_id UUID NOT NULL REFERENCES split_bill_results(id) ON DELETE CASCADE,
    client_key TEXT NOT NULL,
    failed_count INTEGER NOT NULL DEFAULT 0,
    first_failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_until TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (result_id, client_key)
);

-- Add comments for documentation
COMMENT ON TABLE passcode_attempts IS 'Tracks failed passcode attempts for rate limiting (brute-force protection)';
COMMENT ON COLUMN passcode_attempts.client_key IS 'Client identifier: either Session ID or Hash(IP + User-Agent)';
COMMENT ON COLUMN passcode_attempts.failed_count IS 'Number of consecutive failed attempts';
COMMENT ON COLUMN passcode_attempts.locked_until IS 'Timestamp until which the client is locked out';

-- Create index for cleanup/maintenance (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_passcode_attempts_locked_until ON passcode_attempts(locked_until);
