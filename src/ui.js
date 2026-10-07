// HUD and Interactive UI Manager

import { TOWER_TYPES, ENEMY_TYPES, SUPERWEAPONS, CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE } from './constants.js';
import { MAPS } from './maps.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.activeBoss = null;
    this.cacheDOMElements();
    this.renderTowersDeck();
    this.renderSectorsModal();
    this.renderCodex();
    this.setupEventListeners();
  }

  cacheDOMElements() {
    this.elCredits = document.getElementById('hud-credits');
    this.elLives = document.getElementById('hud-lives');
    this.elHpFill = document.getElementById('hud-hp-fill');
    this.elWave = document.getElementById('hud-wave');
    this.elScore = document.getElementById('hud-score');
    this.elSectorName = document.getElementById('current-sector-name');

    this.towersDeck = document.getElementById('towers-deck');
    this.placementBanner = document.getElementById('placement-banner');

    // Inspector
    this.inspCard = document.getElementById('tower-inspector-card');
    this.inspName = document.getElementById('inspector-tower-name');
    this.inspTier = document.getElementById('inspector-tower-tier');
    this.inspEmpty = document.getElementById('inspector-empty-msg');
    this.inspContent = document.getElementById('inspector-active-content');
    this.inspDamage = document.getElementById('insp-damage');
    this.inspRate = document.getElementById('insp-rate');
    this.inspRange = document.getElementById('insp-range');
    this.inspDps = document.getElementById('insp-dps');
    this.inspKills = document.getElementById('insp-kills');
    this.inspTotalDmg = document.getElementById('insp-total-dmg');
    this.inspTargetSelect = document.getElementById('tower-target-select');
    this.btnUpgrade = document.getElementById('btn-tower-upgrade');
    this.upgradeCostTag = document.getElementById('upgrade-cost-tag');
    this.btnSell = document.getElementById('btn-tower-sell');
    this.sellRefundTag = document.getElementById('sell-refund-tag');

    // Superweapons
    this.cdOrbital = document.getElementById('cd-orbital');
    this.cdStasis = document.getElementById('cd-stasis');
    this.cdOverdrive = document.getElementById('cd-overdrive');
    this.btnOrbital = document.getElementById('power-orbital');
    this.btnStasis = document.getElementById('power-stasis');
    this.btnOverdrive = document.getElementById('power-overdrive');

    // Wave Radar
    this.waveBadge = document.getElementById('wave-status-badge');
    this.waveIntelText = document.getElementById('wave-preview-intel');
    this.waveChips = document.getElementById('wave-enemy-chips');
    this.btnCallWave = document.getElementById('btn-call-wave');
    this.waveBonusTag = document.getElementById('wave-bonus-tag');

    // Boss Bar
    this.bossBar = document.getElementById('boss-health-bar');
    this.bossTitle = document.getElementById('boss-title');
    this.bossHpNums = document.getElementById('boss-hp-numbers');
    this.bossHpFill = document.getElementById('boss-hp-fill');

    // Modals
    this.modalStart = document.getElementById('modal-start');
    this.modalMapSelect = document.getElementById('modal-map-select');
    this.modalCodex = document.getElementById('modal-codex');
    this.modalVictory = document.getElementById('modal-victory');
    this.modalGameOver = document.getElementById('modal-gameover');
  }

  renderTowersDeck() {
    this.towersDeck.innerHTML = '';
    const towerKeys = Object.keys(TOWER_TYPES);

    towerKeys.forEach((key, idx) => {
      const t = TOWER_TYPES[key];
      const card = document.createElement('div');
      card.className = 'tower-card';
      card.id = `card-tower-${key}`;
      card.dataset.type = key;

      card.innerHTML = `
        <div class="tower-icon-canvas">${t.icon}</div>
        <div class="tower-card-info">
          <div class="tower-name-row">
            <span class="tower-name">${t.name}</span>
            <span class="tower-hotkey">[${idx + 1}]</span>
          </div>
          <div class="tower-cost-row">
            <span class="tower-cost">${t.cost} ⚡</span>
          </div>
          <span class="tower-tagline">${t.tagline}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectPlacementTower(key);
      });

      this.towersDeck.appendChild(card);
    });
  }

  selectPlacementTower(key) {
    if (this.game.placementMode && this.game.selectedPlacementProto?.id === key) {
      // Toggle off
      this.cancelPlacement();
      return;
    }

    const proto = TOWER_TYPES[key];
    if (!proto || this.game.credits < proto.cost) {
      this.game.audio.error();
      return;
    }

    this.game.placementMode = true;
    this.game.selectedPlacementProto = proto;
    this.game.selectedTower = null;
    this.game.activeAbilityMode = null;

    this.placementBanner.style.display = 'block';
    this.syncTowersDeckHighlight();
    this.syncInspector();

    const activeCard = document.getElementById(`card-tower-${key}`);
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  cancelPlacement() {
    this.game.placementMode = false;
    this.game.selectedPlacementProto = null;
    this.placementBanner.style.display = 'none';
    this.syncTowersDeckHighlight();
  }


  syncTowersDeckHighlight() {
    const cards = this.towersDeck.querySelectorAll('.tower-card');
    cards.forEach(card => {
      const type = card.dataset.type;
      const proto = TOWER_TYPES[type];
      const isSelected = this.game.placementMode && this.game.selectedPlacementProto?.id === type;
      card.classList.toggle('selected', isSelected);

      const affordable = this.game.credits >= proto.cost;
      card.classList.toggle('affordable', affordable);
      card.classList.toggle('unaffordable', !affordable);
    });
  }

  updateHUD() {
    this.elCredits.textContent = this.game.credits;
    this.elLives.textContent = `${this.game.lives} / ${this.game.maxLives}`;
    const hpPct = Math.max(0, (this.game.lives / this.game.maxLives) * 100);
    this.elHpFill.style.width = `${hpPct}%`;

    this.elWave.textContent = `${this.game.currentWave} / ${this.game.maxWaves}`;
    this.elScore.textContent = this.game.score.toLocaleString();
    this.elSectorName.textContent = this.game.currentMap.name.toUpperCase();

    this.syncTowersDeckHighlight();
    this.updateSuperweapons();
    this.updateWaveRadar();
    this.syncInspector();
    this.updateBossBar();
  }

  updateSuperweapons() {
    const cdOrbitalRatio = this.game.cooldowns.orbital / SUPERWEAPONS.orbital.cooldown;
    const cdStasisRatio = this.game.cooldowns.stasis / SUPERWEAPONS.stasis.cooldown;
    const cdOverdriveRatio = this.game.cooldowns.overdrive / SUPERWEAPONS.overdrive.cooldown;

    this.cdOrbital.style.transform = `scaleY(${cdOrbitalRatio})`;
    this.cdStasis.style.transform = `scaleY(${cdStasisRatio})`;
    this.cdOverdrive.style.transform = `scaleY(${cdOverdriveRatio})`;

    this.btnOrbital.disabled = this.game.cooldowns.orbital > 0;
    this.btnStasis.disabled = this.game.cooldowns.stasis > 0;
    this.btnOverdrive.disabled = this.game.cooldowns.overdrive > 0;
  }

  updateWaveRadar() {
    const nextWaveNum = this.game.currentWave + 1;
    if (this.game.waveState === 'standby') {
      this.waveBadge.textContent = `NEXT: ${Math.ceil(this.game.waveDelayTimer)}s`;
      this.btnCallWave.disabled = this.game.currentWave >= this.game.maxWaves;
      const bonus = Math.round(20 + this.game.waveDelayTimer * 2);
      this.waveBonusTag.textContent = `+${bonus} ⚡ BONUS`;
    } else {
      this.waveBadge.textContent = 'HOSTILES ACTIVE';
      this.btnCallWave.disabled = true;
      this.waveBonusTag.textContent = 'COMBAT IN PROGRESS';
    }

    if (nextWaveNum % 5 === 0 && nextWaveNum <= this.game.maxWaves) {
      this.waveIntelText.textContent = `CRITICAL THREAT: Wave ${nextWaveNum} features a Titan Class Dreadnought!`;
    } else if (nextWaveNum <= this.game.maxWaves) {
      this.waveIntelText.textContent = `Wave ${nextWaveNum} incursions approaching Sector perimeter.`;
    } else {
      this.waveIntelText.textContent = 'All sectors neutralized. Perimeter secure!';
    }
  }

  syncInspector() {
    const t = this.game.selectedTower;
    if (!t) {
      this.inspEmpty.style.display = 'block';
      this.inspContent.style.display = 'none';
      this.inspName.textContent = 'TOWER INSPECTOR';
      this.inspTier.textContent = 'STANDBY';
      return;
    }

    this.inspEmpty.style.display = 'none';
    this.inspContent.style.display = 'block';

    this.inspName.textContent = t.proto.name.toUpperCase();
    this.inspTier.textContent = `TIER ${t.tier}: ${t.tierName}`;

    this.inspDamage.textContent = t.effectiveDamage;
    this.inspRate.textContent = `${t.effectiveFireRate.toFixed(1)}/s`;
    this.inspRange.textContent = Math.round(t.effectiveRange);
    this.inspDps.textContent = t.dps;
    this.inspKills.textContent = t.kills;
    this.inspTotalDmg.textContent = t.totalDamage.toLocaleString();
    this.inspTargetSelect.value = t.targetPriority;

    const nextUp = t.getNextUpgrade();
    if (nextUp) {
      this.btnUpgrade.disabled = this.game.credits < nextUp.cost;
      this.upgradeCostTag.textContent = `${nextUp.cost} ⚡`;
      this.btnUpgrade.title = nextUp.desc;
    } else {
      this.btnUpgrade.disabled = true;
      this.upgradeCostTag.textContent = 'MAX TIER';
      this.btnUpgrade.title = 'Tower reached maximum combat tier!';
    }

    this.sellRefundTag.textContent = `+${t.getRefund()} ⚡`;
  }

  updateBossBar() {
    // Find active titan boss if present
    const titan = this.game.enemies.find(e => e.isBoss && !e.isDead);
    if (titan) {
      this.bossBar.style.display = 'block';
      this.bossTitle.textContent = titan.name.toUpperCase();
      this.bossHpNums.textContent = `${Math.max(0, Math.round(titan.hp)).toLocaleString()} / ${titan.maxHp.toLocaleString()}`;
      const pct = Math.max(0, (titan.hp / titan.maxHp) * 100);
      this.bossHpFill.style.width = `${pct}%`;
    } else {
      this.bossBar.style.display = 'none';
    }
  }

  drawMiniMap(canvas, map) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const scaleX = w / CANVAS_WIDTH;
    const scaleY = h / CANVAS_HEIGHT;

    // Background fill
    ctx.fillStyle = map.theme.bg;
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = map.theme.gridLine;
    ctx.lineWidth = 0.5;
    const stepX = (CELL_SIZE * scaleX) * 2;
    const stepY = (CELL_SIZE * scaleY) * 2;
    ctx.beginPath();
    for (let x = 0; x < w; x += stepX) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += stepY) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Road paths
    map.paths.forEach(p => {
      if (p.length < 2) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Base track
      ctx.strokeStyle = map.theme.roadFill;
      ctx.lineWidth = CELL_SIZE * scaleX * 0.95;
      ctx.beginPath();
      ctx.moveTo(p[0].x * scaleX, p[0].y * scaleY);
      for (let i = 1; i < p.length; i++) {
        ctx.lineTo(p[i].x * scaleX, p[i].y * scaleY);
      }
      ctx.stroke();

      // Neon center border
      ctx.strokeStyle = map.theme.roadBorder;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = map.theme.roadBorder;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    });

    // Obstacles
    if (map.obstacles) {
      ctx.fillStyle = map.theme.obstacleColor;
      ctx.strokeStyle = map.theme.roadBorder;
      ctx.lineWidth = 0.8;
      map.obstacles.forEach(obs => {
        const ox = obs.col * CELL_SIZE * scaleX;
        const oy = obs.row * CELL_SIZE * scaleY;
        const ow = CELL_SIZE * scaleX;
        const oh = CELL_SIZE * scaleY;
        ctx.fillRect(ox + 1, oy + 1, ow - 2, oh - 2);
        ctx.strokeRect(ox + 1, oy + 1, ow - 2, oh - 2);
      });
    }

    // Spawners
    map.paths.forEach(p => {
      const start = p[0];
      const sx = Math.min(w - 7, Math.max(7, start.x * scaleX));
      const sy = Math.min(h - 7, Math.max(7, start.y * scaleY));
      ctx.save();
      ctx.fillStyle = map.theme.spawnerColor;
      ctx.shadowColor = map.theme.spawnerColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Core Generators
    map.paths.forEach(p => {
      const end = p[p.length - 1];
      const ex = Math.min(w - 7, Math.max(7, end.x * scaleX));
      const ey = Math.min(h - 7, Math.max(7, end.y * scaleY));
      ctx.save();
      ctx.fillStyle = map.theme.coreColor;
      ctx.shadowColor = map.theme.coreColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderSectorsModal() {
    const container = document.getElementById('sectors-grid');
    if (!container) return;
    container.innerHTML = '';

    const diffColors = {
      STANDARD: '#06d6a0',
      ADVANCED: '#ffd166',
      TACTICAL: '#00f2fe',
      EXPERT: '#ff6b35',
      ELITE: '#9d4edd',
      MASTER: '#ff007f',
      NIGHTMARE: '#ef476f'
    };

    Object.values(MAPS).forEach(map => {
      const isActive = this.game.currentMap.id === map.id;
      const card = document.createElement('div');
      card.className = `sector-card ${isActive ? 'active' : ''}`;
      card.id = `sec-card-${map.id}`;

      // Thumbnail with mini canvas
      const thumbBox = document.createElement('div');
      thumbBox.className = 'sector-thumb-box';
      thumbBox.style.borderColor = map.theme.roadBorder;

      const miniCanvas = document.createElement('canvas');
      miniCanvas.className = 'sector-mini-canvas';
      miniCanvas.width = 240;
      miniCanvas.height = 110;
      this.drawMiniMap(miniCanvas, map);
      thumbBox.appendChild(miniCanvas);

      const diffColor = diffColors[map.difficulty] || '#ffd166';

      // Card Meta Body
      const body = document.createElement('div');
      body.className = 'sector-card-body';
      body.innerHTML = `
        <div class="sector-card-top">
          <div class="sector-name">${map.name}</div>
          <span class="sector-diff-badge" style="color: ${diffColor}; border-color: ${diffColor};">
            ${map.difficulty}
          </span>
        </div>
        <div class="sector-meta-chips">
          <span class="sector-chip">LANES: ${map.paths.length}</span>
          <span class="sector-chip">OBSTACLES: ${map.obstacles.length}</span>
        </div>
        <div class="sector-tagline">${map.tagline}</div>
        <p class="sector-desc">${map.description}</p>
        <div class="sector-card-footer">
          <button class="btn-select-sector ${isActive ? 'btn-active-sector' : ''}">
            ${isActive ? 'CURRENT SECTOR' : 'DEPLOY PROTOCOL'}
          </button>
        </div>
      `;

      card.appendChild(thumbBox);
      card.appendChild(body);

      card.addEventListener('click', () => {
        this.game.selectSector(map.id);
        this.modalMapSelect.classList.remove('active');
        this.updateHUD();
        this.renderSectorsModal();
      });

      container.appendChild(card);
    });
  }

  renderCodex() {
    const container = document.getElementById('codex-content');
    if (!container) return;

    this.renderCodexTab('towers');
  }

  renderCodexTab(tab) {
    const container = document.getElementById('codex-content');
    if (!container) return;

    if (tab === 'towers') {
      container.innerHTML = `
        <div class="codex-section-grid">
          ${Object.values(TOWER_TYPES).map(t => `
            <div class="codex-entry">
              <span class="codex-icon">${t.icon}</span>
              <div class="codex-info">
                <span class="codex-title">${t.name} (${t.cost} ⚡)</span>
                <p class="codex-desc">${t.description}</p>
                <p class="codex-desc" style="color: #ffd166; margin-top: 4px;">Upgrades: ${t.upgrades.map(u => u.tierName).join(' ➔ ')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (tab === 'enemies') {
      container.innerHTML = `
        <div class="codex-section-grid">
          ${Object.values(ENEMY_TYPES).map(e => `
            <div class="codex-entry">
              <span class="codex-icon">${e.icon}</span>
              <div class="codex-info">
                <span class="codex-title">${e.name}</span>
                <p class="codex-desc">Base HP: ${e.hp} | Armor: ${e.armor} | Speed: ${e.speed}x</p>
                <p class="codex-desc" style="color: #a0f0ff;">${e.isBoss ? 'Colossal Boss unit with enraged phase below 50% HP!' : (e.shield ? 'Absorbs initial damage with kinetic forcefield.' : 'Standard combat threat.')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (tab === 'strategy') {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.85rem; line-height: 1.6; color: #cbd5e1;">
          <div style="background: rgba(18, 27, 48, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid #00f2fe;">
            <strong style="color: #00f2fe;">1. Choke Points & Splash Synergies:</strong> Place Cryo Emitters near sharp bends to cluster enemies, then bombard them with Plasma Mortars for devastating AoE splash damage!
          </div>
          <div style="background: rgba(18, 27, 48, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid #00ff87;">
            <strong style="color: #00ff87;">2. Support Beacon Placement:</strong> Aegis Relays boost attack speed and generate 25-75 bonus credits per wave. Surround them with high-tier Railguns or Pulse Blasters!
          </div>
          <div style="background: rgba(18, 27, 48, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid #ff007f;">
            <strong style="color: #ff007f;">3. Commander Superweapons:</strong> Don't hesitate to deploy Orbital Strike [Q] or Cryo Stasis [W] when Titans or swarms break your frontline.
          </div>
          <div style="background: rgba(18, 27, 48, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid #ffd166;">
            <strong style="color: #ffd166;">4. Early Wave Call Bonus:</strong> Confident in your defenses? Call upcoming waves early to earn extra credits and snowball your economy!
          </div>
        </div>
      `;
    }
  }

  setupEventListeners() {
    // Start game button
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.modalStart.classList.remove('active');
      this.game.audio.init();
      this.game.audio.towerPlace();
      this.game.audio.startBgm();
    });

    // Speed controls
    const speedBtns = document.querySelectorAll('.speed-btn[data-speed]');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        this.game.speed = speed;
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Pause button
    const btnPause = document.getElementById('btn-pause');
    btnPause.addEventListener('click', () => {
      this.game.isPaused = !this.game.isPaused;
      btnPause.classList.toggle('paused', this.game.isPaused);
      btnPause.textContent = this.game.isPaused ? '▶' : '⏸';
    });

    // Sound and BGM toggles
    const btnSound = document.getElementById('btn-sound-toggle');
    btnSound.addEventListener('click', () => {
      const active = this.game.audio.toggleSound();
      btnSound.classList.toggle('muted', !active);
    });

    const btnBgm = document.getElementById('btn-bgm-toggle');
    btnBgm.addEventListener('click', () => {
      const active = this.game.audio.toggleBgm();
      btnBgm.classList.toggle('muted', !active);
    });

    // Modals
    const openMapsHandler = () => {
      this.modalMapSelect.classList.add('active');
      this.renderSectorsModal();
    };
    document.getElementById('btn-open-maps').addEventListener('click', openMapsHandler);
    if (this.elSectorName) {
      this.elSectorName.style.cursor = 'pointer';
      this.elSectorName.title = 'Click to switch Sector / Map';
      this.elSectorName.addEventListener('click', openMapsHandler);
    }

    document.getElementById('btn-close-maps').addEventListener('click', () => {
      this.modalMapSelect.classList.remove('active');
    });

    this.modalMapSelect.addEventListener('click', (e) => {
      if (e.target === this.modalMapSelect) {
        this.modalMapSelect.classList.remove('active');
      }
    });

    document.getElementById('btn-open-codex').addEventListener('click', () => {
      this.modalCodex.classList.add('active');
    });
    document.getElementById('btn-close-codex').addEventListener('click', () => {
      this.modalCodex.classList.remove('active');
    });
    this.modalCodex.addEventListener('click', (e) => {
      if (e.target === this.modalCodex) {
        this.modalCodex.classList.remove('active');
      }
    });

    // Codex Tab switching
    const tabBtns = document.querySelectorAll('.codex-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderCodexTab(btn.dataset.tab);
      });
    });

    // Call wave early
    this.btnCallWave.addEventListener('click', () => {
      this.game.callWaveEarly();
    });

    // Superweapons
    this.btnOrbital.addEventListener('click', () => this.game.triggerSuperweapon('orbital'));
    this.btnStasis.addEventListener('click', () => this.game.triggerSuperweapon('stasis'));
    this.btnOverdrive.addEventListener('click', () => this.game.triggerSuperweapon('overdrive'));

    // Inspector Actions
    this.btnUpgrade.addEventListener('click', () => {
      if (this.game.selectedTower) {
        this.game.selectedTower.upgrade(this.game);
        this.syncInspector();
      }
    });

    this.btnSell.addEventListener('click', () => {
      if (this.game.selectedTower) {
        this.game.sellTower(this.game.selectedTower);
      }
    });

    this.inspTargetSelect.addEventListener('change', (e) => {
      if (this.game.selectedTower) {
        this.game.selectedTower.targetPriority = e.target.value;
      }
    });

    // Horizontal wheel scrolling over build deck
    if (this.towersDeck) {
      this.towersDeck.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          this.towersDeck.scrollBy({
            left: e.deltaY,
            behavior: 'auto'
          });
        }
      }, { passive: false });
    }

    // Victory & Game Over handlers
    document.getElementById('btn-victory-restart').addEventListener('click', () => {
      this.modalVictory.classList.remove('active');
      this.game.resetSector();
    });

    document.getElementById('btn-victory-next-sector').addEventListener('click', () => {
      this.modalVictory.classList.remove('active');
      const mapKeys = Object.keys(MAPS);
      const curIdx = mapKeys.indexOf(this.game.currentMap.id);
      const nextKey = mapKeys[(curIdx + 1) % mapKeys.length];
      this.game.selectSector(nextKey);
      this.updateHUD();
      this.renderSectorsModal();
    });

    document.getElementById('btn-gameover-restart').addEventListener('click', () => {
      this.modalGameOver.classList.remove('active');
      this.game.resetSector();
    });

    document.getElementById('btn-gameover-change-sector').addEventListener('click', () => {
      this.modalGameOver.classList.remove('active');
      openMapsHandler();
    });

    // Global Key Bindings
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      const key = e.key.toUpperCase();
      if (key === 'ESCAPE') {
        if (this.modalMapSelect.classList.contains('active')) {
          this.modalMapSelect.classList.remove('active');
          return;
        }
        if (this.modalCodex.classList.contains('active')) {
          this.modalCodex.classList.remove('active');
          return;
        }
        this.cancelPlacement();
        this.game.activeAbilityMode = null;
        this.game.selectedTower = null;
        this.syncInspector();
        return;
      }

      if (key >= '1' && key <= '6') {
        const towerKeys = Object.keys(TOWER_TYPES);
        const idx = parseInt(key) - 1;
        if (towerKeys[idx]) {
          this.selectPlacementTower(towerKeys[idx]);
        }
      } else if (key === ' ') {
        e.preventDefault();
        btnPause.click();
      } else if (key === 'Q') {
        this.game.triggerSuperweapon('orbital');
      } else if (key === 'W') {
        this.game.triggerSuperweapon('stasis');
      } else if (key === 'E') {
        this.game.triggerSuperweapon('overdrive');
      } else if (key === 'U') {
        this.btnUpgrade.click();
      } else if (key === 'S') {
        this.btnSell.click();
      }
    });
  }
}
