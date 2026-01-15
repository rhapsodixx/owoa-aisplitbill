import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestEvent } from '@sveltejs/kit';
import { createHash } from 'node:crypto';

/**
 * Get a unique client identifier.
 * Priority:
 * 1. Authenticated Session ID (if available in locals)
 * 2. SHA-256 Hash of (IP + User-Agent)
 * 
 * Note: IP comes from event.getClientAddress() which is trusted in SvelteKit adapters
 * if configured correctly (e.g. handled by platform).
 */
export function getClientIdentifier(event: RequestEvent): string {
    // 1. Authenticated User
    if (event.locals.user?.id) {
        return `user:${event.locals.user.id}`;
    }

    // 2. Hash(IP + User-Agent)
    const ip = event.getClientAddress();
    const userAgent = event.request.headers.get('user-agent') || 'unknown';
    // Combine IP and UA to reduce chance of collision behind common NATs if UA differs,
    // though IP based limiting is the main goal.
    const rawKey = `${ip}|${userAgent}`;

    const hash = createHash('sha256').update(rawKey).digest('hex');
    return `hash:${hash}`;
}

export interface RateLimitResult {
    locked: boolean;
    retryAfterSeconds?: number;
}

/**
 * Check if the client is currently locked out.
 */
export async function checkRateLimit(resultId: string, clientKey: string): Promise<RateLimitResult> {
    const { data, error } = await supabaseAdmin
        .from('passcode_attempts')
        .select('locked_until')
        .eq('result_id', resultId)
        .eq('client_key', clientKey)
        .single();

    if (error || !data) {
        // Record might not exist, or error fetching (treat as not locked)
        return { locked: false };
    }

    if (data.locked_until) {
        const lockedUntil = new Date(data.locked_until);
        const now = new Date();

        if (lockedUntil > now) {
            const retryAfter = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
            return { locked: true, retryAfterSeconds: retryAfter };
        }
    }

    return { locked: false };
}

/**
 * Record a failed attempt.
 * Increments count, and locks if threshold reached.
 */
export async function recordFailure(resultId: string, clientKey: string): Promise<void> {
    const now = new Date();
    const RESET_WINDOW_MINUTES = 15;
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;

    // Fetch current state to determine next state
    const { data } = await supabaseAdmin
        .from('passcode_attempts')
        .select('*')
        .eq('result_id', resultId)
        .eq('client_key', clientKey)
        .single();

    let failed_count = 1;
    let first_failed_at = now.toISOString();
    let locked_until = null;

    if (data) {
        const firstFailedAtDate = new Date(data.first_failed_at);
        const diffMs = now.getTime() - firstFailedAtDate.getTime();
        const diffMins = diffMs / (1000 * 60);

        if (diffMins < RESET_WINDOW_MINUTES) {
            // Still within the attempt window
            failed_count = data.failed_count + 1;
            first_failed_at = data.first_failed_at; // Maintain original window start
        } else {
            // Window expired, reset counter to 1 (this is the first new failure)
            failed_count = 1;
            // first_failed_at is already set to now
        }
    }

    // Check if we hit the limit
    if (failed_count >= MAX_ATTEMPTS) {
        const lockUntilDate = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
        locked_until = lockUntilDate.toISOString();
    }

    // Upsert the tracking record
    await supabaseAdmin
        .from('passcode_attempts')
        .upsert({
            result_id: resultId,
            client_key: clientKey,
            failed_count: failed_count,
            first_failed_at: first_failed_at,
            last_attempt_at: now.toISOString(),
            locked_until: locked_until
        }, { onConflict: 'result_id, client_key' });
}

/**
 * Reset the rate limit counter (e.g. on successful login).
 */
export async function resetRateLimit(resultId: string, clientKey: string): Promise<void> {
    await supabaseAdmin
        .from('passcode_attempts')
        .delete()
        .eq('result_id', resultId)
        .eq('client_key', clientKey);
}
