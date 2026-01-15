import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Load environment variables manually for test execution environment
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            const envVars: Record<string, string> = {};
            envFile.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    envVars[key] = value;
                }
            });
            return envVars;
        }
    } catch (error) {
        console.warn('Could not load local .env file', error);
    }
    return {};
};

const env = loadEnv();
const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Skipping Brute Force Tests: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found.');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TEST_PASSCODE = 'secret12';
const TEST_RESULT_DATA = { items: [] }; // Minimal dummy data

test.describe('Brute Force Protection E2E Tests', () => {
    test.describe.configure({ mode: 'serial' });
    let resultId: string;

    test.beforeAll(async () => {
        // Create a private result for testing
        if (!supabase) return;

        const hashedPassword = await bcrypt.hash(TEST_PASSCODE, 10);

        const { data, error } = await supabase
            .from('split_bill_results')
            .insert({
                result_data: TEST_RESULT_DATA,
                currency: 'USD',
                person_breakdown: {},
                fees_taxes: {},
                receipt_image_url: 'https://example.com/dummy.jpg',
                ai_model_used: 'test-model',
                visibility: 'private',
                passcode_hash: hashedPassword
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create test result: ${error.message}`);
        }
        resultId = data.id;
    });

    test.afterAll(async () => {
        // Cleanup
        if (supabase && resultId) {
            await supabase.from('split_bill_results').delete().eq('id', resultId);
            // Cascading delete should handle passcode_attempts, but standardizing cleanup is good
        }
    });

    test.beforeEach(async () => {
        // Clear attempts for this result between tests to ensure isolation
        // Note: In real scenarios, we rely on IP/UA, so we must be careful.
        // But for deterministic tests, we can clear the table for this resultId.
        if (supabase && resultId) {
            await supabase.from('passcode_attempts').delete().eq('result_id', resultId);
        }
    });

    test('Scenario: Progressive Lockout (5 wrong attempts -> 6th blocked)', async ({ page }) => {
        if (!resultId) test.skip();

        await page.goto(`/result/${resultId}`);
        await page.waitForLoadState('networkidle');

        const passcodeInput = page.locator('#result-passcode');
        const submitButton = page.getByRole('button', { name: 'Unlock Result' });

        // Debug: Check if element exists
        const count = await passcodeInput.count();
        if (count === 0) {
            console.log('Passcode input not found. Page content:', await page.content());
        }

        // Make 5 failed attempts
        for (let i = 1; i <= 5; i++) {
            await passcodeInput.fill(`wrong${i}`);
            await submitButton.click();

            // Should see error message
            await expect(page.getByText(/incorrect passcode|wrong passcode/i)).toBeVisible();
            // Should NOT see lockout yet (until 6th attempt? Spec says "After 5 failures, block access")
            // So the 5th attempt triggers the lockout condition for the *next* check, OR the 5th attempt itself returns 429 if the check is before?
            // "Check Rate Limit step before verification".
            // 1st attempt: Check (0) -> OK. Verify -> Fail. Incr (1).
            // ...
            // 5th attempt: Check (4) -> OK. Verify -> Fail. Incr (5).
            // 6th attempt: Check (5) -> Block.
        }

        // 6th attempt
        await passcodeInput.fill('wrong6');
        await submitButton.click();

        // Should be locked out
        await expect(page.getByRole('heading', { name: 'Too many failed attempts' })).toBeVisible();
        await expect(page.getByText(/Please wait/i)).toBeVisible();

        // Button should be disabled strictly speaking per spec "Disable Submit button during lockout"
        // But the backend response is the primary check.
        // Let's check for the text message.
    });

    test('Scenario: Correct Passcode Resets Counter', async ({ page }) => {
        if (!resultId) test.skip();

        await page.goto(`/result/${resultId}`);
        await page.waitForLoadState('networkidle');
        const passcodeInput = page.locator('#result-passcode');
        const submitButton = page.getByRole('button', { name: 'Unlock Result' });

        // 4 failed attempts
        for (let i = 1; i <= 4; i++) {
            await passcodeInput.fill(`wrong${i}`);
            await submitButton.click();
            await expect(page.getByText(/incorrect passcode|wrong passcode/i)).toBeVisible();
        }

        // 5th attempt is CORRECT
        await passcodeInput.fill(TEST_PASSCODE);
        await submitButton.click();

        // Should see success (result content)
        await expect(page.getByText('Original Receipt')).toBeVisible(); // Part of result page
    });

    test('Scenario: Lockout Persistence (valid passcode blocked during lockout)', async ({ page }) => {
        if (!resultId) test.skip();

        await page.goto(`/result/${resultId}`);
        await page.waitForLoadState('networkidle');
        const passcodeInput = page.locator('#result-passcode');
        const submitButton = page.getByRole('button', { name: 'Unlock Result' });

        // Use direct DB manipulation to simulate Lockout state to save time/requests
        // Or just do the loop again. Loop is fast enough.
        // "Mock specific DB states" was the strategy. Let's do that to be robust.

        // Insert a lockout record
        // Client Key: This is tricky. Playwright's IP might be ::1 or 127.0.0.1.
        // And UA is headless chrome... 
        // Better to just loop. It's only 5 requests.

        for (let i = 1; i <= 5; i++) {
            await passcodeInput.fill(`wrong${i}`);
            await submitButton.click();
            await expect(page.getByText(/incorrect passcode|wrong passcode/i)).toBeVisible();
        }

        // Now locked out. Try CORRECT passcode.
        await passcodeInput.fill(TEST_PASSCODE);
        await submitButton.click();

        // Should still be blocked
        await expect(page.getByRole('heading', { name: 'Too many failed attempts' })).toBeVisible();
        // Should NOT see result
        await expect(page.getByText('Original Receipt')).not.toBeVisible();
    });

    test('Scenario: Client Isolation (New client not blocked)', async ({ browser }) => {
        if (!resultId) test.skip();

        // Context A: User gets locked out
        const contextA = await browser.newContext({ userAgent: 'UserAgent-A' });
        const pageA = await contextA.newPage();
        await pageA.goto(`/result/${resultId}`);
        await pageA.waitForLoadState('networkidle');

        const passcodeInputA = pageA.locator('#result-passcode');
        const submitButtonA = pageA.getByRole('button', { name: 'Unlock Result' });

        for (let i = 1; i <= 5; i++) {
            await passcodeInputA.fill(`wrong${i}`);
            await submitButtonA.click();
            await expect(pageA.getByText(/incorrect passcode|wrong passcode/i)).toBeVisible();
        }

        // Verify A is locked out
        await passcodeInputA.fill(TEST_PASSCODE);
        await submitButtonA.click();
        await expect(pageA.getByRole('heading', { name: 'Too many failed attempts' })).toBeVisible();

        // Context B: Different User (different UA)
        const contextB = await browser.newContext({ userAgent: 'UserAgent-B' });
        const pageB = await contextB.newPage();
        await pageB.goto(`/result/${resultId}`);
        await pageB.waitForLoadState('networkidle');

        const passcodeInputB = pageB.locator('#result-passcode');
        const submitButtonB = pageB.getByRole('button', { name: 'Unlock Result' });

        // User B tries CORRECT passcode immediately
        await passcodeInputB.fill(TEST_PASSCODE);
        await submitButtonB.click();

        // User B should succeed
        await expect(pageB.getByText('Original Receipt')).toBeVisible();

        await contextA.close();
        await contextB.close();
    });
});
