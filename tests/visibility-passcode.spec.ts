import { test, expect } from '@playwright/test';

/**
 * Public/Private Result with Passcode Protection E2E Tests
 * 
 * Tests for Phase 6 features:
 * - Visibility selector (Public/Private toggle)
 * - Conditional passcode field
 * - Passcode prompt on result page
 * - Passcode verification flow
 * 
 * Note: Tests involving file upload are skipped due to Svelte 5 + Playwright
 * compatibility issues with bind:files.
 */

test.describe('Visibility Selector Tests', () => {

    test('should display visibility selector with Public as default', async ({ page }) => {
        await page.goto('/');

        // Verify visibility section exists
        await expect(page.getByText('Result Visibility')).toBeVisible();

        // Verify Public button is present and appears selected (default variant)
        const publicButton = page.getByRole('button', { name: 'Public' });
        await expect(publicButton).toBeVisible();

        // Verify Private button is present
        const privateButton = page.getByRole('button', { name: 'Private' });
        await expect(privateButton).toBeVisible();

        // Verify public description is shown (default state)
        await expect(page.getByText('Anyone with the link can view the split result.')).toBeVisible();

        // Verify passcode field is NOT visible (public mode)
        await expect(page.getByLabel('Passcode')).not.toBeVisible();
    });

    test('should toggle to Private and show passcode field', async ({ page }) => {
        await page.goto('/');

        // Wait for page to fully hydrate
        await page.waitForLoadState('networkidle');

        // Click Private button
        const privateButton = page.getByRole('button', { name: 'Private' });
        await privateButton.click();

        // Wait for state change to propagate
        await page.waitForTimeout(300);

        // Verify private description is shown
        await expect(page.getByText('A passcode will be required to view the split result.')).toBeVisible({ timeout: 5000 });

        // Verify passcode field IS visible - use ID selector
        await expect(page.locator('#passcode')).toBeVisible();
    });

    test('should toggle back to Public and hide passcode field', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // First toggle to Private
        await page.getByRole('button', { name: 'Private' }).click();
        await page.waitForTimeout(300);
        await expect(page.locator('#passcode')).toBeVisible();

        // Toggle back to Public
        await page.getByRole('button', { name: 'Public' }).click();
        await page.waitForTimeout(300);

        // Verify passcode field is hidden again
        await expect(page.locator('#passcode')).not.toBeVisible();
        await expect(page.getByText('Anyone with the link can view the split result.')).toBeVisible();
    });

    test('should show passcode show/hide toggle', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Toggle to Private
        await page.getByRole('button', { name: 'Private' }).click();
        await page.waitForTimeout(300);

        const passcodeInput = page.locator('#passcode');
        await expect(passcodeInput).toBeVisible();

        // Input should be password type by default
        await expect(passcodeInput).toHaveAttribute('type', 'password');

        // Enter a passcode
        await passcodeInput.fill('test123');

        // Find and click the show/hide toggle button (uses relative locator)
        const toggleButton = page.locator('#passcode ~ button');
        await toggleButton.click();
        await page.waitForTimeout(100);

        // After clicking, type should change to 'text'
        await expect(passcodeInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await toggleButton.click();
        await page.waitForTimeout(100);
        await expect(passcodeInput).toHaveAttribute('type', 'password');
    });

    test('should disable submit when Private selected but no passcode', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const submitButton = page.getByRole('button', { name: 'Split Bill with AI' });

        // Fill people count
        await page.getByLabel('Number of People').fill('2');

        // Toggle to Private (no passcode)
        await page.getByRole('button', { name: 'Private' }).click();
        await page.waitForTimeout(300);

        // Submit should still be disabled (needs file + passcode)
        await expect(submitButton).toBeDisabled();

        // Enter passcode
        await page.locator('#passcode').fill('1234');

        // Still disabled because no file uploaded
        await expect(submitButton).toBeDisabled();
    });

});

test.describe('Passcode Validation Tests', () => {

    test('should accept passcode up to 8 characters', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: 'Private' }).click();
        await page.waitForTimeout(300);

        const passcodeInput = page.locator('#passcode');

        // Fill exactly 8 characters
        await passcodeInput.fill('12345678');
        await expect(passcodeInput).toHaveValue('12345678');

        // Verify maxlength attribute
        await expect(passcodeInput).toHaveAttribute('maxlength', '8');
    });

    test('should enforce maxlength of 8 characters', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: 'Private' }).click();
        await page.waitForTimeout(300);

        const passcodeInput = page.locator('#passcode');

        // Try to enter more than 8 characters
        await passcodeInput.fill('123456789012');

        // Should only contain first 8 characters due to maxlength
        await expect(passcodeInput).toHaveValue('12345678');
    });

});

test.describe('Result Page Passcode Prompt Tests', () => {

    // Note: These tests require seeded data or API mocking for private results
    // For now, we test the UI behavior conceptually

    test('should show result page header correctly for public results', async ({ page }) => {
        // Navigate to result page (empty state)
        await page.goto('/result');

        // Should show empty state (not passcode prompt)
        await expect(page.getByText('No Receipt Found')).toBeVisible();
    });

    // Skip: Requires creating a private result first (needs file upload)
    test.skip('should show passcode prompt for private result', async ({ page }) => {
        // This would require:
        // 1. Creating a private result via API
        // 2. Navigating to the result URL
        // 3. Verifying passcode prompt appears
        // 
        // Due to file upload limitations, this requires manual testing or API mocking
    });

    // Skip: Requires a valid private result ID
    test.skip('should unlock result with correct passcode', async ({ page }) => {
        // This would verify:
        // 1. Enter correct passcode
        // 2. Click Unlock Result
        // 3. Verify result content is revealed
    });

    // Skip: Requires a valid private result ID
    test.skip('should show error with incorrect passcode', async ({ page }) => {
        // This would verify:
        // 1. Enter incorrect passcode
        // 2. Click Unlock Result
        // 3. Verify error alert appears
    });

});

test.describe('API Endpoint Tests', () => {

    test('verify-passcode endpoint returns 400 for missing id', async ({ request }) => {
        const response = await request.post('/api/verify-passcode', {
            data: { passcode: 'test123' }
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Result ID is required');
    });

    test('verify-passcode endpoint returns 400 for missing passcode', async ({ request }) => {
        const response = await request.post('/api/verify-passcode', {
            data: { id: '12345678-1234-4123-8123-123456789012' }
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Passcode is required');
    });

    test('verify-passcode endpoint returns 400 for invalid UUID', async ({ request }) => {
        const response = await request.post('/api/verify-passcode', {
            data: { id: 'invalid-uuid', passcode: 'test123' }
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Invalid result ID');
    });

    test('verify-passcode endpoint returns 404 for non-existent result', async ({ request }) => {
        const response = await request.post('/api/verify-passcode', {
            data: {
                id: '00000000-0000-4000-8000-000000000000',
                passcode: 'test123'
            }
        });

        expect(response.status()).toBe(404);
        const body = await response.json();
        expect(body.error).toBe('Result not found');
    });

});
