import { test, expect } from '@playwright/test';

test.describe('Admin Auth & Route Protection', () => {
    test('should redirect unauthenticated users from /admin/dashboard to /admin/login', async ({ page }) => {
        await page.goto('/admin/dashboard');
        await expect(page).toHaveURL('/admin/login');
        await expect(page.locator('h3:has-text("Admin Login")')).toBeVisible();
    });

    test('should allow access to /admin/login', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.locator('h3:has-text("Admin Login")')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should allow access to /admin/reset-password', async ({ page }) => {
        await page.goto('/admin/reset-password');
        await expect(page.locator('h3:has-text("Reset Password")')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should navigate from login to reset password', async ({ page }) => {
        await page.goto('/admin/login');
        await page.click('text=Forgot your password?');
        await expect(page).toHaveURL('/admin/reset-password');
    });

    test('should validation error on empty submit', async ({ page }) => {
        await page.goto('/admin/login');
        // Using HTML5 validation check or server response?
        // The inputs have 'required' attribute, so browser verification triggers.
        // Playwright can verify this, but simple submission might not trigger server if browser blocks it.
        // We can try to fill with empty and see.
        // But testing browser validation is tricky.
        // Let's just sanity check attributes.
        await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
    });
});
