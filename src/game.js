// Main Game State and Simulation Engine

import { CELL_SIZE, GRID_COLS, GRID_ROWS, TOWER_TYPES, SUPERWEAPONS, DIFFICULTY_MODES, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { MAPS } from './maps.js';
import { Tower, Enemy } from './entities.js';
import { ParticleSystem } from './particles.js';
import { audio } from './audio.js';
import confetti from 'canvas-confetti';

export class GameEngine {
  constructor() {
    this.audio = audio;
    this.particles = new ParticleSystem();

    // Map & Difficulty
    this.currentMap = MAPS.sector_alpha;
    this.difficulty = DIFFICULTY_MODES.cadet;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.burnZones = [];

    // Player Resources
    this.maxLives = this.difficulty.lives;
    this.lives = this.maxLives;
    this.credits = this.difficulty.startingCredits;
    this.score = 0;

    // Wave Progression
    this.currentWave = 0;
    this.maxWaves = 25;
    this.waveState = 'standby'; // 'standby', 'spawning', 'active'
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveDelayTimer = 10; // auto-start countdown
    this.autoStartWaves = true;

    // Simulation Speed & Flow
    this.speed = 1;
    this.isPaused = false;
    this.hasStarted = false;
    this.isGameOver = false;
    this.isVictory = false;

    // Interaction State
    this.selectedTower = null;
    this.placementMode = false;
    this.selectedPlacementProto = null;
    this.hoverTile = null;
    this.activeAbilityMode = null;
    this.mousePos = { x: 0, y: 0 };

    // Superweapon Cooldown Timers
    this.cooldowns = {
      orbital: 0,
      stasis: 0,
      overdrive: 0
    };
    this.overdriveTimer = 0;

    // Overall Battle Statistics
    this.stats = {
      enemiesKilled: 0,
      totalDamageDealt: 0,
      creditsEarned: this.difficulty.startingCredits,
      towersBuilt: 0,
      bossesDefeated: 0
    };

    // UI Callback hooks
    this.onStateChange = null;
    this.onWaveChange = null;
    this.onSelectTower = null;
    this.onBossSpawned = null;
    this.onBossKilled = null;
  }

  init(mapId = 'sector_alpha', diffId = 'cadet') {
    if (diffId && DIFFICULTY_MODES[diffId]) {
      this.difficulty = DIFFICULTY_MODES[diffId];
    }
    this.selectSector(mapId);
  }

  setDifficulty(diffId) {
    if (!DIFFICULTY_MODES[diffId]) return;
    this.difficulty = DIFFICULTY_MODES[diffId];
    this.resetSector();
  }

  startWithSector(mapId, diffId = null) {
    if (diffId && DIFFICULTY_MODES[diffId]) {
      this.difficulty = DIFFICULTY_MODES[diffId];
    }
    this.hasStarted = true;
    this.isPaused = false;
    if (MAPS[mapId]) {
      this.currentMap = MAPS[mapId];
    }
    this.resetSector();
  }

  selectSector(mapId) {
    if (!MAPS[mapId]) return;
    this.currentMap = MAPS[mapId];
    this.resetSector();
  }

  resetSector() {
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.burnZones = [];
    this.particles.clear();

    this.maxLives = this.difficulty.lives;
    this.lives = this.maxLives;
    this.credits = this.difficulty.startingCredits;
    this.score = 0;
    this.currentWave = 0;
    this.waveState = 'standby';
    this.spawnQueue = [];
    this.waveDelayTimer = 10;

    this.isGameOver = false;
    this.isVictory = false;
    this.selectedTower = null;
    this.placementMode = false;
    this.selectedPlacementProto = null;
    this.activeAbilityMode = null;

    this.cooldowns.orbital = 0;
    this.cooldowns.stasis = 0;
    this.cooldowns.overdrive = 0;
    this.overdriveTimer = 0;

    this.stats = {
      enemiesKilled: 0,
      totalDamageDealt: 0,
      creditsEarned: this.difficulty.startingCredits,
      towersBuilt: 0,
      bossesDefeated: 0
    };

    if (this.onStateChange) this.onStateChange();
    if (this.onWaveChange) this.onWaveChange();
  }

  update(dt) {
    if (!this.hasStarted || this.isPaused || this.isGameOver || this.isVictory) return;

    // Apply speed multiplier
    const effectiveDt = dt * this.speed;

    // Particle update
    this.particles.update(effectiveDt);

    // Update Superweapon Cooldowns
    for (let k in this.cooldowns) {
      if (this.cooldowns[k] > 0) {
        this.cooldowns[k] = Math.max(0, this.cooldowns[k] - effectiveDt);
      }
    }

    // Overdrive active duration
    if (this.overdriveTimer > 0) {
      this.overdriveTimer = Math.max(0, this.overdriveTimer - effectiveDt);
    }

    // Reset temporary buffs on towers before recalculation
    this.towers.forEach(t => {
      t.buffSpeed = this.overdriveTimer > 0 ? 1.0 : 0;
      t.buffRange = 0;
      t.buffDamage = 0;
    });

    // Update Towers
    for (let t of this.towers) {
      t.update(effectiveDt, this);
    }

    // Update Projectiles
    this.projectiles = this.projectiles.filter(p => {
      const alive = p.update(effectiveDt, this);
      return !p.isDead && (alive !== false);
    });

    // Update Burn Zones
    this.burnZones = this.burnZones.filter(bz => bz.update(effectiveDt, this));

    // Update Enemies
    this.enemies = this.enemies.filter(e => {
      e.update(effectiveDt, this);
      if (e.reachedEnd) {
        this.onEnemyReachEnd(e);
        return false;
      }
      return !e.isDead;
    });

    // Update Wave Spawner logic
    this.updateWaveLogic(effectiveDt);

    // Notify UI on a throttled timer (~10Hz) to prevent DOM thrashing
    this.uiTimer = (this.uiTimer || 0) + effectiveDt;
    if (this.uiTimer >= 0.1) {
      this.uiTimer = 0;
      if (this.onStateChange) this.onStateChange();
    }
  }

  updateWaveLogic(dt) {
    if (this.waveState === 'standby') {
      if (this.autoStartWaves && this.currentWave < this.maxWaves) {
        this.waveDelayTimer -= dt;
        if (this.waveDelayTimer <= 0) {
          this.startNextWave();
        }
      }
    } else if (this.waveState === 'spawning') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
        const nextSpawn = this.spawnQueue.shift();
        this.spawnEnemy(nextSpawn.type, nextSpawn.pathIndex);
        this.spawnTimer = nextSpawn.delay;
      }

      if (this.spawnQueue.length === 0) {
        this.waveState = 'active';
      }
    } else if (this.waveState === 'active') {
      if (this.enemies.length === 0 && this.spawnQueue.length === 0) {
        this.onWaveCompleted();
      }
    }
  }

  startNextWave() {
    if (this.currentWave >= this.maxWaves) return;

    this.currentWave++;
    this.waveState = 'spawning';
    this.spawnTimer = 0.5;
    this.spawnQueue = this.generateWaveQueue(this.currentWave);

    // Audio cue
    const isBossWave = this.currentWave % 5 === 0;
    if (isBossWave) {
      this.audio.bossAlarm();
    } else {
      this.audio.waveAlert();
    }

    if (this.onWaveChange) this.onWaveChange();
  }

  callWaveEarly() {
    if (this.waveState === 'standby' && this.currentWave < this.maxWaves) {
      const bonus = Math.round(10 + this.waveDelayTimer * 1);
      this.credits += bonus;
      this.stats.creditsEarned += bonus;
      this.particles.addText(CANVAS_WIDTH / 2, 80, `EARLY CALL BONUS: +${bonus} ⚡`, '#ffd166', 16, true);
      this.audio.sell();
      this.startNextWave();
    }
  }

  onWaveCompleted() {
    this.waveState = 'standby';
    this.waveDelayTimer = 8; // countdown to next wave

    // Rebalanced wave completion reward
    const waveReward = Math.round(35 + this.currentWave * 5);
    this.credits += waveReward;
    this.stats.creditsEarned += waveReward;
    const waveScore = Math.round(200 * this.currentWave * (this.difficulty?.scoreMult ?? 1));
    this.score += waveScore;

    // Beacon tower bonus credits
    this.towers.forEach(t => {
      if (t.proto.isSupport && t.proto.bonusCreditsWave) {
        this.credits += t.proto.bonusCreditsWave;
        this.stats.creditsEarned += t.proto.bonusCreditsWave;
        this.particles.addText(t.x, t.y - 20, `+${t.proto.bonusCreditsWave} ⚡ (RELAY)`, '#00ff87', 12);
      }
    });

    this.particles.addText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, `WAVE ${this.currentWave} SECURED!`, '#00f2fe', 22, true);
    this.audio.victory();

    // Check Sector Victory (all 25 waves cleared!)
    if (this.currentWave >= this.maxWaves) {
      this.triggerVictory();
    }

    if (this.onWaveChange) this.onWaveChange();
  }

  generateWaveQueue(wave) {
    const queue = [];
    const paths = this.currentMap.paths;
    const isBossWave = wave % 5 === 0;

    if (isBossWave) {
      // Boss wave composition
      const countRaiders = 2 + Math.floor(wave / 4);
      for (let i = 0; i < countRaiders; i++) {
        queue.push({ type: 'raider', pathIndex: i % paths.length, delay: 1.0 });
      }

      // Colossal Titan Boss
      queue.push({ type: 'titan', pathIndex: 0, delay: 2.0 });

      for (let i = 0; i < 4; i++) {
        queue.push({ type: 'speeder', pathIndex: i % paths.length, delay: 1.0 });
      }
    } else {
      // Regular wave composition
      if (wave === 1) {
        for (let i = 0; i < 5; i++) queue.push({ type: 'scout', pathIndex: 0, delay: 1.4 });
      } else if (wave === 2) {
        for (let i = 0; i < 7; i++) queue.push({ type: 'scout', pathIndex: i % paths.length, delay: 1.2 });
        for (let i = 0; i < 2; i++) queue.push({ type: 'raider', pathIndex: i % paths.length, delay: 1.5 });
      } else if (wave === 3) {
        for (let i = 0; i < 6; i++) queue.push({ type: 'raider', pathIndex: i % paths.length, delay: 1.2 });
        for (let i = 0; i < 1; i++) queue.push({ type: 'juggernaut', pathIndex: 0, delay: 2.0 });
      } else if (wave === 4) {
        for (let i = 0; i < 8; i++) queue.push({ type: 'speeder', pathIndex: i % paths.length, delay: 1.0 });
      } else {
        // High wave dynamic composition
        const totalUnits = 8 + wave;
        for (let i = 0; i < totalUnits; i++) {
          let type = 'scout';
          const r = Math.random();
          if (r < 0.20) type = 'shielded';
          else if (r < 0.40) type = 'juggernaut';
          else if (r < 0.65) type = 'raider';
          else if (r < 0.85) type = 'speeder';

          queue.push({
            type,
            pathIndex: i % paths.length,
            delay: 0.8 + Math.random() * 0.4
          });
        }
      }
    }

    return queue;
  }

  spawnEnemy(typeKey, pathIndex = 0) {
    const paths = this.currentMap.paths;
    const path = paths[pathIndex % paths.length];
    const waveScale = this.difficulty?.waveScale ?? 0.28;
    const waveMult = 1 + (this.currentWave - 1) * waveScale;
    const enemy = new Enemy(typeKey, path, waveMult, this.difficulty);
    this.enemies.push(enemy);

    if (enemy.isBoss && this.onBossSpawned) {
      this.onBossSpawned(enemy);
    }
  }

  onEnemyKilled(enemy) {
    this.credits += enemy.bounty;
    this.score += enemy.score;
    this.stats.enemiesKilled++;
    this.stats.creditsEarned += enemy.bounty;

    if (enemy.isBoss) {
      this.stats.bossesDefeated++;
      this.particles.createExplosion(enemy.x, enemy.y, '#ef476f', 45, 6, 8);
      this.particles.addText(enemy.x, enemy.y - 20, `BOSS SLAIN! +${enemy.bounty} ⚡`, '#ffd166', 18, true);
      this.audio.explosion(true);
      if (this.onBossKilled) this.onBossKilled(enemy);
    } else {
      this.particles.createExplosion(enemy.x, enemy.y, enemy.color, 16, 3.5, 3.5);
      this.particles.addText(enemy.x, enemy.y - 12, `+${enemy.bounty} ⚡`, '#00f2fe', 12);
      this.audio.explosion(false);
    }
  }

  onEnemyReachEnd(enemy) {
    const penalty = enemy.isBoss ? 5 : 1;
    this.lives = Math.max(0, this.lives - penalty);
    this.particles.addShockwave(enemy.x, enemy.y, 80, '#ef476f', 4, 0.4);
    this.particles.addText(enemy.x - 40, enemy.y, `-${penalty} INTEGRITY!`, '#ef476f', 16, true);
    this.audio.error();

    // Trigger visual screen shake
    if (typeof document !== 'undefined') {
      const vp = document.getElementById('canvas-viewport');
      if (vp) {
        vp.classList.add('screen-shake');
        setTimeout(() => vp.classList.remove('screen-shake'), 300);
      }
    }

    if (this.lives <= 0 && !this.isGameOver) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.audio.defeat();

    if (typeof document !== 'undefined') {
      const statsEl = document.getElementById('gameover-stats');
      if (statsEl) {
        statsEl.innerHTML = `
          <div class="stat-cell"><span class="sc-label">THREAT LEVEL</span><span class="sc-val" style="color: ${this.difficulty.badgeColor}">${this.difficulty.name}</span></div>
          <div class="stat-cell"><span class="sc-label">WAVE REACHED</span><span class="sc-val">${this.currentWave} / ${this.maxWaves}</span></div>
          <div class="stat-cell"><span class="sc-label">TOTAL SCORE</span><span class="sc-val">${this.score.toLocaleString()}</span></div>
          <div class="stat-cell"><span class="sc-label">ENEMIES SLAIN</span><span class="sc-val">${this.stats.enemiesKilled}</span></div>
          <div class="stat-cell"><span class="sc-label">TOWERS BUILT</span><span class="sc-val">${this.stats.towersBuilt}</span></div>
        `;
      }

      const modal = document.getElementById('modal-gameover');
      if (modal) modal.classList.add('active');
    }
  }

  triggerVictory() {
    this.isVictory = true;
    this.audio.victory();

    if (typeof document !== 'undefined') {
      const statsEl = document.getElementById('victory-stats');
      if (statsEl) {
        statsEl.innerHTML = `
          <div class="stat-cell"><span class="sc-label">THREAT LEVEL</span><span class="sc-val" style="color: ${this.difficulty.badgeColor}">${this.difficulty.name}</span></div>
          <div class="stat-cell"><span class="sc-label">FINAL SCORE</span><span class="sc-val">${this.score.toLocaleString()}</span></div>
          <div class="stat-cell"><span class="sc-label">CORE INTEGRITY</span><span class="sc-val">${this.lives} / ${this.maxLives}</span></div>
          <div class="stat-cell"><span class="sc-label">ENEMIES SLAIN</span><span class="sc-val">${this.stats.enemiesKilled}</span></div>
          <div class="stat-cell"><span class="sc-label">BOSSES DEFEATED</span><span class="sc-val">${this.stats.bossesDefeated}</span></div>
        `;
      }

      // Confetti fanfare
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      const modal = document.getElementById('modal-victory');
      if (modal) modal.classList.add('active');
    }
  }

  // --- TOWER PLACEMENT & MODIFICATIONS ---

  isValidPlacement(col, row) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
    const cellKey = `${col},${row}`;
    if (this.currentMap.blockedCells.has(cellKey)) return false;
    return !this.towers.some(t => t.col === col && t.row === row);
  }

  placeTower(col, row, typeKey) {
    if (!this.hasStarted) return false;
    const proto = TOWER_TYPES[typeKey];
    if (!proto || this.credits < proto.cost || !this.isValidPlacement(col, row)) {
      this.audio.error();
      return false;
    }

    this.credits -= proto.cost;
    const tower = new Tower(col, row, typeKey);
    this.towers.push(tower);
    this.stats.towersBuilt++;

    this.audio.towerPlace();
    this.particles.addShockwave(tower.x, tower.y, 50, proto.color, 3, 0.3);
    this.particles.addText(tower.x, tower.y - 20, `DEPLOYED: ${proto.name}`, '#00f2fe', 13);

    this.selectedTower = tower;
    if (this.onSelectTower) this.onSelectTower(tower);
    return true;
  }

  sellTower(tower) {
    const idx = this.towers.indexOf(tower);
    if (idx === -1) return;

    const refund = tower.getRefund();
    this.credits += refund;
    this.towers.splice(idx, 1);

    this.audio.sell();
    this.particles.addShockwave(tower.x, tower.y, 60, '#ffd166', 3, 0.35);
    this.particles.addText(tower.x, tower.y - 20, `RECYCLED: +${refund} ⚡`, '#ffd166', 14, true);

    this.selectedTower = null;
    if (this.onSelectTower) this.onSelectTower(null);
  }

  // --- COMMANDER SUPERWEAPONS ---

  triggerSuperweapon(id) {
    if (!this.hasStarted) return;
    const weapon = SUPERWEAPONS[id];
    if (!weapon || this.cooldowns[id] > 0) {
      this.audio.error();
      return;
    }

    if (id === 'orbital') {
      // Enter targeting mode
      this.activeAbilityMode = 'orbital';
      this.particles.addText(CANVAS_WIDTH / 2, 60, 'SELECT TARGET AREA FOR ORBITAL BEAM', '#ff007f', 15);
    } else if (id === 'stasis') {
      this.cooldowns.stasis = weapon.cooldown;
      this.audio.freezeCast();
      this.enemies.forEach(e => e.applyFreeze(weapon.duration));
      this.particles.addShockwave(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 450, '#00e5ff', 6, 0.6);
      this.particles.addText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'CRYO STASIS ACTIVATED!', '#00e5ff', 24, true);
    } else if (id === 'overdrive') {
      this.cooldowns.overdrive = weapon.cooldown;
      this.overdriveTimer = weapon.duration;
      this.audio.overdriveCast();
      this.particles.addShockwave(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 450, '#00ff87', 6, 0.6);
      this.particles.addText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'OVERDRIVE MATRIX CHARGED!', '#00ff87', 24, true);
    }
  }

  castOrbitalStrike(targetX, targetY) {
    const weapon = SUPERWEAPONS.orbital;
    this.cooldowns.orbital = weapon.cooldown;
    this.activeAbilityMode = null;

    this.audio.orbitalStrike();
    this.particles.addShockwave(targetX, targetY, weapon.radius, '#ff007f', 5, 0.6);

    setTimeout(() => {
      this.enemies.forEach(e => {
        if (e.isDead || e.reachedEnd) return;
        const dist = Math.hypot(e.x - targetX, e.y - targetY);
        if (dist <= weapon.radius) {
          e.takeDamage(weapon.damage, 'energy', this);
        }
      });
      this.particles.createExplosion(targetX, targetY, '#ff007f', 35, 6, 7);
    }, 450);
  }
}
