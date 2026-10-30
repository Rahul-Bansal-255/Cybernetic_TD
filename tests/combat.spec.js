import { test, expect, startGame, game, clickCell, bestCellNearPath, cellPoint } from './helpers.js';

test.describe('Waves', () => {
  test('wave radar previews the exact upcoming composition', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await expect(page.locator('#wave-preview-intel')).toContainText('Wave 1');
    await expect(page.locator('#wave-enemy-chips .enemy-chip')).toHaveCount(1);
    await expect(page.locator('#wave-enemy-chips')).toContainText('x6');

    const composition = await game(page, g => g.getWaveComposition(7));
    expect(Object.keys(composition).length).toBeGreaterThan(0);
  });

  test('calling a wave early pays the advertised bonus', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await page.keyboard.press('Space');
    const label = await page.locator('#wave-bonus-tag').textContent();
    const advertised = Number(label.match(/\+(\d+)/)[1]);
    const before = await game(page, g => g.credits);
    await page.keyboard.press('Space');
    await page.locator('#btn-call-wave').click();
    const after = await game(page, g => ({ credits: g.credits, wave: g.currentWave, state: g.waveState }));
    expect(after.wave).toBe(1);
    expect(after.state).not.toBe('standby');
    expect(Math.abs(after.credits - before - advertised)).toBeLessThanOrEqual(1);
  });

  test('a defended sector clears early waves without losing lives', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    for (const type of ['gatling', 'gatling', 'gatling']) {
      const cell = await bestCellNearPath(page, 160);
      await game(page, (g, a) => g.placeTower(a.c.col, a.c.row, a.t), { c: cell, t: type });
    }
    await page.locator('#speed-4x').click();
    await page.locator('#btn-call-wave').click();
    await expect.poll(() => game(page, g => g.currentWave >= 2 && g.waveState === 'standby'), { timeout: 45_000 }).toBe(true);
    const state = await game(page, g => ({ lives: g.lives, kills: g.stats.enemiesKilled }));
    expect(state.lives).toBe(25);
    expect(state.kills).toBeGreaterThanOrEqual(16);
  });

  test('hive carriers split into scouts and titans show the boss bar', async ({ page }) => {
    await startGame(page, 'sector_delta', 'veteran');
    await game(page, g => { g.currentWave = 10; g.spawnEnemy('carrier', 0); g.enemies[0].takeDamage(1e9, 'energy', g); });
    await expect.poll(() => game(page, g => g.enemies.filter(e => e.type === 'scout').length)).toBe(4);

    await game(page, g => { g.enemies = []; g.spawnEnemy('titan', 0); });
    await expect(page.locator('#boss-health-bar')).toBeVisible();
    await game(page, g => { const t = g.enemies[0]; t.shield = 0; t.takeDamage(t.maxHp * 0.6, 'energy', g); });
    await expect.poll(() => game(page, g => g.enemies.filter(e => e.type === 'scout').length)).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Soak', () => {
  test('ten waves on a three-lane sector stay error-free and leak-free in memory', async ({ page }) => {
    test.setTimeout(120_000);
    await startGame(page, 'sector_zeta', 'veteran');
    await game(page, g => { g.credits = 20000; });
    const types = ['gatling', 'artillery', 'cryo', 'tesla', 'railgun', 'ion', 'beacon'];
    for (let i = 0; i < 14; i++) {
      const cell = await bestCellNearPath(page, 150);
      await game(page, (g, a) => { g.placeTower(a.c.col, a.c.row, a.t); g.towers[g.towers.length - 1].upgrade(g); }, { c: cell, t: types[i % types.length] });
    }
    await page.locator('#speed-4x').click();

    let peak = { enemies: 0, projectiles: 0, burnZones: 0, particles: 0 };
    for (let i = 0; i < 200; i++) {
      const s = await game(page, g => {
        if (g.waveState === 'standby') g.callWaveEarly();
        return {
          wave: g.currentWave, over: g.isGameOver, enemies: g.enemies.length, projectiles: g.projectiles.length,
          burnZones: g.burnZones.length, particles: g.particles.particles.length + g.particles.texts.length
        };
      });
      for (const k of Object.keys(peak)) peak[k] = Math.max(peak[k], s[k]);
      if (s.wave >= 10 || s.over) break;
      await page.waitForTimeout(400);
    }
    const final = await game(page, g => ({ wave: g.currentWave, over: g.isGameOver }));
    expect(final.over).toBe(false);
    expect(final.wave).toBeGreaterThanOrEqual(10);
    expect(peak.projectiles).toBeLessThan(400);
    expect(peak.burnZones).toBeLessThan(60);
    expect(peak.particles).toBeLessThanOrEqual(100);

    const fps = await page.evaluate(() => new Promise(resolve => {
      let frames = 0;
      const start = performance.now();
      const tick = () => { frames++; if (performance.now() - start < 1000) requestAnimationFrame(tick); else resolve(frames); };
      requestAnimationFrame(tick);
    }));
    expect(fps).toBeGreaterThan(20);
  });
});

test.describe('Superweapons', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
  });

  test('orbital targeting can be toggled, cancelled and cast', async ({ page }) => {
    await page.keyboard.press('q');
    expect(await game(page, g => g.activeAbilityMode)).toBe('orbital');
    await page.keyboard.press('q');
    expect(await game(page, g => g.activeAbilityMode)).toBe(null);

    await page.keyboard.press('2');
    await page.keyboard.press('q');
    const modes = await game(page, g => ({ ability: g.activeAbilityMode, placing: g.placementMode }));
    expect(modes).toEqual({ ability: 'orbital', placing: false });
    await expect(page.locator('#placement-banner')).toBeHidden();

    await game(page, g => { g.spawnEnemy('raider', 0); g.enemies[0].x = 400; g.enemies[0].y = 300; });
    const p = await cellPoint(page, 400 / 48 - 0.5, 300 / 48 - 0.5);
    await page.mouse.click(p.x, p.y);
    await expect.poll(() => game(page, g => g.stats.enemiesKilled)).toBe(1);
    await expect(page.locator('#power-orbital')).toBeDisabled();
  });

  test('cryo stasis freezes hostiles and overdrive buffs towers', async ({ page }) => {
    await game(page, g => { g.credits = 1000; g.placeTower(2, 2, 'gatling'); g.spawnEnemy('raider', 0); });
    await page.keyboard.press('w');
    expect(await game(page, g => g.enemies[0].freezeTimer)).toBeGreaterThan(3);
    await page.keyboard.press('e');
    await expect.poll(() => game(page, g => g.towers[0].buffSpeed)).toBe(1);
    await expect(page.locator('#power-stasis')).toBeDisabled();
    await expect(page.locator('#power-overdrive')).toBeDisabled();
  });
});

test.describe('Mission outcomes', () => {
  test('core breach shows the game over screen and retry resets', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await game(page, g => { g.lives = 1; g.speed = 4; g.spawnEnemy('speeder', 0); });
    await expect(page.locator('#modal-gameover')).toHaveClass(/active/, { timeout: 30_000 });
    await expect(page.locator('#gameover-stats')).toContainText('CADET');

    // Backing out of "Change Sector" returns to the defeat screen instead of a dead battlefield
    await page.locator('#btn-gameover-change-sector').click();
    await expect(page.locator('#modal-map-select')).toHaveClass(/active/);
    await page.locator('#btn-close-maps').click();
    await expect(page.locator('#modal-gameover')).toHaveClass(/active/);

    await page.locator('#btn-gameover-restart').click();
    await expect(page.locator('#modal-gameover')).not.toHaveClass(/active/);
    expect(await game(page, g => ({ lives: g.lives, over: g.isGameOver }))).toEqual({ lives: 25, over: false });
  });

  test('clearing the final wave triggers victory and unlocks the next sector', async ({ page }) => {
    await startGame(page, 'sector_alpha', 'cadet');
    await game(page, g => { g.currentWave = g.maxWaves; g.waveState = 'active'; g.spawnQueue = []; g.enemies = []; });
    await expect(page.locator('#modal-victory')).toHaveClass(/active/);
    await expect(page.locator('#victory-stats')).toContainText('FINAL SCORE');

    await page.locator('#btn-victory-next-sector').click();
    await expect(page.locator('#modal-victory')).not.toHaveClass(/active/);
    const state = await game(page, g => ({ map: g.currentMap.id, wave: g.currentWave, victory: g.isVictory }));
    expect(state).toEqual({ map: 'sector_delta', wave: 0, victory: false });
  });
});
