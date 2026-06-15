import { expect, test } from '@playwright/test';

test.describe('Folded World Interaction Map', () => {
	test('should render canvas, HUD, and allow mode switching', async ({ page }) => {
		// Navigate to the world page
		await page.goto('/world', { waitUntil: 'domcontentloaded' });

		// Wait for the engine to initialize and drop the loading screen
		// The loading screen has a text that says "LOADING FOLDED_WORLD" and then disappears
		// Or we can just wait for the canvas to be visible
		const canvas = page.locator('.folded-world-canvas');
		await expect(canvas).toBeVisible({ timeout: 10000 });

		// Verify HUD Elements
		const hudTitle = page.locator('.hud-title');
		await expect(hudTitle).toBeVisible();
		await expect(hudTitle).toContainText('FOLDED');

		const totalStats = page.locator('.hud-stat-label:has-text("TOTAL")');
		await expect(totalStats).toBeVisible();

		const modeToggleFold = page.locator('.hud-mode-btn:has-text("FOLD")');
		const modeToggleHeat = page.locator('.hud-mode-btn:has-text("HEAT")');
		const modeToggleTime = page.locator('.hud-mode-btn:has-text("TIME")');

		await expect(modeToggleFold).toBeVisible();
		await expect(modeToggleHeat).toBeVisible();
		await expect(modeToggleTime).toBeVisible();

		// Verify Interactions
		// Click HEAT mode
		await modeToggleHeat.click();
		await expect(modeToggleHeat).toHaveClass(/active/);

		// Click TIME mode
		await modeToggleTime.click();
		await expect(modeToggleTime).toHaveClass(/active/);

		// Click FOLD mode back
		await modeToggleFold.click();
		await expect(modeToggleFold).toHaveClass(/active/);

		// Verify Legend reflects the mode
		const legendHeader = page.locator('.legend-header');
		await expect(legendHeader).toContainText('FOLD');
	});
});
