import { test, expect } from '@playwright/test';

test('Checkout Page loads and displays elements', async ({ page }) => {
    await page.goto('/checkout');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Gascart/);

    // Check if main checkout container exists
    const checkoutContainer = page.locator('div.container');
    await expect(checkoutContainer).toBeVisible();
});
