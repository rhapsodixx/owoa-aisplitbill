import { OPENROUTER_API_KEY, OPENROUTER_MODEL_DEFAULT, OPENROUTER_MODEL_FALLBACK } from '$env/static/private';

interface BillItem {
    name: string;
    price: number;
}

interface PersonBreakdown {
    name: string;
    foodItems: BillItem[];
    drinkItems: BillItem[];
    subtotal: number;
    tax: number;
    serviceFee: number;
    total: number;
}

interface SplitBillResult {
    people: PersonBreakdown[];
    grandTotal: number;
}

const SYSTEM_PROMPT = `You are a receipt analysis AI. Your task is to:
1. Read and interpret the receipt image
2. Extract all items, prices, taxes, and service fees
3. Assign items to people based on the user's instructions
4. Calculate fair cost distribution

CALCULATION RULES (MANDATORY):
- All taxes, service fees, and additional charges MUST be distributed PROPORTIONALLY based on the value of food/drinks consumed by each person
- Each person's share of tax/fees = (person's subtotal / total subtotal before fees) × total tax/fees
- Final totals must be clearly calculated per person

OUTPUT FORMAT (STRICT JSON):
{
  "people": [
    {
      "name": "Person 1",
      "foodItems": [{"name": "Item Name", "price": 10.00}],
      "drinkItems": [{"name": "Drink Name", "price": 5.00}],
      "subtotal": 15.00,
      "tax": 1.50,
      "serviceFee": 0.75,
      "total": 17.25
    }
  ],
  "grandTotal": 17.25
}

IMPORTANT:
- Return ONLY valid JSON, no markdown or explanation
- All prices must be numbers (not strings)
- If instructions don't specify who ate what, distribute items evenly
- Identify food vs drinks based on item names (beverages, tea, coffee, juice, soda = drinks)`;

async function callOpenRouter(
    model: string,
    imageBase64: string,
    imageType: string,
    peopleCount: number,
    instructions: string
): Promise<SplitBillResult> {
    const userPrompt = `Number of people: ${peopleCount}

Instructions for splitting:
${instructions || 'No specific instructions. Please distribute items as evenly as possible.'}

Analyze the receipt image and provide the split breakdown.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-split-bill.app',
            'X-Title': 'AI Split Bill'
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: userPrompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${imageType};base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.1,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No response content from AI');
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    try {
        return JSON.parse(jsonStr) as SplitBillResult;
    } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${content}`);
    }
}

export async function processReceipt(
    imageBase64: string,
    imageType: string,
    peopleCount: number,
    instructions: string
): Promise<SplitBillResult> {
    const defaultModel = OPENROUTER_MODEL_DEFAULT || 'openai/gpt-4o-mini';
    const fallbackModel = OPENROUTER_MODEL_FALLBACK || 'google/gemini-2.0-flash-001';

    try {
        // Try default model first
        return await callOpenRouter(defaultModel, imageBase64, imageType, peopleCount, instructions);
    } catch (error) {
        console.error(`Default model (${defaultModel}) failed:`, error);

        // Try fallback model
        try {
            console.log(`Attempting fallback model: ${fallbackModel}`);
            return await callOpenRouter(fallbackModel, imageBase64, imageType, peopleCount, instructions);
        } catch (fallbackError) {
            console.error(`Fallback model (${fallbackModel}) also failed:`, fallbackError);
            throw new Error('Both AI models failed to process the receipt. Please try again.');
        }
    }
}
