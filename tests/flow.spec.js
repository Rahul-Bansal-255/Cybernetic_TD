import { test, expect, openSectorSelect, startGame, game } from './helpers.js';

const SECTOR_ORDER = ['sector_alpha', 'sector_delta', 'sector_gamma', 'sector_beta', 'sector_epsilon', 'sector_omega', 'sector_zeta'];

test.describe('Start flow & sector selection', () => {
  test('start screen leads to sector selection in progression order', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#modal-start')).toHaveClass(/active/);
    await expect(page.locator('.start-features')).toContainText('7 Upgradeable Turrets');

    await openSectorSelect(page);
    const ids = await page.locator('#sectors-grid .sector-card').evaluateAll(els => els.map(e => e.id.replace('sec-card-', '')));
    expect(ids).toEqual(SECTOR_ORDER);
    await expect(page.locator('#diff-buttons-strip .diff-mode-btn')).toHaveCount(4);
  });

  test('closing sector selection before deploying returns to the start screen', async ({ page }) => {
    await openSectorSelect(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal-map-select')).not.toHaveClass(/active/);
    await expect(page.locator('#modal-start')).toHaveClass(/active/);
  });

  test('difficulty choice drives lives, credits and the HUD badge', async ({ page }) => {
    await startGame(page, 'sector_beta', 'elite');
    const state = await game(page, g => ({ lives: g.lives, credits: g.credits, lanes: g.currentMap.paths.length }));
    expect(state.lives).toBe(15);
    // 220 base + 80 for the second lane
    expect(state.credits).toBe(220 + (state.lanes - 1) * 80);
    await expect(page.locator('#current-diff-tag')).toHaveText('ELITE');
    await expect(page.locator('#hud-lives')).toHaveText('15 / 15');
    await expect(page.locator('#current-sector-name')).toContainText('NEXUS MATRIX');
  });

  test('sector cards show lane-adjusted starting supply', async ({ page }) => {
    await openSectorSelect(page);
    await page.locator('#diff-btn-veteran').click();
    await expect(page.locator('#sec-card-sector_alpha')).toContainText('260 ⚡');
    await expect(page.locator('#sec-card-sector_zeta')).toContainText('420 ⚡');
  });

  test('switching sector mid-game resets the battlefield', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await game(page, g => { g.credits = 5000; g.placeTower(2, 2, 'gatling'); });
    await page.locator('#btn-open-maps').click();
    await page.locator('#sec-card-sector_gamma').click();
    const state = await game(page, g => ({ map: g.currentMap.id, towers: g.towers.length, wave: g.currentWave }));
    expect(state).toEqual({ map: 'sector_gamma', towers: 0, wave: 0 });
  });
});

test.describe('Menus during a mission', () => {
  test('opening the codex or sector menu pauses and closing resumes', async ({ page }) => {
    await startGame(page);
    await page.locator('#btn-open-codex').click();
    expect(await game(page, g => g.isPaused)).toBe(true);
    await page.locator('#btn-close-codex').click();
    expect(await game(page, g => g.isPaused)).toBe(false);

    await page.locator('#btn-open-maps').click();
    expect(await game(page, g => g.isPaused)).toBe(true);
    await expect(page.locator('#map-select-subtitle')).toContainText('Mission paused');
    await page.keyboard.press('Escape');
    expect(await game(page, g => g.isPaused)).toBe(false);
  });

  test('a manual pause survives opening and closing menus', async ({ page }) => {
    await startGame(page);
    await page.keyboard.press('Space');
    await page.locator('#btn-open-codex').click();
    await page.keyboard.press('Escape');
    expect(await game(page, g => g.isPaused)).toBe(true);
    await expect(page.locator('#btn-pause')).toHaveText('▶');
  });

  test('browsing threat levels mid-mission does not wipe progress', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await game(page, g => { g.credits = 5000; g.placeTower(2, 2, 'gatling'); g.currentWave = 3; });
    await page.locator('#btn-open-maps').click();
    await page.locator('#diff-btn-apocalypse').click();
    await expect(page.locator('#sec-card-sector_alpha .btn-select-sector')).toContainText('DEPLOY [APOCALYPSE]');
    expect(await game(page, g => ({ diff: g.difficulty.id, towers: g.towers.length, wave: g.currentWave })))
      .toEqual({ diff: 'cadet', towers: 1, wave: 3 });

    await page.locator('#diff-btn-cadet').click();
    await expect(page.locator('#sec-card-sector_alpha .btn-select-sector')).toContainText('RESUME MISSION');
    await page.locator('#sec-card-sector_alpha').click();
    await expect(page.locator('#modal-map-select')).not.toHaveClass(/active/);
    expect(await game(page, g => ({ towers: g.towers.length, wave: g.currentWave, paused: g.isPaused })))
      .toEqual({ towers: 1, wave: 3, paused: false });
  });

  test('gameplay hotkeys are ignored while a menu is open', async ({ page }) => {
    await startGame(page);
    await page.locator('#btn-open-codex').click();
    await page.keyboard.press('1');
    await page.keyboard.press('q');
    expect(await game(page, g => ({ placing: g.placementMode, ability: g.activeAbilityMode })))
      .toEqual({ placing: false, ability: null });
  });
});

test.describe('HUD controls', () => {
  test('space works after clicking the pause button (no double toggle)', async ({ page }) => {
    await startGame(page);
    await page.locator('#btn-pause').click();
    expect(await game(page, g => g.isPaused)).toBe(true);
    await page.keyboard.press('Space');
    expect(await game(page, g => g.isPaused)).toBe(false);
  });

  test('browser shortcuts with modifiers do not trigger game actions', async ({ page }) => {
    await startGame(page);
    await game(page, g => { g.isPaused = true; g.credits = 500; g.placeTower(2, 2, 'gatling'); });
    await page.keyboard.press('Control+s');
    await page.keyboard.press('Meta+s');
    expect(await game(page, g => g.towers.length)).toBe(1);
  });

  test('space toggles pause and freezes the wave countdown', async ({ page }) => {
    await startGame(page);
    await page.keyboard.press('Space');
    await expect(page.locator('#btn-pause')).toHaveText('▶');
    const t1 = await game(page, g => g.waveDelayTimer);
    await page.waitForTimeout(600);
    expect(await game(page, g => g.waveDelayTimer)).toBe(t1);

    await page.keyboard.press('Space');
    await expect(page.locator('#btn-pause')).toHaveText('⏸');
    await expect.poll(() => game(page, g => g.waveDelayTimer)).toBeLessThan(t1);
  });

  test('speed buttons change the simulation speed', async ({ page }) => {
    await startGame(page);
    await page.locator('#speed-4x').click();
    await expect(page.locator('#speed-4x')).toHaveClass(/active/);
    expect(await game(page, g => g.speed)).toBe(4);
  });

  test('superweapon cards show the configured cooldowns', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#power-orbital .power-cost')).toHaveText('[Q] 55s CD');
    await expect(page.locator('#power-stasis .power-cost')).toHaveText('[W] 55s CD');
    await expect(page.locator('#power-overdrive .power-cost')).toHaveText('[E] 48s CD');
  });
});

test.describe('Tactical codex', () => {
  test('every tab renders its full roster', async ({ page }) => {
    await startGame(page);
    await page.locator('#btn-open-codex').click();
    await expect(page.locator('#modal-codex')).toHaveClass(/active/);

    await expect(page.locator('#codex-content .codex-entry')).toHaveCount(7);
    await expect(page.locator('#codex-content')).toContainText('Ion Disruptor');

    await page.locator('.codex-tab-btn[data-tab="enemies"]').click();
    await expect(page.locator('#codex-content .codex-entry')).toHaveCount(7);
    await expect(page.locator('#codex-content')).toContainText('Hive Carrier');

    await page.locator('.codex-tab-btn[data-tab="difficulty"]').click();
    await expect(page.locator('#codex-content .codex-diff-card')).toHaveCount(4);

    await page.locator('.codex-tab-btn[data-tab="strategy"]').click();
    await expect(page.locator('#codex-content')).toContainText('Free Redeploy');

    await page.keyboard.press('Escape');
    await expect(page.locator('#modal-codex')).not.toHaveClass(/active/);
  });
});
