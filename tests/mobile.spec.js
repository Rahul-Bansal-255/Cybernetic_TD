import { test, expect, startGame, game, cellPoint, findBuildableCell } from './helpers.js';

test.describe('Mobile touch play', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await game(page, g => { g.isPaused = true; });
  });

  test('quick bar replaces the sidebar on small screens', async ({ page }) => {
    await expect(page.locator('#mobile-quick-bar')).toBeVisible();
    await expect(page.locator('#mobile-power-orbital')).toBeVisible();
    await expect(page.locator('#mobile-btn-call-wave')).toBeVisible();

    await page.locator('#btn-toggle-sidebar').tap();
    await expect(page.locator('#tactical-sidebar')).toHaveClass(/mobile-open/);
    await page.locator('#btn-close-sidebar').tap();
    await expect(page.locator('#tactical-sidebar')).not.toHaveClass(/mobile-open/);
  });

  test('tap to build, inspect, upgrade and recycle a tower', async ({ page }) => {
    const cell = await findBuildableCell(page, 30);
    await page.locator('#card-tower-gatling').tap();
    const p = await cellPoint(page, cell.col, cell.row);
    await page.touchscreen.tap(p.x, p.y);

    await expect.poll(() => game(page, g => g.towers.length)).toBe(1);
    await expect(page.locator('#mobile-tower-sheet')).toBeVisible();
    await expect(page.locator('#mts-name')).toHaveText('PULSE BLASTER');

    await page.locator('#mts-btn-upgrade').tap();
    await expect(page.locator('#mts-tier')).toContainText('T2');

    const before = await game(page, g => g.credits);
    await page.locator('#mts-btn-sell').tap();
    expect(await game(page, g => g.towers.length)).toBe(0);
    expect(await game(page, g => g.credits)).toBe(before + 165);
    await expect(page.locator('#mobile-tower-sheet')).toBeHidden();
  });

  test('mobile superweapon and wave buttons work', async ({ page }) => {
    await game(page, g => { g.isPaused = false; });
    await page.locator('#mobile-btn-call-wave').tap();
    expect(await game(page, g => g.currentWave)).toBe(1);
    await page.locator('#mobile-power-stasis').tap();
    expect(await game(page, g => g.cooldowns.stasis)).toBeGreaterThan(50);
  });
});
