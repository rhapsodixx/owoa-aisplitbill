import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const peopleCount = formData.get('peopleCount');
		const instructions = formData.get('instructions');

		if (!file || !peopleCount) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const apiKey = env.OPENROUTER_API_KEY;
		const model = env.OPENROUTER_MODEL_DEFAULT || 'openai/gpt-4o-mini';

		if (!apiKey) {
			console.error('OPENROUTER_API_KEY is missing');
			return json({ error: 'Server configuration error' }, { status: 500 });
		}

		// Convert file to base64
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64Image = buffer.toString('base64');
		const dataUrl = `data:${file.type};base64,${base64Image}`;

		const systemPrompt = `
You are an expert AI Bill Splitter.
Your goal is to parse a receipt image and split the costs among ${peopleCount} people based on the provided instructions.

EXTRA INSTRUCTIONS:
"${instructions || 'No specific instructions provided. Split everything equally.'}"

MANDATORY RULES:
1. Extract all items, prices, taxes, and service fees from the receipt.
2. Distribute items to Person 1, Person 2, etc., based on the instructions.
3. If an item is shared or no instruction exists for it, split it equally among all people.
4. Taxes and Service Fees must be distributed PROPORTIONALLY based on the individual's subtotal share.
5. Return strictly valid JSON.

OUTPUT SCHEMA (JSON):
{
  "people": [
    {
      "name": "Person 1",
      "items": [
        { "name": "Item name", "price": 10.0 }
      ],
      "subtotal": 10.0,
      "tax": 1.0,
      "serviceFee": 1.0,
      "total": 12.0
    }
  ],
  "grandTotal": 12.0
}
Ensure numeric values are floats (2 decimal places).
`;

		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://owoa-aisplitbill.vercel.app', // Required by OpenRouter
				'X-Title': 'AI Split Bill'
			},
			body: JSON.stringify({
				model: model,
				messages: [
					{
						role: 'system',
						content: systemPrompt
					},
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: `Split this bill for ${peopleCount} people.`
							},
							{
								type: 'image_url',
								image_url: {
									url: dataUrl
								}
							}
						]
					}
				],
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const err = await response.text();
			console.error('OpenRouter API Error:', err);
			return json({ error: 'AI processing failed' }, { status: 502 });
		}

		const data = await response.json();
		const content = data.choices[0].message.content;

		// Parse JSON content
		let result;
		try {
			result = JSON.parse(content);
		} catch (e) {
			console.error('Failed to parse AI response:', content);
			return json({ error: 'Invalid AI response format' }, { status: 500 });
		}

		return json(result);

	} catch (error) {
		console.error('Handler error:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
