import { test, expect } from '@playwright/test';

test.describe('Admin User Management', () => {
    // Note: These tests require authentication. In a real scenario,
    // we would mock the auth or use test fixtures. For now, we test
    // that the routes are protected and redirect properly.

    test('should redirect to login when accessing /admin/dashboard/users unauthenticated', async ({ page }) => {
        await page.goto('/admin/dashboard/users');
        await expect(page).toHaveURL('/admin/login');
    });

    // The following tests would require authenticated session mocking.
    // For now, we just verify the route protection is in place.

    test('should show login page with email and password fields', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test('should show validation error for invalid credentials', async ({ page }) => {
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'invalid@test.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Wait for error message (Supabase will return auth error)
        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
    });
});
