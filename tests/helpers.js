import { test as base, expect } from '@playwright/test';

const CELL = 48;
const CANVAS_W = 1200;
const CANVAS_H = 720;

// Fails any test that logs a console error or throws an uncaught page error
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
    });
    await use(page);
    expect(errors, 'browser errors').toEqual([]);
  }
});

export { expect };

export async function openSectorSelect(page) {
  await page.goto('/');
  await page.locator('#btn-start-game').click();
  await expect(page.locator('#modal-map-select')).toHaveClass(/active/);
}

export async function startGame(page, sectorId = 'sector_alpha', difficulty = 'cadet') {
  await openSectorSelect(page);
  await page.locator(`#diff-btn-${difficulty}`).click();
  await page.locator(`#sec-card-${sectorId}`).click();
  await expect(page.locator('#modal-map-select')).not.toHaveClass(/active/);
  await expect.poll(() => game(page, g => g.hasStarted)).toBe(true);
}

// Run a function against the live GameEngine instance
export function game(page, fn, arg) {
  return page.evaluate(([src, a]) => {
    // eslint-disable-next-line no-new-func
    const f = new Function('g', 'a', `return (${src})(g, a);`);
    return f(window.__GAME__, a);
  }, [fn.toString(), arg]);
}

// Page coordinates for the centre of a grid cell on the scaled canvas
export async function cellPoint(page, col, row) {
  const box = await page.locator('#game-canvas').boundingBox();
  return {
    x: box.x + ((col + 0.5) * CELL) * (box.width / CANVAS_W),
    y: box.y + ((row + 0.5) * CELL) * (box.height / CANVAS_H)
  };
}

// page.mouse.click ignores `modifiers`, so hold them on the keyboard explicitly
export async function clickCell(page, col, row, { modifiers = [], ...options } = {}) {
  const p = await cellPoint(page, col, row);
  for (const key of modifiers) await page.keyboard.down(key);
  await page.mouse.click(p.x, p.y, options);
  for (const key of modifiers) await page.keyboard.up(key);
}

// First buildable cell (row-major) on the current sector
export function findBuildableCell(page, skip = 0) {
  return game(page, (g, n) => {
    let found = 0;
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 25; c++) {
        if (g.isValidPlacement(c, r) && found++ === n) return { col: c, row: r };
      }
    }
    return null;
  }, skip);
}

// Buildable cell with the most path coverage for a given range
export function bestCellNearPath(page, range = 160) {
  return game(page, (g, r) => {
    let best = null;
    let bestScore = -1;
    const samples = [];
    g.currentMap.paths.forEach(p => {
      for (let i = 0; i < p.length - 1; i++) {
        const steps = Math.ceil(Math.hypot(p[i + 1].x - p[i].x, p[i + 1].y - p[i].y) / 12);
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          samples.push([p[i].x + (p[i + 1].x - p[i].x) * t, p[i].y + (p[i + 1].y - p[i].y) * t]);
        }
      }
    });
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 25; col++) {
        if (!g.isValidPlacement(col, row)) continue;
        const x = (col + 0.5) * 48;
        const y = (row + 0.5) * 48;
        const score = samples.filter(([sx, sy]) => (sx - x) ** 2 + (sy - y) ** 2 <= r * r).length;
        if (score > bestScore) { bestScore = score; best = { col, row }; }
      }
    }
    return best;
  }, range);
}

export function firstRoadCell(page) {
  return game(page, g => {
    const [key] = [...g.currentMap.roadCells].filter(k => {
      const [c, r] = k.split(',').map(Number);
      return c > 0 && c < 24 && r > 0 && r < 14;
    });
    const [col, row] = key.split(',').map(Number);
    return { col, row };
  });
}
