import { test, expect } from '@playwright/test';

test.describe('Admin Split Bill Listing', () => {
    test('should redirect to login when accessing /admin/dashboard/bills unauthenticated', async ({ page }) => {
        await page.goto('/admin/dashboard/bills');
        await expect(page).toHaveURL('/admin/login');
    });

    test('should show login page elements', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    // Note: Full authenticated tests would require session mocking.
    // These tests verify route protection is in place.
});
