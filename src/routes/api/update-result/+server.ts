import { json, type RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';

interface UpdateResultRequest {
    id: string;
    result_data: {
        people: Array<{
            name: string;
            foodItems: Array<{ name: string; price: number; quantity?: number; isEdited?: boolean }>;
            drinkItems: Array<{ name: string; price: number; quantity?: number; isEdited?: boolean }>;
            subtotal: number;
            tax: number;
            serviceFee: number;
            total: number;
        }>;
        grandTotal: number;
    };
}

/**
 * PATCH /api/update-result
 * Save manual edits to split bill result.
 * 
 * LLM GUARD RAIL: This endpoint performs NO AI calls.
 * Edits are saved directly as authoritative overrides.
 */
export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const body: UpdateResultRequest = await request.json();
        const { id, result_data } = body;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!id || !uuidRegex.test(id)) {
            return json({ error: 'Invalid result ID' }, { status: 400 });
        }

        // Validate result_data structure
        if (!result_data || !result_data.people || !Array.isArray(result_data.people)) {
            return json({ error: 'Invalid result data structure' }, { status: 400 });
        }

        // Validate each person's data
        for (const person of result_data.people) {
            if (!person.name || typeof person.name !== 'string') {
                return json({ error: 'Each person must have a valid name' }, { status: 400 });
            }

            // Validate items
            const allItems = [...(person.foodItems || []), ...(person.drinkItems || [])];
            for (const item of allItems) {
                if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
                    return json({ error: 'Item names cannot be empty' }, { status: 400 });
                }
                if (typeof item.price !== 'number' || item.price < 0) {
                    return json({ error: 'Item prices must be non-negative numbers' }, { status: 400 });
                }
                if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity < 1)) {
                    return json({ error: 'Item quantities must be positive integers' }, { status: 400 });
                }
            }

            // Validate totals are non-negative
            if (typeof person.subtotal !== 'number' || person.subtotal < 0) {
                return json({ error: 'Subtotals must be non-negative' }, { status: 400 });
            }
            if (typeof person.total !== 'number' || person.total < 0) {
                return json({ error: 'Totals must be non-negative' }, { status: 400 });
            }
        }

        // Verify record exists
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('split_bill_results')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return json({ error: 'Result not found' }, { status: 404 });
        }

        // Update only result_data (NOT original_result_data - that remains immutable)
        const { error: updateError } = await supabaseAdmin
            .from('split_bill_results')
            .update({ 
                result_data,
                person_breakdown: result_data.people,
                fees_taxes: {
                    totalTax: result_data.people.reduce((sum, p) => sum + (p.tax || 0), 0),
                    totalServiceFee: result_data.people.reduce((sum, p) => sum + (p.serviceFee || 0), 0)
                }
            })
            .eq('id', id);

        if (updateError) {
            console.error('Update error:', updateError);
            return json({ error: 'Failed to save changes' }, { status: 500 });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Update result API error:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to update result' },
            { status: 500 }
        );
    }
};
