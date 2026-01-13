import { test, expect } from '@playwright/test';

test.describe('Admin Split Bill Detail', () => {
    test('should redirect to login when accessing bill detail unauthenticated', async ({ page }) => {
        // Use a fake UUID format
        await page.goto('/admin/dashboard/bills/00000000-0000-0000-0000-000000000000');
        await expect(page).toHaveURL('/admin/login');
    });

    test('should show login form on /admin/login', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    // Note: Full tests for authenticated detail view would require session mocking
    // and a real bill ID in the database. These tests verify route protection.
});
