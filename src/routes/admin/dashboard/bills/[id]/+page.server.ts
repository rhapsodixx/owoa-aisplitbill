import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

interface BillDetail {
    id: string;
    result_data: {
        total_amount: number;
        currency: string;
        num_people: number;
        [key: string]: unknown;
    };
    person_breakdown: Array<{
        name: string;
        items: Array<{ name: string; amount: number }>;
        subtotal: number;
        share_of_fees: number;
        total: number;
    }>;
    fees_taxes: {
        tax?: number;
        service_charge?: number;
        tip?: number;
        [key: string]: number | undefined;
    };
    receipt_image_url: string;
    visibility: 'public' | 'private';
    created_at: string;
}

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    const { data, error: fetchError } = await supabaseAdmin
        .from('split_bill_results')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !data) {
        console.error('Error fetching bill:', fetchError);
        throw error(404, 'Bill not found');
    }

    return {
        bill: data as BillDetail
    };
};
