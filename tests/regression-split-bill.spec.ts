
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual .env parser
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

// Load environment variables from .env file
loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Skipping regression tests involving DB seeding because Supabase env vars are missing.');
}

const supabase = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

test.describe('Regression: Result Visibility', () => {
    test.skip(!supabase, 'Skipped because Supabase credentials are missing');

    test('should load Public result immediately (no auth)', async ({ page }) => {
        if (!supabase) return;

        // Seed Public Result
        const peopleData = [
            {
                name: "Alice",
                foodItems: [],
                drinkItems: [],
                subtotal: 50,
                tax: 0,
                serviceFee: 0,
                total: 50
            },
            {
                name: "Bob",
                foodItems: [],
                drinkItems: [],
                subtotal: 50,
                tax: 0,
                serviceFee: 0,
                total: 50
            }
        ];

        const { data, error } = await supabase.from('split_bill_results').insert({
            result_data: {
                people: peopleData,
                grandTotal: 100
            },
            person_breakdown: peopleData,
            receipt_image_url: 'https://example.com/receipt.jpg',
            ai_model_used: 'test-model-regression',
            currency: 'USD',
            visibility: 'public'
        }).select().single();

        expect(error).toBeNull();
        const resultId = data.id;

        // Visit Result Page
        await page.goto(`/result/${resultId}`);

        // Assertion: Should see the result content immediately
        await expect(page.getByText('Alice')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Bob')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
    });

    test('should load Private result only after passcode', async ({ page }) => {
        if (!supabase) return;

        const passcode = '12345678';
        const hashedPassword = await bcrypt.hash(passcode, 10);

        // Seed Private Result
        const peopleData = [
            {
                name: "Charlie",
                foodItems: [],
                drinkItems: [],
                subtotal: 100,
                tax: 0,
                serviceFee: 0,
                total: 100
            },
            {
                name: "Dave",
                foodItems: [],
                drinkItems: [],
                subtotal: 100,
                tax: 0,
                serviceFee: 0,
                total: 100
            }
        ];

        const { data, error } = await supabase.from('split_bill_results').insert({
            result_data: {
                people: peopleData,
                grandTotal: 200
            },
            person_breakdown: peopleData,
            receipt_image_url: 'https://example.com/receipt.jpg',
            ai_model_used: 'test-model-regression',
            currency: 'USD',
            visibility: 'private',
            passcode_hash: hashedPassword
        }).select().single();

        expect(error).toBeNull();
        const resultId = data.id;

        // Visit Result Page
        await page.goto(`/result/${resultId}`);

        // Assertion: Should NOT see content yet
        await expect(page.getByText('Charlie')).not.toBeVisible();

        // Should find passcode input
        const passcodeInput = page.locator('#result-passcode');
        await expect(passcodeInput).toBeVisible();

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500); // Extra safety

        // Enter Passcode
        await passcodeInput.click({ force: true });
        await passcodeInput.clear(); // Ensure empty
        await passcodeInput.pressSequentially(passcode, { delay: 150 });
        // Ensure Svelte binding updates
        await passcodeInput.press('Tab');
        await expect(passcodeInput).toHaveValue(passcode);

        // Wait for button to become enabled
        const submitButton = page.getByRole('button', { name: /unlock result/i });
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        // Assertion: Should NOW see content
        await expect(page.getByText('Charlie')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Dave')).toBeVisible();
    });
});
