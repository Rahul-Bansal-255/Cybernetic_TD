import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Start Screen
  console.log('Capturing 01_start_screen.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_start_screen.png') });

  // Open Sector Selection
  console.log('Opening Sector Selection...');
  await page.click('#btn-start-game');
  await new Promise(r => setTimeout(r, 800));

  // 2. Sector Selection Modal
  console.log('Capturing 02_sector_selection.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_sector_selection.png') });

  // Deploy to Sector Alpha
  console.log('Deploying to Sector Alpha...');
  await page.click('#sec-card-sector_alpha');
  await new Promise(r => setTimeout(r, 800));

  // Set up battlefield with precision path adherence
  console.log('Deploying tactical defense network...');
  await page.evaluate(() => {
    const g = window.__GAME__;
    const ui = window.__UI__;
    if (!g) return;

    // Generous credits for setup
    g.credits = 3000;

    // Sector Alpha vertical lane is at x = 264 (col 5.5).
    // Flank the lane with turrets on col 4 (x=216) and col 6 (x=312).
    g.placeTower(4, 5, 'gatling');   // Twin Pulsar
    g.placeTower(4, 7, 'tesla');     // Tesla Pylon
    g.placeTower(4, 9, 'railgun');   // Void Railgun

    g.placeTower(6, 5, 'cryo');      // Cryo Emitter
    g.placeTower(6, 7, 'artillery'); // Plasma Mortar
    g.placeTower(6, 9, 'beacon');    // Aegis Relay

    // Upgrade gatling to Tier 2 (Twin Pulsar)
    const gatling = g.towers.find(t => t.type === 'gatling');
    if (gatling) {
      gatling.upgrade(g);
      gatling.kills = 15;
      gatling.totalDamage = 1940;
    }

    g.currentWave = 2; // In wave 3
    g.startNextWave();

    // Clear automatic spawn queue to manually position active hostiles precisely on the road
    g.spawnQueue = [];
    g.enemies = [];

    // Path Waypoints:
    // WP 0: (-24, 168) -> WP 1: (264, 168) [Horizontal segment at y = 168]
    // WP 1: (264, 168) -> WP 2: (264, 552) [Vertical segment at x = 264]

    // 1. Scout Drone on horizontal entry track (strictly on y = 168)
    g.spawnEnemy('scout', 0);
    const scout = g.enemies[0];
    scout.pathIndex = 0;
    scout.x = 150;
    scout.y = 168; // EXACT horizontal road line
    scout.angle = 0;
    scout.distanceTraveled = 150 + 24;

    // 2. Cyber Raider turning corner onto vertical track (strictly on x = 264)
    g.spawnEnemy('raider', 0);
    const raider = g.enemies[1];
    raider.pathIndex = 1;
    raider.x = 264; // EXACT vertical road line
    raider.y = 240;
    raider.angle = Math.PI / 2;
    raider.distanceTraveled = 288 + (240 - 168);

    // 3. Phase Speeder mid-lane absorbing cryo beam (strictly on x = 264)
    g.spawnEnemy('speeder', 0);
    const speeder = g.enemies[2];
    speeder.pathIndex = 1;
    speeder.x = 264; // EXACT vertical road line
    speeder.y = 330;
    speeder.angle = Math.PI / 2;
    speeder.distanceTraveled = 288 + (330 - 168);
    speeder.slowTimer = 2.0;
    speeder.slowFactor = 0.4;

    // 4. Iron Juggernaut (purple armored tank) strictly on the path line (x = 264)
    g.spawnEnemy('juggernaut', 0);
    const juggernaut = g.enemies[3];
    juggernaut.pathIndex = 1;
    juggernaut.x = 264; // EXACT vertical road line
    juggernaut.y = 425;
    juggernaut.angle = Math.PI / 2;
    juggernaut.distanceTraveled = 288 + (425 - 168);
    // Give sturdy HP and armor so it remains on the battlefield under heavy fire
    juggernaut.maxHp = 1200;
    juggernaut.hp = 950;
    juggernaut.armor = 20;

    // Deselect tower for clean combat shot
    g.selectedTower = null;
    ui.updateHUD();

    // Advance 8 animation steps so turrets engage and fire lasers/beams into the road
    for (let i = 0; i < 8; i++) {
      g.update(0.016);
      // Strictly maintain path line adherence
      if (g.enemies[0]) { g.enemies[0].y = 168; }
      if (g.enemies[1]) { g.enemies[1].x = 264; }
      if (g.enemies[2]) { g.enemies[2].x = 264; }
      if (g.enemies[3]) { g.enemies[3].x = 264; }
    }
  });

  await new Promise(r => setTimeout(r, 400));

  // 3. Gameplay Combat Action
  console.log('Capturing 03_gameplay_combat.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_gameplay_combat.png') });

  // Select the upgraded Twin Pulsar to showcase range ring and inspector deck
  console.log('Inspecting Twin Pulsar...');
  await page.evaluate(() => {
    const g = window.__GAME__;
    const ui = window.__UI__;
    if (g) {
      const gatling = g.towers.find(t => t.type === 'gatling');
      g.selectedTower = gatling;
      ui.syncInspector();
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // 4. Tower Inspector & Tactical Deck
  console.log('Capturing 04_tower_inspector.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_tower_inspector.png') });

  // Deselect and open Codex
  console.log('Opening Tactical Codex...');
  await page.evaluate(() => {
    const g = window.__GAME__;
    if (g) g.selectedTower = null;
  });
  await page.click('#btn-open-codex');
  await new Promise(r => setTimeout(r, 700));

  // 5. Tactical Codex - Towers
  console.log('Capturing 05_tactical_codex.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_tactical_codex.png') });

  // Switch Codex tab to hostile drone database
  console.log('Switching to Hostiles Codex tab...');
  await page.evaluate(() => {
    const tabBtn = document.querySelector('.codex-tab-btn[data-tab="enemies"]');
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  // 6. Tactical Codex - Enemies
  console.log('Capturing 06_codex_hostiles.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_codex_hostiles.png') });

  await browser.close();
  console.log('All screenshots captured with 100% path accuracy!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
