import { json, type RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { verifyPasscode } from '$lib/server/passcode';
import {
    getClientIdentifier,
    checkRateLimit,
    recordFailure,
    resetRateLimit
} from '$lib/server/rate-limit';

export const POST: RequestHandler = async (event) => {
    try {
        const body = await event.request.json();
        const { id, passcode } = body;

        // Validate input
        if (!id || typeof id !== 'string') {
            return json({ error: 'Result ID is required' }, { status: 400 });
        }

        if (!passcode || typeof passcode !== 'string') {
            return json({ error: 'Passcode is required' }, { status: 400 });
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return json({ error: 'Invalid result ID' }, { status: 400 });
        }

        // 1. Identify Client
        const clientKey = getClientIdentifier(event);

        // 2. Check Rate Limit
        const limitStatus = await checkRateLimit(id, clientKey);
        if (limitStatus.locked) {
            const retryAfter = limitStatus.retryAfterSeconds || 60;
            return json(
                {
                    error: 'Too many failed attempts. Please try again later.',
                    retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString()
                    }
                }
            );
        }

        // Fetch result from Supabase
        const { data, error: dbError } = await supabaseAdmin
            .from('split_bill_results')
            .select('visibility, passcode_hash')
            .eq('id', id)
            .single();

        if (dbError || !data) {
            // Return 404 if not found (attacker learns UUID is invalid immediately)
            return json({ error: 'Result not found' }, { status: 404 });
        }

        // Check if result is public (no passcode needed)
        if (data.visibility === 'public') {
            return json({ success: true, message: 'Result is public' });
        }

        // Verify passcode for private results
        if (!data.passcode_hash) {
            return json({ error: 'Result configuration error' }, { status: 500 });
        }

        const isValid = await verifyPasscode(passcode.trim(), data.passcode_hash);

        if (!isValid) {
            // 3. Record Failure
            await recordFailure(id, clientKey);
            return json({ error: 'Incorrect passcode' }, { status: 401 });
        }

        // 4. Success -> Reset Limit
        await resetRateLimit(id, clientKey);

        return json({ success: true });
    } catch (error) {
        console.error('Verify passcode error:', error);
        return json(
            { error: 'Failed to verify passcode' },
            { status: 500 }
        );
    }
};
