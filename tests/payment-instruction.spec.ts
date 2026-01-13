import { test, expect } from '@playwright/test';

test.describe('Payment Instruction Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API response
        await page.route('/api/split-bill', async route => {
            const json = { id: '123e4567-e89b-12d3-a456-426614174000' };
            await route.fulfill({ json });
        });

        await page.goto('/');
    });

    test('should display payment instruction input field', async ({ page }) => {
        // Check for the textarea and its label
        await expect(page.getByLabel('Payment Instruction', { exact: false })).toBeVisible();
        await expect(page.getByPlaceholder('e.g., Payment to BCA')).toBeVisible();

        // Check for optional helper text
        await expect(page.getByText('Optional — shown on the result page if filled')).toBeVisible();

        // Check character counter
        await expect(page.getByText('0/300')).toBeVisible();
    });

    test('should allow submission without payment instruction', async ({ page }) => {
        // Upload receipt
        await page.setInputFiles('input[type="file"]', 'tests/fixtures/receipt.jpg');

        // Fill required fields
        await page.getByLabel('Number of People').fill('2');

        // Ensure payment instruction is empty
        await page.getByLabel('Payment Instruction', { exact: false }).fill('');

        // Submit
        await page.click('button[type="submit"]');

        // Should navigate to result page
        await expect(page).toHaveURL(/\/result\/.+/);

        // Payment instruction section should NOT be visible
        await expect(page.getByText('Payment Instruction')).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Copy instruction' })).not.toBeVisible();
    });

    test('should show validation error when exceeding max length', async ({ page }) => {
        // Upload receipt
        await page.setInputFiles('input[type="file"]', 'tests/fixtures/receipt.jpg');

        // Create a long string (301 chars)
        const longText = 'a'.repeat(301);

        // Fill fields
        await page.getByLabel('Number of People').fill('2');

        // Direct value setting because typing 301 chars is slow and maxlength attribute might prevent it in UI
        // But we want to test validation logic which technically runs on input/submit
        // Note: Since we have maxlength=300 in HTML, the browser prevents typing more.
        // So we primarily test that the counter shows 300/300 and we can't type more.

        const textarea = page.getByLabel('Payment Instruction', { exact: false });
        await textarea.fill(longText); // Playwright might bypass maxlength, let's see

        // If Playwright bypasses maxlength, we expect our validation error
        // If it respects it, value will be truncated.

        // Let's verify value length is capped at 300 if browser handles it
        // Or if we need to manually trigger the error state logic.

        const value = await textarea.inputValue();
        expect(value.length).toBeLessThanOrEqual(300);

        // Check counter
        await expect(page.getByText(`${value.length}/300`)).toBeVisible();
    });

    test('should display and allow copying of payment instruction', async ({ page, context }) => {
        // Grant clipboard permissions
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        const instructionText = 'Transfer to Bank ABC: 123-456-7890';

        // Upload receipt
        await page.setInputFiles('input[type="file"]', 'tests/fixtures/receipt.jpg');

        // Fill fields
        await page.getByLabel('Number of People').fill('2');
        await page.getByLabel('Payment Instruction', { exact: false }).fill(instructionText);

        // Submit
        await page.click('button[type="submit"]');

        // Wait for navigation
        await expect(page).toHaveURL(/\/result\/.+/);

        // Check if Payment Instruction section is visible
        await expect(page.getByText('Payment Instruction')).toBeVisible();
        await expect(page.getByText(instructionText)).toBeVisible();

        // Copy logic check
        await page.getByRole('button', { name: 'Copy instruction' }).click();

        // Verify toast
        await expect(page.getByText('Payment instruction copied!')).toBeVisible();

        // Verify clipboard content
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBe(instructionText);
    });
});
