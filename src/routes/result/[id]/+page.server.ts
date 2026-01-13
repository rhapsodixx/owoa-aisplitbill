import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw error(404, 'Result not found');
    }

    // Fetch result from Supabase
    const { data, error: dbError } = await supabaseAdmin
        .from('split_bill_results')
        .select('*')
        .eq('id', id)
        .single();

    if (dbError || !data) {
        throw error(404, 'Result not found');
    }

    return {
        result: data.result_data,
        receiptImageUrl: data.receipt_image_url,
        currency: data.currency,
        createdAt: data.created_at,
        resultId: id,
        visibility: data.visibility || 'public',
        isPrivate: (data.visibility === 'private'),
        paymentInstruction: data.payment_instruction || null
    };
};
