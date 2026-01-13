import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

const PAGE_SIZE = 10;

interface SplitBillRow {
    id: string;
    result_data: {
        total_amount?: number;
        num_people?: number;
    };
    visibility: 'public' | 'private';
    created_at: string;
}

export const load: PageServerLoad = async ({ url }) => {
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * PAGE_SIZE;

    // Paginated query using service-role
    const { data, error, count } = await supabaseAdmin
        .from('split_bill_results')
        .select('id, result_data, visibility, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
        console.error('Error fetching bills:', error);
        return {
            bills: [] as SplitBillRow[],
            total: 0,
            page,
            pageSize: PAGE_SIZE,
            totalPages: 0
        };
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return {
        bills: (data || []) as SplitBillRow[],
        total: count || 0,
        page,
        pageSize: PAGE_SIZE,
        totalPages
    };
};
