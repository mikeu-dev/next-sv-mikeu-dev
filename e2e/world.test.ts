import { expect, test } from '@playwright/test';

test.describe('Jejak Pengunjung (visitor hex map)', () => {
	test('renders the hex map, stats and mode switcher', async ({ page }) => {
		page.on('pageerror', (err) => {
			console.error(`[BROWSER ERROR]: ${err.message}`);
		});

		await page.goto('/world', { waitUntil: 'domcontentloaded' });

		await expect(page.locator('h1')).toBeVisible();
		// The land mask is drawn as one <use> per hexagon.
		await expect(page.locator('svg .hexes use').first()).toBeAttached();
		expect(await page.locator('svg .hexes use').count()).toBeGreaterThan(900);

		const modes = page
			.getByRole('group')
			.filter({ has: page.locator('button[aria-pressed]') })
			.last();
		const buttons = modes.locator('button');
		await expect(buttons).toHaveCount(3);
		await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');

		await buttons.nth(2).click();
		await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
		await expect(page.locator('.board')).toHaveClass(/mode-flow/);
	});
});
