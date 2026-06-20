import { expect, test } from '@playwright/test';

test.describe('Contact Page E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the contact page
		await page.goto('/contact', { waitUntil: 'domcontentloaded' });
	});

	test('should display all contact page elements and form inputs', async ({ page }) => {
		// Verify heading and identity
		await expect(page.locator('h2')).toContainText('Mikeu');

		// Verify information shards
		await expect(page.locator('.origami-shard').first()).toBeVisible();

		// Verify form elements
		await expect(page.locator('input[name="name"]')).toBeVisible();
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('textarea[name="message"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should copy email address to clipboard on button click', async ({ page }) => {
		// Mock clipboard API in the browser window
		await page.evaluate(() => {
			(window as any).copiedText = '';
			navigator.clipboard.writeText = async (text) => {
				(window as any).copiedText = text;
			};
		});

		// Find the email shard, hover it to make the copy button visible, then click it
		const emailShard = page.locator('.origami-shard', { hasText: 'rikiruswandi28@gmail.com' });
		await emailShard.hover();
		const copyButton = emailShard.locator('button');
		await copyButton.click();

		// Verify the copied text
		const copiedText = await page.evaluate(() => (window as any).copiedText);
		expect(copiedText).toBe('rikiruswandi28@gmail.com');
	});

	test('should handle successful form submission and show success toast', async ({ page }) => {
		// Fill in valid form inputs
		await page.locator('input[name="name"]').fill('E2E Tester');
		await page.locator('input[name="email"]').fill('e2e@test.com');
		await page
			.locator('textarea[name="message"]')
			.fill('Hello from Playwright E2E test! (10+ characters)');

		// Submit the form
		await page.locator('button[type="submit"]').click();

		// Check for success toast notification
		const toastMessage = page.locator('li[data-sonner-toast]');
		await expect(toastMessage).toBeVisible({ timeout: 10000 });
		await expect(toastMessage).toContainText('Your message has been sent successfully!');
	});

	test('should handle failed form submission and show error toast', async ({ page }) => {
		// Fill in invalid form inputs (email valid format to pass HTML5 check, message too short)
		await page.locator('input[name="name"]').fill('E2E Tester');
		await page.locator('input[name="email"]').fill('e2e-valid-format@test.com');
		await page.locator('textarea[name="message"]').fill('Short');

		// Submit the form
		await page.locator('button[type="submit"]').click();

		// Check for error toast notification
		const toastMessage = page.locator('li[data-sonner-toast]');
		await expect(toastMessage).toBeVisible({ timeout: 10000 });
		await expect(toastMessage).toContainText('Validation error');
	});
});
