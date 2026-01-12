import { createClient } from '@supabase/supabase-js';
import {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY
} from '$env/static/private';

/**
 * Server-side Supabase client with service role key.
 * Use for database writes and storage uploads.
 * NEVER expose this client or key to the browser.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Supabase client with anon key for public read operations.
 * Can be used server-side for read-only queries.
 */
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Generate a cryptographically random UUID v4.
 * Uses Web Crypto API for secure random generation.
 */
export function generateUUID(): string {
    return crypto.randomUUID();
}
