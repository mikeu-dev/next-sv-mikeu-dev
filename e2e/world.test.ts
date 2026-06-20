import { expect, test } from '@playwright/test';

test.describe('Folded World Interaction Map', () => {
	test('should render canvas, HUD, and allow mode switching', async ({ page }) => {
		// Print browser console logs to E2E test stdout
		page.on('console', (msg) => {
			console.log(`[BROWSER CONSOLE] [${msg.type()}]: ${msg.text()}`);
		});
		page.on('pageerror', (err) => {
			console.error(`[BROWSER ERROR]: ${err.message}`);
		});

		// Navigate to the world page
		await page.goto('/world', { waitUntil: 'domcontentloaded' });

		// Wait for the engine to initialize and drop the loading screen
		const canvas = page.locator('.folded-world-canvas');
		await expect(canvas).toBeVisible({ timeout: 10000 });

		// Verify HUD Elements
		const hudTitle = page.locator('.hud-title');
		await expect(hudTitle).toBeVisible();
		expect(await hudTitle.textContent()).toContain('FOLDED');

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
		await modeToggleHeat.click({ force: true });
		await expect(modeToggleHeat).toHaveClass(/active/);

		// Click TIME mode
		await modeToggleTime.click({ force: true });
		await expect(modeToggleTime).toHaveClass(/active/);

		// Click FOLD mode back
		await modeToggleFold.click({ force: true });
		await expect(modeToggleFold).toHaveClass(/active/);

		// Verify Legend reflects the mode
		const legendHeader = page.locator('.legend-header');
		expect(await legendHeader.textContent()).toContain('FOLD');
	});
});
