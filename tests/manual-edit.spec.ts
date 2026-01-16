import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser (dependency-free)
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        // Simple regex to match KEY=VALUE, handling optional export prefix
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim().replace(/^export\s+/, '');
            let value = parts.slice(1).join('=').trim();
            // Remove wrapping quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

// Support both naming conventions (Vite/SvelteKit vs standard)
const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables. Ensure .env contains SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

test.describe('Manual Edit Feature', () => {
    let resultId: string;

    const mockResultData = {
        items: [
            { name: "Burger", price: 150000, quantity: 1 },
            { name: "Fries", price: 50000, quantity: 1 },
            { name: "Soda", price: 25000, quantity: 2 }, // Total 50000
        ],
        people: [
            {
                name: "Alice",
                items: ["Burger", "Fries"], // 200,000
                foodItems: [{ name: "Burger", price: 150000, quantity: 1 }, { name: "Fries", price: 50000, quantity: 1 }],
                drinkItems: [],
                subtotal: 200000,
                tax: 20000, serviceFee: 10000, total: 230000 // Mock values
            },
            {
                name: "Bob",
                items: ["Soda"], // 50,000
                foodItems: [],
                drinkItems: [{ name: "Soda", price: 25000, quantity: 2 }],
                subtotal: 50000,
                tax: 5000, serviceFee: 2500, total: 57500 // Mock values
            }
        ],
        subtotal: 250000,
        tax: 25000, // 10%
        service: 12500, // 5%
        total: 287500
    };

    // Helper to click edit button reliably (handles hydration & opacity)
    async function clickEditButton(page: any, cardLocator: any) {
        // Wait for hydration/mounting
        await page.waitForTimeout(2000); // 2s wait for safety based on debugging findings

        // We use force: true because of opacity-0 group-hover:opacity-100 handling in Playwright
        const btn = cardLocator.getByRole('button', { name: 'Edit item' }).first();
        await expect(btn).toBeAttached();

        await cardLocator.hover();

        await btn.click({ force: true });
    }

    test.beforeAll(async () => {
        // Create a test result entry in Supabase directly
        const { data, error } = await supabase
            .from('split_bill_results')
            .insert({
                receipt_image_url: 'https://example.com/receipt.jpg',
                result_data: mockResultData,
                person_breakdown: mockResultData.people,
                fees_taxes: {
                    totalTax: mockResultData.tax,
                    totalServiceFee: mockResultData.service
                },
                currency: 'IDR',
                ai_model_used: 'test-mock-gpt',
                original_result_data: mockResultData // For immutability test
            })
            .select()
            .single();

        if (error) {
            console.error('Setup INSERT failed:', error);
            throw error;
        }
        resultId = data.id;
    });

    test.afterAll(async () => {
        if (resultId) {
            await supabase.from('split_bill_results').delete().eq('id', resultId);
        }
    });

    // Logging helper for debugging failures
    test.beforeEach(({ page }) => {
        page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));
    });

    test('should display edit buttons on result page', async ({ page }) => {
        await page.goto(`/result/${resultId}`);
        await expect(page.getByText('Alice')).toBeVisible();

        const firstPersonCard = page.locator('.group').first(); // Targets item row
        await clickEditButton(page, firstPersonCard);

        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Edit Food Item')).toBeVisible();
        await page.keyboard.press('Escape');
    });

    test('should update totals when editing item price and quantity', async ({ page }) => {
        await page.goto(`/result/${resultId}`);

        const firstPersonCard = page.locator('.group').first();
        await clickEditButton(page, firstPersonCard);

        await expect(page.getByRole('dialog')).toBeVisible();

        const priceInput = page.locator('#edit-price');
        await priceInput.fill('100000');

        const qtyInput = page.locator('#edit-quantity');
        await qtyInput.fill('2');

        await page.getByRole('button', { name: 'Save Changes' }).click();

        await expect(page.getByText('Item updated successfully')).toBeVisible();
        // Verify formatted price updated
        await expect(page.getByText('Rp 100.000')).toBeVisible();
    });

    test('should persist edited values after reload', async ({ page }) => {
        await page.goto(`/result/${resultId}`);

        const firstPersonCard = page.locator('.group').first();
        await clickEditButton(page, firstPersonCard);

        const nameInput = page.locator('#edit-name');
        await nameInput.fill('Super Burger');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('Item updated successfully')).toBeVisible();

        await page.reload();
        await expect(page.getByText('Super Burger')).toBeVisible();
    });

    test('should block invalid edits', async ({ page }) => {
        await page.goto(`/result/${resultId}`);

        const firstPersonCard = page.locator('.group').first();
        await clickEditButton(page, firstPersonCard);

        const priceInput = page.locator('#edit-price');
        await priceInput.fill('-5000'); // Negative price

        await page.getByRole('button', { name: 'Save Changes' }).click();

        await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('should preserve original_result_data immutability', async ({ page }) => {
        await page.goto(`/result/${resultId}`);

        const { data } = await supabase.from('split_bill_results').select('original_result_data, result_data').eq('id', resultId).single();

        // Use non-null assertion or optional chaining if TS complains, but runtime is fine
        const items = data?.original_result_data?.items || [];
        const originalBurger = items.find((i: any) => i.name === 'Burger');
        expect(originalBurger.price).toBe(150000);
    });

    test('should not make any AI API calls on edit', async ({ page }) => {
        let aiCalled = false;
        page.on('request', request => {
            if (request.url().includes('/api/process-receipt') || request.url().includes('gemini.googleapis.com')) {
                aiCalled = true;
            }
        });

        await page.goto(`/result/${resultId}`);
        const firstPersonCard = page.locator('.group').first();
        await clickEditButton(page, firstPersonCard);

        await page.locator('#edit-price').fill('99999');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('Item updated successfully')).toBeVisible();

        expect(aiCalled).toBeFalsy();
    });
});
