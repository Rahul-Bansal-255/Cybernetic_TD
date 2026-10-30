import { test, expect, startGame, game, clickCell, findBuildableCell, firstRoadCell } from './helpers.js';

test.describe('Tower construction', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await page.keyboard.press('Space'); // pause so waves don't interfere
  });

  test('build deck lists all 7 towers with hotkeys', async ({ page }) => {
    const cards = page.locator('#towers-deck .tower-card');
    await expect(cards).toHaveCount(7);
    await expect(cards.nth(6)).toContainText('Ion Disruptor');
    await expect(cards.nth(6)).toContainText('[7]');
  });

  test('placing a tower from the deck deducts its cost', async ({ page }) => {
    const cell = await findBuildableCell(page);
    await page.locator('#card-tower-gatling').click();
    await expect(page.locator('#placement-banner')).toBeVisible();
    await clickCell(page, cell.col, cell.row);

    const state = await game(page, g => ({ credits: g.credits, towers: g.towers.map(t => [t.type, t.col, t.row]) }));
    expect(state.towers).toEqual([['gatling', cell.col, cell.row]]);
    expect(state.credits).toBe(350 - 85);
    await expect(page.locator('#hud-credits')).toHaveText('265');
    await expect(page.locator('#placement-banner')).toBeHidden();
  });

  test('road tiles reject placement and keep placement mode active', async ({ page }) => {
    const road = await firstRoadCell(page);
    await page.keyboard.press('1');
    await clickCell(page, road.col, road.row);
    expect(await game(page, g => g.towers.length)).toBe(0);
    expect(await game(page, g => g.placementMode)).toBe(true);
  });

  test('shift-click places multiple towers', async ({ page }) => {
    await game(page, g => { g.credits = 1000; });
    const a = await findBuildableCell(page, 0);
    const b = await findBuildableCell(page, 1);
    await page.keyboard.press('1');
    await clickCell(page, a.col, a.row, { modifiers: ['Shift'] });
    await clickCell(page, b.col, b.row, { modifiers: ['Shift'] });
    expect(await game(page, g => g.towers.length)).toBe(2);
    expect(await game(page, g => g.placementMode)).toBe(true);
  });

  test('hotkeys select towers; escape and right-click cancel', async ({ page }) => {
    await game(page, g => { g.credits = 1000; });
    const expected = ['gatling', 'artillery', 'cryo', 'tesla', 'railgun', 'beacon', 'ion'];
    for (let i = 0; i < expected.length; i++) {
      await page.keyboard.press(String(i + 1));
      expect(await game(page, g => g.selectedPlacementProto?.id)).toBe(expected[i]);
    }
    await page.keyboard.press('Escape');
    expect(await game(page, g => g.placementMode)).toBe(false);

    await page.keyboard.press('3');
    const cell = await findBuildableCell(page);
    await clickCell(page, cell.col, cell.row, { button: 'right' });
    expect(await game(page, g => g.placementMode)).toBe(false);
    expect(await game(page, g => g.towers.length)).toBe(0);
  });

  test('unaffordable towers cannot be selected', async ({ page }) => {
    await game(page, g => { g.credits = 100; });
    await page.waitForTimeout(150);
    await expect(page.locator('#card-tower-railgun')).toHaveClass(/unaffordable/);
    await page.locator('#card-tower-railgun').click();
    expect(await game(page, g => g.placementMode)).toBe(false);
  });
});

test.describe('Tower inspector', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await page.keyboard.press('Space');
    await game(page, g => { g.credits = 2000; });
  });

  test('selecting, upgrading and retargeting a tower', async ({ page }) => {
    const cell = await findBuildableCell(page);
    await page.keyboard.press('4');
    await clickCell(page, cell.col, cell.row);
    await page.keyboard.press('Escape');
    await clickCell(page, cell.col, cell.row);

    await expect(page.locator('#inspector-tower-name')).toHaveText('TESLA PYLON');
    await expect(page.locator('#inspector-tower-tier')).toContainText('TIER 1');
    await expect(page.locator('#upgrade-cost-tag')).toHaveText('140 ⚡');

    await page.locator('#btn-tower-upgrade').click();
    await expect(page.locator('#inspector-tower-tier')).toContainText('Arc Matrix');
    await page.keyboard.press('u');
    await expect(page.locator('#inspector-tower-tier')).toContainText('Storm Overlord');
    await expect(page.locator('#upgrade-cost-tag')).toHaveText('MAX TIER');
    await expect(page.locator('#btn-tower-upgrade')).toBeDisabled();

    const t = await game(page, g => ({ chain: g.towers[0].chainCount, stun: g.towers[0].stunChance }));
    expect(t).toEqual({ chain: 7, stun: 0.4 });

    await page.locator('#tower-target-select').selectOption('strongest');
    expect(await game(page, g => g.towers[0].targetPriority)).toBe('strongest');
  });

  test('upgrading one tower leaves others of the same type untouched', async ({ page }) => {
    await game(page, g => { g.placeTower(2, 2, 'artillery'); g.placeTower(2, 6, 'artillery'); g.towers[0].upgrade(g); });
    const radii = await game(page, g => g.towers.map(t => t.splashRadius));
    expect(radii).toEqual([90, 70]);
  });

  test('unfired towers refund in full, combat-tested towers refund 70%', async ({ page }) => {
    const cell = await findBuildableCell(page);
    await game(page, (g, c) => g.placeTower(c.col, c.row, 'cryo'), cell);
    await expect(page.locator('#sell-refund-tag')).toHaveText('+125 ⚡ (FULL)');

    const before = await game(page, g => g.credits);
    await page.keyboard.press('s');
    expect(await game(page, g => g.credits)).toBe(before + 125);
    await expect(page.locator('#inspector-empty-msg')).toBeVisible();

    await game(page, (g, c) => { g.placeTower(c.col, c.row, 'cryo'); g.towers[0].hasFired = true; }, cell);
    await expect(page.locator('#sell-refund-tag')).toHaveText('+88 ⚡');
  });
});
