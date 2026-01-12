import { json, type RequestHandler } from '@sveltejs/kit';
import { processReceipt } from '$lib/server/openrouter';
import { supabaseAdmin, generateUUID } from '$lib/server/supabase';
import { uploadReceiptImage } from '$lib/server/storage';

interface SplitBillRecord {
    id: string;
    result_data: object;
    currency: string;
    person_breakdown: object;
    fees_taxes: object;
    receipt_image_url: string;
    ai_model_used: string;
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();

        const image = formData.get('image') as File | null;
        const peopleCountStr = formData.get('peopleCount') as string | null;
        const instructions = (formData.get('instructions') as string) || '';

        // Validation
        if (!image) {
            return json({ error: 'Receipt image is required' }, { status: 400 });
        }

        if (!peopleCountStr) {
            return json({ error: 'Number of people is required' }, { status: 400 });
        }

        const peopleCount = parseInt(peopleCountStr, 10);
        if (isNaN(peopleCount) || peopleCount < 1) {
            return json({ error: 'Number of people must be a valid positive integer' }, { status: 400 });
        }

        // Generate UUID for this result
        const uuid = generateUUID();

        // Upload image to Supabase Storage
        const arrayBuffer = await image.arrayBuffer();
        const imageType = image.type || 'image/jpeg';

        let receiptImageUrl: string;
        try {
            receiptImageUrl = await uploadReceiptImage(arrayBuffer, imageType, uuid);
        } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            return json({ error: 'Failed to upload receipt image' }, { status: 500 });
        }

        // Convert image to base64 for AI processing
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Process with AI
        const result = await processReceipt(base64, imageType, peopleCount, instructions);

        // Extract AI model used (default model name)
        const aiModelUsed = process.env.OPENROUTER_MODEL_DEFAULT || 'openai/gpt-4o-mini';

        // Prepare record for database
        const record: SplitBillRecord = {
            id: uuid,
            result_data: result,
            currency: 'USD', // Default currency
            person_breakdown: result.people,
            fees_taxes: {
                totalTax: result.people.reduce((sum, p) => sum + (p.tax || 0), 0),
                totalServiceFee: result.people.reduce((sum, p) => sum + (p.serviceFee || 0), 0)
            },
            receipt_image_url: receiptImageUrl,
            ai_model_used: aiModelUsed
        };

        // Persist to Supabase
        const { error: dbError } = await supabaseAdmin
            .from('split_bill_results')
            .insert(record);

        if (dbError) {
            console.error('Database insert error:', dbError);
            return json({ error: 'Failed to save result' }, { status: 500 });
        }

        // Return the UUID for client to redirect
        return json({ id: uuid });
    } catch (error) {
        console.error('Split bill API error:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to process receipt' },
            { status: 500 }
        );
    }
};
