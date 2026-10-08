// HUD and Interactive UI Manager

import { TOWER_TYPES, ENEMY_TYPES, SUPERWEAPONS, DIFFICULTY_MODES, CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE } from './constants.js';
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
    this.elDiffTag = document.getElementById('current-diff-tag');
    this.diffButtonsStrip = document.getElementById('diff-buttons-strip');
    this.diffIntelCard = document.getElementById('diff-intel-card');

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

    // Mobile & Tablet Drawer / Floating Controls
    this.sidebar = document.getElementById('tactical-sidebar');
    this.sidebarBackdrop = document.getElementById('sidebar-backdrop');
    this.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    this.btnCloseSidebar = document.getElementById('btn-close-sidebar');
    this.btnCloseInspector = document.getElementById('btn-close-inspector');
    this.btnCancelPlacement = document.getElementById('btn-cancel-placement');

    // Mobile Quick Superweapons
    this.mobileBtnOrbital = document.getElementById('mobile-power-orbital');
    this.mobileBtnStasis = document.getElementById('mobile-power-stasis');
    this.mobileBtnOverdrive = document.getElementById('mobile-power-overdrive');
    this.mobileCdOrbital = document.getElementById('mobile-cd-orbital');
    this.mobileCdStasis = document.getElementById('mobile-cd-stasis');
    this.mobileCdOverdrive = document.getElementById('mobile-cd-overdrive');

    // Mobile Wave Call
    this.mobileWaveBadge = document.getElementById('mobile-wave-badge');
    this.mobileBtnCallWave = document.getElementById('mobile-btn-call-wave');
    this.mobileWaveBonusTag = document.getElementById('mobile-wave-bonus-tag');

    // Mobile Floating Tower Sheet
    this.mobileTowerSheet = document.getElementById('mobile-tower-sheet');
    this.mtsIcon = document.getElementById('mts-icon');
    this.mtsName = document.getElementById('mts-name');
    this.mtsTier = document.getElementById('mts-tier');
    this.mtsTargetSelect = document.getElementById('mts-target-select');
    this.btnCloseMts = document.getElementById('btn-close-mts');
    this.mtsDamage = document.getElementById('mts-damage');
    this.mtsRate = document.getElementById('mts-rate');
    this.mtsDps = document.getElementById('mts-dps');
    this.mtsKills = document.getElementById('mts-kills');
    this.mtsBtnUpgrade = document.getElementById('mts-btn-upgrade');
    this.mtsUpgradeCost = document.getElementById('mts-upgrade-cost');
    this.mtsBtnSell = document.getElementById('mts-btn-sell');
    this.mtsSellRefund = document.getElementById('mts-sell-refund');

    // Modals
    this.modalStart = document.getElementById('modal-start');
    this.modalMapSelect = document.getElementById('modal-map-select');
    this.modalCodex = document.getElementById('modal-codex');
    this.modalVictory = document.getElementById('modal-victory');
    this.modalGameOver = document.getElementById('modal-gameover');
  }

  openMobileSidebar() {
    if (this.sidebar) this.sidebar.classList.add('mobile-open');
    if (this.sidebarBackdrop) this.sidebarBackdrop.classList.add('active');
  }

  closeMobileSidebar() {
    if (this.sidebar) this.sidebar.classList.remove('mobile-open');
    if (this.sidebarBackdrop) this.sidebarBackdrop.classList.remove('active');
  }

  toggleMobileSidebar() {
    if (this.sidebar && this.sidebar.classList.contains('mobile-open')) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  }

  openMobileInspector() {
    if (this.mobileTowerSheet && window.innerWidth <= 860) {
      this.mobileTowerSheet.style.display = 'flex';
    }
  }

  closeMobileInspector() {
    if (this.mobileTowerSheet) {
      this.mobileTowerSheet.style.display = 'none';
    }
    if (this.inspCard) {
      this.inspCard.classList.remove('mobile-sheet-open');
    }
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
    if (!this.game.hasStarted) {
      this.modalMapSelect.classList.add('active');
      this.renderSectorsModal();
      return;
    }

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

    this.placementBanner.style.display = 'flex';
    document.body.classList.add('placing-mode');
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
    document.body.classList.remove('placing-mode');
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

    this.elWave.textContent = this.game.hasStarted ? `${this.game.currentWave} / ${this.game.maxWaves}` : `0 / ${this.game.maxWaves}`;
    this.elScore.textContent = this.game.score.toLocaleString();
    this.elSectorName.textContent = this.game.hasStarted ? this.game.currentMap.name.toUpperCase() : 'SELECT SECTOR';

    if (this.elDiffTag) {
      this.elDiffTag.textContent = this.game.difficulty.name;
      this.elDiffTag.style.color = this.game.difficulty.badgeColor;
      this.elDiffTag.style.borderColor = this.game.difficulty.badgeColor;
      this.elDiffTag.style.boxShadow = `0 0 10px ${this.game.difficulty.badgeColor}33`;
    }

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

    if (this.cdOrbital) this.cdOrbital.style.transform = `scaleY(${cdOrbitalRatio})`;
    if (this.cdStasis) this.cdStasis.style.transform = `scaleY(${cdStasisRatio})`;
    if (this.cdOverdrive) this.cdOverdrive.style.transform = `scaleY(${cdOverdriveRatio})`;

    const canOrbital = this.game.hasStarted && this.game.cooldowns.orbital <= 0;
    const canStasis = this.game.hasStarted && this.game.cooldowns.stasis <= 0;
    const canOverdrive = this.game.hasStarted && this.game.cooldowns.overdrive <= 0;

    if (this.btnOrbital) this.btnOrbital.disabled = !canOrbital;
    if (this.btnStasis) this.btnStasis.disabled = !canStasis;
    if (this.btnOverdrive) this.btnOverdrive.disabled = !canOverdrive;

    // Mobile quick superweapon sync
    if (this.mobileCdOrbital) this.mobileCdOrbital.style.transform = `scaleY(${cdOrbitalRatio})`;
    if (this.mobileCdStasis) this.mobileCdStasis.style.transform = `scaleY(${cdStasisRatio})`;
    if (this.mobileCdOverdrive) this.mobileCdOverdrive.style.transform = `scaleY(${cdOverdriveRatio})`;

    if (this.mobileBtnOrbital) this.mobileBtnOrbital.disabled = !canOrbital;
    if (this.mobileBtnStasis) this.mobileBtnStasis.disabled = !canStasis;
    if (this.mobileBtnOverdrive) this.mobileBtnOverdrive.disabled = !canOverdrive;
  }

  updateWaveRadar() {
    if (!this.game.hasStarted) {
      this.waveBadge.textContent = 'STANDBY';
      this.btnCallWave.disabled = true;
      this.waveBonusTag.textContent = 'CHOOSE SECTOR';
      this.waveIntelText.textContent = 'Combat system standby. Select a battle sector to initiate mission.';

      if (this.mobileWaveBadge) this.mobileWaveBadge.textContent = 'STANDBY';
      if (this.mobileBtnCallWave) this.mobileBtnCallWave.disabled = true;
      if (this.mobileWaveBonusTag) this.mobileWaveBonusTag.textContent = 'CHOOSE';
      return;
    }

    const nextWaveNum = this.game.currentWave + 1;
    if (this.game.waveState === 'standby') {
      const timeStr = `NEXT: ${Math.ceil(this.game.waveDelayTimer)}s`;
      this.waveBadge.textContent = timeStr;
      if (this.mobileWaveBadge) this.mobileWaveBadge.textContent = timeStr;

      const canCall = this.game.currentWave < this.game.maxWaves;
      this.btnCallWave.disabled = !canCall;
      if (this.mobileBtnCallWave) this.mobileBtnCallWave.disabled = !canCall;

      const bonus = Math.round(20 + this.game.waveDelayTimer * 2);
      this.waveBonusTag.textContent = `+${bonus} ⚡ BONUS`;
      if (this.mobileWaveBonusTag) this.mobileWaveBonusTag.textContent = `+${bonus} ⚡`;
    } else {
      this.waveBadge.textContent = 'HOSTILES ACTIVE';
      if (this.mobileWaveBadge) this.mobileWaveBadge.textContent = `WAVE ${this.game.currentWave}`;
      this.btnCallWave.disabled = true;
      if (this.mobileBtnCallWave) this.mobileBtnCallWave.disabled = true;
      this.waveBonusTag.textContent = 'COMBAT IN PROGRESS';
      if (this.mobileWaveBonusTag) this.mobileWaveBonusTag.textContent = 'ACTIVE';
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
      this.closeMobileInspector();
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

    if (t.proto.isSupport) {
      this.inspDamage.textContent = 'AURA';
      this.inspRate.textContent = `+${Math.round((t.proto.buffSpeed || 0) * 100)}% SPD`;
      this.inspRange.textContent = Math.round(t.effectiveRange);
      this.inspDps.textContent = `+${t.proto.bonusCreditsWave || 0}⚡/w`;
    } else {
      this.inspDamage.textContent = t.effectiveDamage;
      this.inspRate.textContent = `${t.effectiveFireRate.toFixed(1)}/s`;
      this.inspRange.textContent = Math.round(t.effectiveRange);
      this.inspDps.textContent = t.dps;
    }
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

    // Sync Mobile Tower Sheet
    if (this.mobileTowerSheet && window.innerWidth <= 860) {
      this.mobileTowerSheet.style.display = 'flex';
      if (this.mtsIcon) this.mtsIcon.textContent = t.proto.icon;
      if (this.mtsName) this.mtsName.textContent = t.proto.name.toUpperCase();
      if (this.mtsTier) this.mtsTier.textContent = `T${t.tier}: ${t.tierName}`;
      if (this.mtsTargetSelect) this.mtsTargetSelect.value = t.targetPriority;

      if (t.proto.isSupport) {
        if (this.mtsDamage) this.mtsDamage.textContent = 'AURA';
        if (this.mtsRate) this.mtsRate.textContent = `+${Math.round((t.proto.buffSpeed || 0) * 100)}%`;
        if (this.mtsDps) this.mtsDps.textContent = `+${t.proto.bonusCreditsWave || 0}⚡`;
      } else {
        if (this.mtsDamage) this.mtsDamage.textContent = t.effectiveDamage;
        if (this.mtsRate) this.mtsRate.textContent = `${t.effectiveFireRate.toFixed(1)}/s`;
        if (this.mtsDps) this.mtsDps.textContent = t.dps;
      }
      if (this.mtsKills) this.mtsKills.textContent = t.kills;

      if (this.mtsBtnUpgrade) {
        if (nextUp) {
          this.mtsBtnUpgrade.disabled = this.game.credits < nextUp.cost;
          if (this.mtsUpgradeCost) this.mtsUpgradeCost.textContent = `${nextUp.cost} ⚡`;
        } else {
          this.mtsBtnUpgrade.disabled = true;
          if (this.mtsUpgradeCost) this.mtsUpgradeCost.textContent = 'MAX';
        }
      }
      if (this.mtsSellRefund) this.mtsSellRefund.textContent = `+${t.getRefund()} ⚡`;
    }
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

  renderDifficultySelector() {
    if (!this.diffButtonsStrip || !this.diffIntelCard) return;

    this.diffButtonsStrip.innerHTML = '';
    const modes = Object.values(DIFFICULTY_MODES);

    modes.forEach(mode => {
      const isSelected = this.game.difficulty.id === mode.id;
      const btn = document.createElement('button');
      btn.className = `diff-mode-btn ${isSelected ? 'active' : ''}`;
      btn.id = `diff-btn-${mode.id}`;
      btn.style.setProperty('--diff-color', mode.badgeColor);

      const hpTag = mode.hpMult === 1 ? '1.0x HP' : `+${Math.round((mode.hpMult - 1) * 100)}% HP`;

      btn.innerHTML = `
        <span class="diff-btn-name" style="color: ${mode.badgeColor};">${mode.name}</span>
        <span class="diff-btn-tag">${hpTag}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.setDifficulty(mode.id);
        this.renderDifficultySelector();
        this.updateHUD();
        this.renderSectorsModal();
      });

      this.diffButtonsStrip.appendChild(btn);
    });

    const cur = this.game.difficulty;
    const hpStr = cur.hpMult === 1 ? '1.0x (Baseline)' : `+${Math.round((cur.hpMult - 1) * 100)}%`;
    const speedStr = cur.speedMult === 1 ? '1.0x' : `+${Math.round((cur.speedMult - 1) * 100)}%`;
    const bountyStr = `${Math.round(cur.bountyMult * 100)}%`;
    const scoreStr = `${cur.scoreMult}x`;

    this.diffIntelCard.innerHTML = `
      <div class="diff-intel-header">
        <span class="diff-intel-title" style="color: ${cur.badgeColor}">
          THREAT PROTOCOL: ${cur.name}
        </span>
        <span class="diff-intel-tagline">${cur.tagline}</span>
      </div>
      <div class="diff-stat-chips">
        <div class="diff-chip">
          <span class="dc-icon">🩸</span>
          <span class="dc-label">ENEMY HP</span>
          <span class="dc-val" style="color: ${cur.badgeColor}">${hpStr}</span>
        </div>
        <div class="diff-chip">
          <span class="dc-icon">⚡</span>
          <span class="dc-label">SPEED</span>
          <span class="dc-val">${speedStr}</span>
        </div>
        <div class="diff-chip">
          <span class="dc-icon">💰</span>
          <span class="dc-label">BOUNTIES</span>
          <span class="dc-val">${bountyStr}</span>
        </div>
        <div class="diff-chip">
          <span class="dc-icon">🛡️</span>
          <span class="dc-label">CORE LIVES</span>
          <span class="dc-val">${cur.lives} HP</span>
        </div>
        <div class="diff-chip">
          <span class="dc-icon">🔋</span>
          <span class="dc-label">START CREDITS</span>
          <span class="dc-val">${cur.startingCredits} ⚡</span>
        </div>
        <div class="diff-chip">
          <span class="dc-icon">🏆</span>
          <span class="dc-label">SCORE MULT</span>
          <span class="dc-val" style="color: #ffd166">${scoreStr}</span>
        </div>
      </div>
      <p class="diff-intel-desc">${cur.desc}</p>
    `;
  }

  renderSectorsModal() {
    this.renderDifficultySelector();

    const container = document.getElementById('sectors-grid');
    if (!container) return;
    container.innerHTML = '';

    const subtitleEl = document.getElementById('map-select-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = this.game.hasStarted
        ? `Threat: ${this.game.difficulty.name} (${this.game.difficulty.tagline}). Switch sector or threat level:`
        : `Threat: ${this.game.difficulty.name} (${this.game.difficulty.tagline}). Choose combat sector to deploy:`;
    }

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
      card.className = `sector-card ${isActive && this.game.hasStarted ? 'active' : ''}`;
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
          <span class="sector-chip" title="${map.paths.length} hostile route corridor(s) advancing on your power core simultaneously">🛣️ LANES: ${map.paths.length}</span>
          <span class="sector-chip" title="${map.obstacles.length} natural terrain barricade(s) where turrets cannot be placed">🛑 OBSTACLES: ${map.obstacles.length}</span>
        </div>
        <div class="sector-tagline">${map.tagline}</div>
        <p class="sector-desc">${map.description}</p>
        <div class="sector-card-footer">
          <button class="btn-select-sector ${isActive && this.game.hasStarted ? 'btn-active-sector' : ''}">
            ${!this.game.hasStarted ? `DEPLOY [${this.game.difficulty.name}] ➔` : (isActive ? 'CURRENT SECTOR' : `DEPLOY [${this.game.difficulty.name}]`)}
          </button>
        </div>
      `;

      card.appendChild(thumbBox);
      card.appendChild(body);

      card.addEventListener('click', () => {
        const wasStarted = this.game.hasStarted;
        this.game.startWithSector(map.id, this.game.difficulty.id);
        this.modalMapSelect.classList.remove('active');
        if (!wasStarted) {
          this.game.audio.init();
          this.game.audio.towerPlace();
          this.game.audio.startBgm();
        }
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
          ${Object.values(TOWER_TYPES).map(t => {
            let statsLine = '';
            if (t.isSupport) {
              statsLine = `Support Aura: +${Math.round((t.buffSpeed || 0) * 100)}% Speed | Range: ${t.range} | Income: +${t.bonusCreditsWave || 0} ⚡/wave`;
            } else if (t.isBeam) {
              statsLine = `Beam DPS: ${t.damage} | Range: ${t.range} | Slow: ${Math.round((t.slowFactor || 0.4) * 100)}%`;
            } else {
              const dps = Math.round(t.damage * (t.fireRate || 1));
              statsLine = `Damage: ${t.damage} | Range: ${t.range} | Rate: ${t.fireRate}/s (~${dps} DPS)`;
            }
            return `
            <div class="codex-entry">
              <span class="codex-icon">${t.icon}</span>
              <div class="codex-info">
                <span class="codex-title">${t.name} (${t.cost} ⚡)</span>
                <p class="codex-desc" style="color: #00f2fe; margin-bottom: 3px;">${statsLine}</p>
                <p class="codex-desc">${t.description}</p>
                <p class="codex-desc" style="color: #ffd166; margin-top: 4px;">Upgrades: ${t.upgrades.map(u => u.tierName).join(' ➔ ')}</p>
              </div>
            </div>
          `}).join('')}
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
                <p class="codex-desc" style="color: #00f2fe; margin-bottom: 3px;">Base HP: ${e.hp} | Shield: ${e.shield || 0} | Armor: ${e.armor} | Speed: ${e.speed}x | Bounty: ${e.bounty} ⚡</p>
                <p class="codex-desc" style="color: #cbd5e1;">${e.isBoss ? 'Colossal Titan Boss unit with enraged phase and devastating core damage!' : (e.shield ? 'Kinetic energy shield absorbs incoming damage first.' : 'Standard combat threat.')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (tab === 'difficulty') {
      container.innerHTML = `
        <div class="codex-diff-grid">
          ${Object.values(DIFFICULTY_MODES).map(d => `
            <div class="codex-diff-card" style="border-left: 4px solid ${d.badgeColor}">
              <div class="codex-diff-header">
                <span class="codex-diff-name" style="color: ${d.badgeColor}">${d.name}</span>
                <span class="codex-diff-score">${d.scoreMult}x Score Multiplier</span>
              </div>
              <span class="codex-diff-tagline">${d.tagline}</span>
              <div class="codex-diff-specs">
                <div class="cd-spec"><span>Enemy HP:</span> <strong>${d.hpMult === 1 ? '1.0x (Base)' : `+${Math.round((d.hpMult - 1) * 100)}%`}</strong></div>
                <div class="cd-spec"><span>Enemy Speed:</span> <strong>${d.speedMult === 1 ? '1.0x' : `+${Math.round((d.speedMult - 1) * 100)}%`}</strong></div>
                <div class="cd-spec"><span>Bounty Drop:</span> <strong>${Math.round(d.bountyMult * 100)}%</strong></div>
                <div class="cd-spec"><span>Core Lives:</span> <strong>${d.lives}</strong></div>
                <div class="cd-spec"><span>Starting Supply:</span> <strong>${d.startingCredits} ⚡</strong></div>
                <div class="cd-spec"><span>Wave Scale:</span> <strong>+${Math.round(d.waveScale * 100)}%/wave</strong></div>
              </div>
              <p class="codex-diff-desc">${d.desc}</p>
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
    // Start button on landing page transitions to Sector Selection!
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.modalStart.classList.remove('active');
      this.modalMapSelect.classList.add('active');
      this.renderSectorsModal();
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
      if (!this.game.hasStarted) return;
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

    const openMapsHandler = () => {
      this.modalMapSelect.classList.add('active');
      this.renderSectorsModal();
    };
    document.getElementById('btn-open-maps').addEventListener('click', openMapsHandler);
    const hudLogo = document.querySelector('.hud-logo');
    if (hudLogo) {
      hudLogo.style.cursor = 'pointer';
      hudLogo.title = 'Switch Sector / Threat Level';
      hudLogo.addEventListener('click', openMapsHandler);
    }
    const hudBrand = document.querySelector('.hud-brand');
    if (hudBrand) {
      hudBrand.style.cursor = 'pointer';
      hudBrand.title = 'Switch Sector / Threat Level';
      hudBrand.addEventListener('click', openMapsHandler);
    }
    if (this.elSectorName) {
      this.elSectorName.style.cursor = 'pointer';
      this.elSectorName.title = 'Click to switch Sector / Threat Level';
      this.elSectorName.addEventListener('click', openMapsHandler);
    }
    if (this.elDiffTag) {
      this.elDiffTag.style.cursor = 'pointer';
      this.elDiffTag.title = 'Click to switch Sector / Threat Level';
      this.elDiffTag.addEventListener('click', openMapsHandler);
    }

    const closeMapsHandler = () => {
      this.modalMapSelect.classList.remove('active');
      if (!this.game.hasStarted) {
        // Return to start page if player cancels without choosing a sector
        this.modalStart.classList.add('active');
      }
    };
    document.getElementById('btn-close-maps').addEventListener('click', closeMapsHandler);

    this.modalMapSelect.addEventListener('click', (e) => {
      if (e.target === this.modalMapSelect) {
        closeMapsHandler();
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
      if (!this.game.hasStarted) return;
      this.game.callWaveEarly();
    });

    // Superweapons
    this.btnOrbital.addEventListener('click', () => this.game.triggerSuperweapon('orbital'));
    this.btnStasis.addEventListener('click', () => this.game.triggerSuperweapon('stasis'));
    this.btnOverdrive.addEventListener('click', () => this.game.triggerSuperweapon('overdrive'));

    // Mobile Quick Superweapons & Wave Calling
    if (this.mobileBtnOrbital) {
      this.mobileBtnOrbital.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(25);
        this.game.triggerSuperweapon('orbital');
      });
    }
    if (this.mobileBtnStasis) {
      this.mobileBtnStasis.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(25);
        this.game.triggerSuperweapon('stasis');
      });
    }
    if (this.mobileBtnOverdrive) {
      this.mobileBtnOverdrive.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(25);
        this.game.triggerSuperweapon('overdrive');
      });
    }
    if (this.mobileBtnCallWave) {
      this.mobileBtnCallWave.addEventListener('click', () => {
        if (!this.game.hasStarted) return;
        if (navigator.vibrate) navigator.vibrate(15);
        this.game.callWaveEarly();
      });
    }

    // Mobile Drawer & Inspector Toggles
    if (this.btnToggleSidebar) {
      this.btnToggleSidebar.addEventListener('click', () => this.toggleMobileSidebar());
    }
    if (this.btnCloseSidebar) {
      this.btnCloseSidebar.addEventListener('click', () => this.closeMobileSidebar());
    }
    if (this.sidebarBackdrop) {
      this.sidebarBackdrop.addEventListener('click', () => {
        this.closeMobileSidebar();
        this.closeMobileInspector();
      });
    }
    if (this.btnCloseInspector) {
      this.btnCloseInspector.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.selectedTower = null;
        this.closeMobileInspector();
        this.syncInspector();
      });
    }
    if (this.btnCancelPlacement) {
      this.btnCancelPlacement.addEventListener('click', () => {
        this.cancelPlacement();
      });
    }

    // Mobile Tower Sheet Listeners
    if (this.btnCloseMts) {
      this.btnCloseMts.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.selectedTower = null;
        this.closeMobileInspector();
        this.syncInspector();
      });
    }

    if (this.mtsBtnUpgrade) {
      this.mtsBtnUpgrade.addEventListener('click', () => {
        if (this.game.selectedTower) {
          if (navigator.vibrate) navigator.vibrate(20);
          this.game.selectedTower.upgrade(this.game);
          this.syncInspector();
        }
      });
    }

    if (this.mtsBtnSell) {
      this.mtsBtnSell.addEventListener('click', () => {
        if (this.game.selectedTower) {
          if (navigator.vibrate) navigator.vibrate(25);
          this.game.sellTower(this.game.selectedTower);
          this.closeMobileInspector();
        }
      });
    }

    if (this.mtsTargetSelect) {
      this.mtsTargetSelect.addEventListener('change', (e) => {
        if (this.game.selectedTower) {
          this.game.selectedTower.targetPriority = e.target.value;
          this.inspTargetSelect.value = e.target.value;
        }
      });
    }

    // Inspector Actions
    this.btnUpgrade.addEventListener('click', () => {
      if (this.game.selectedTower) {
        if (navigator.vibrate) navigator.vibrate(20);
        this.game.selectedTower.upgrade(this.game);
        this.syncInspector();
      }
    });

    this.btnSell.addEventListener('click', () => {
      if (this.game.selectedTower) {
        if (navigator.vibrate) navigator.vibrate(25);
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
      this.game.hasStarted = true;
      this.game.resetSector();
      this.updateHUD();
    });

    document.getElementById('btn-victory-next-sector').addEventListener('click', () => {
      this.modalVictory.classList.remove('active');
      const mapKeys = Object.keys(MAPS);
      const curIdx = mapKeys.indexOf(this.game.currentMap.id);
      const nextKey = mapKeys[(curIdx + 1) % mapKeys.length];
      this.game.startWithSector(nextKey);
      this.updateHUD();
      this.renderSectorsModal();
    });

    document.getElementById('btn-gameover-restart').addEventListener('click', () => {
      this.modalGameOver.classList.remove('active');
      this.game.hasStarted = true;
      this.game.resetSector();
      this.updateHUD();
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
          closeMapsHandler();
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

      if (!this.game.hasStarted) return;

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
