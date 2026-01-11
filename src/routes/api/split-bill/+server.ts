import { json, type RequestHandler } from '@sveltejs/kit';
import { processReceipt } from '$lib/server/openrouter';

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

        // Convert image to base64
        const arrayBuffer = await image.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const imageType = image.type || 'image/jpeg';

        // Process with AI
        const result = await processReceipt(base64, imageType, peopleCount, instructions);

        return json(result);
    } catch (error) {
        console.error('Split bill API error:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to process receipt' },
            { status: 500 }
        );
    }
};
