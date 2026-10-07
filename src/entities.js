// Combat Entities: Towers, Enemies, Projectiles, and Tactical Hazards

import { CELL_SIZE, TOWER_TYPES, ENEMY_TYPES } from './constants.js';

export class Enemy {
  constructor(typeKey, path, waveMultiplier = 1, difficulty = null) {
    const proto = ENEMY_TYPES[typeKey] || ENEMY_TYPES.scout;
    this.type = proto.type;
    this.name = proto.name;
    this.path = path;
    this.pathIndex = 0;

    const hpMult = difficulty?.hpMult ?? 1.0;
    const speedMult = difficulty?.speedMult ?? 1.0;
    const bountyMult = difficulty?.bountyMult ?? 1.0;
    const scoreMult = difficulty?.scoreMult ?? 1.0;

    // Multipliers scale with wave progress and combat sector difficulty
    this.maxHp = Math.round(proto.hp * waveMultiplier * hpMult);
    this.hp = this.maxHp;
    this.maxShield = Math.round(proto.shield * waveMultiplier * hpMult);
    this.shield = this.maxShield;
    this.armor = proto.armor;
    this.baseSpeed = proto.speed * speedMult;
    this.speed = this.baseSpeed;
    // Controlled bounty scaled by difficulty (prevents runaway inflation)
    this.bounty = Math.max(1, Math.round(proto.bounty * bountyMult));
    // Score scales with wave progress and difficulty bonus
    this.score = Math.round(proto.score * waveMultiplier * scoreMult);
    this.color = proto.color;
    this.size = proto.size;
    this.isBoss = !!proto.isBoss;
    this.icon = proto.icon;

    // Initial position
    this.x = path[0].x;
    this.y = path[0].y;
    this.distanceTraveled = 0;
    this.isDead = false;
    this.reachedEnd = false;

    // Status Effects
    this.slowTimer = 0;
    this.slowFactor = 0;
    this.freezeTimer = 0;
    this.burnTimer = 0;
    this.burnDps = 0;
    this.stunTimer = 0;

    // Visual rotation
    this.angle = 0;
    this.animTime = Math.random() * 10;
    this.bossPhaseTriggered = false;
  }

  update(dt, game) {
    if (this.isDead || this.reachedEnd) return;

    this.animTime += dt;

    // Process Stun / Freeze
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      game.particles.createCryoFrost(this.x, this.y);
      return;
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    // Process Burn
    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      const burnDmg = this.burnDps * dt;
      this.takeDamage(burnDmg, 'burn', game, null, false);
      if (Math.random() < 0.2) {
        game.particles.createExplosion(this.x, this.y, '#ff6b35', 1, 1, 1.5);
      }
    }

    // Process Slow
    let currentSpeed = this.baseSpeed;
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      currentSpeed *= (1 - this.slowFactor);
    }

    // Waypoint traversal
    const targetPoint = this.path[this.pathIndex + 1];
    if (!targetPoint) {
      this.reachedEnd = true;
      return;
    }

    const dx = targetPoint.x - this.x;
    const dy = targetPoint.y - this.y;
    const dist = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);

    const step = currentSpeed * 60 * dt;
    if (dist <= step) {
      this.x = targetPoint.x;
      this.y = targetPoint.y;
      this.pathIndex++;
      this.distanceTraveled += dist;
      if (this.pathIndex >= this.path.length - 1) {
        this.reachedEnd = true;
      }
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.distanceTraveled += step;
    }

    // Boss Phase check (below 50% HP triggers rage speed and mini drone spawn)
    if (this.isBoss && !this.bossPhaseTriggered && (this.hp / this.maxHp) <= 0.5) {
      this.bossPhaseTriggered = true;
      this.baseSpeed *= 1.25;
      game.particles.addShockwave(this.x, this.y, 160, '#ef476f', 5, 0.6);
      game.particles.addText(this.x, this.y - 30, 'ENRAGED!', '#ff0055', 16, true);
      game.audio.bossAlarm();
    }
  }

  takeDamage(amount, damageType = 'kinetic', game, sourceTower = null, showText = true) {
    if (this.isDead) return;

    let finalDamage = amount;

    // Armor damage reduction for kinetic damage
    if (damageType === 'kinetic' && this.armor > 0) {
      const reduction = Math.min(0.65, this.armor * 0.015);
      finalDamage *= (1 - reduction);
    }

    // Shield absorbs damage first
    if (this.shield > 0) {
      if (this.shield >= finalDamage) {
        this.shield -= finalDamage;
        if (showText && Math.random() < 0.4) {
          game.particles.addText(this.x, this.y - 12, `-${Math.round(finalDamage)} (SHLD)`, '#4cc9f0', 11);
        }
        finalDamage = 0;
      } else {
        finalDamage -= this.shield;
        this.shield = 0;
        game.particles.addShockwave(this.x, this.y, 40, '#4cc9f0', 2, 0.25);
        if (showText) {
          game.particles.addText(this.x, this.y - 12, 'SHIELD BROKEN!', '#00f2fe', 13, true);
        }
      }
    }

    if (finalDamage > 0) {
      this.hp -= finalDamage;
      if (showText && Math.random() < 0.45) {
        const isCrit = damageType === 'crit' || finalDamage > 150;
        const col = isCrit ? '#ffd166' : (damageType === 'energy' ? '#c77dff' : '#ffffff');
        game.particles.addText(this.x, this.y - 12, `-${Math.round(finalDamage)}`, col, isCrit ? 15 : 12, isCrit);
      }
    }

    if (sourceTower) {
      sourceTower.totalDamage += Math.round(amount);
    }

    if (this.hp <= 0 && !this.isDead) {
      this.isDead = true;
      if (sourceTower) {
        sourceTower.kills++;
      }
      game.onEnemyKilled(this);
    }
  }

  applySlow(factor, duration) {
    this.slowFactor = Math.max(this.slowFactor, factor);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  applyFreeze(duration) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  applyStun(duration) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  applyBurn(dps, duration) {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burnTimer = Math.max(this.burnTimer, duration);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Freeze ice encasement
    if (this.freezeTimer > 0) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2fe';
      ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size + 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield Aura Bubble
    if (this.shield > 0) {
      const shieldRatio = this.shield / this.maxShield;
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#4cc9f0';
      ctx.strokeStyle = `rgba(76, 201, 240, ${0.4 + shieldRatio * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -this.animTime * 15;
      ctx.beginPath();
      ctx.arc(0, 0, this.size + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw specific enemy body vector styles
    if (this.type === 'scout') {
      // Delta-wing scout drone
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(this.size, 0);
      ctx.lineTo(-this.size, -this.size * 0.7);
      ctx.lineTo(-this.size * 0.4, 0);
      ctx.lineTo(-this.size, this.size * 0.7);
      ctx.closePath();
      ctx.fill();

      // Core engine glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-this.size * 0.3, 0, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'raider') {
      // Hexagonal armored walker
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const rad = (Math.PI / 3) * i;
        const px = Math.cos(rad) * this.size;
        const py = Math.sin(rad) * this.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eye sensor
      ctx.fillStyle = this.color;
      ctx.fillRect(this.size * 0.3, -3, 5, 6);

    } else if (this.type === 'juggernaut') {
      // Heavy Tank Chassis
      ctx.fillStyle = '#171a2e';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fillRect(-this.size, -this.size * 0.8, this.size * 2, this.size * 1.6);
      ctx.strokeRect(-this.size, -this.size * 0.8, this.size * 2, this.size * 1.6);

      // Hazard stripes
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size * 0.3, -this.size * 0.5, this.size * 0.6, this.size);

    } else if (this.type === 'speeder') {
      // Jet Speeder
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(this.size * 1.3, 0);
      ctx.lineTo(-this.size * 0.8, -this.size * 0.5);
      ctx.lineTo(-this.size * 0.4, 0);
      ctx.lineTo(-this.size * 0.8, this.size * 0.5);
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'shielded') {
      // Crystal Core Golem
      ctx.fillStyle = '#121f3d';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'titan') {
      // Titan Boss
      ctx.fillStyle = '#2d0c14';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.color;

      ctx.beginPath();
      ctx.moveTo(this.size * 1.2, 0);
      ctx.lineTo(this.size * 0.5, -this.size);
      ctx.lineTo(-this.size, -this.size * 0.8);
      ctx.lineTo(-this.size * 0.6, 0);
      ctx.lineTo(-this.size, this.size * 0.8);
      ctx.lineTo(this.size * 0.5, this.size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Reactor Core
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff0055';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Render Health and Shield Bars above head (unrotated)
    this.drawHealthBar(ctx);
  }

  drawHealthBar(ctx) {
    const barWidth = Math.max(26, this.size * 1.8);
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.size - 12;

    // Background track
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // HP Fill
    const hpRatio = Math.max(0, this.hp / this.maxHp);
    const hpColor = hpRatio > 0.5 ? '#06d6a0' : (hpRatio > 0.25 ? '#ffd166' : '#ef476f');
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    // Shield Bar (if active)
    if (this.shield > 0) {
      const shieldRatio = Math.max(0, this.shield / this.maxShield);
      ctx.fillStyle = '#4cc9f0';
      ctx.fillRect(barX, barY - 4, barWidth * shieldRatio, 2.5);
    }
  }
}

export class Tower {
  constructor(col, row, typeKey) {
    this.col = col;
    this.row = row;
    this.x = (col + 0.5) * CELL_SIZE;
    this.y = (row + 0.5) * CELL_SIZE;
    this.type = typeKey;
    this.proto = TOWER_TYPES[typeKey];

    this.tier = 1;
    this.tierName = 'Standard';
    this.range = this.proto.range;
    this.baseDamage = this.proto.damage;
    this.baseFireRate = this.proto.fireRate;
    this.fireCooldown = 0;
    this.rotation = -Math.PI / 2;
    this.target = null;

    this.kills = 0;
    this.totalDamage = 0;
    this.totalInvestedCost = this.proto.cost;
    this.targetPriority = 'first'; // 'first', 'last', 'strongest', 'weakest', 'closest'

    // Beacon / Support Buff Modifiers (reset each frame)
    this.buffSpeed = 0;
    this.buffRange = 0;
    this.buffDamage = 0;

    // Animation recoil
    this.recoil = 0;
  }

  get effectiveDamage() {
    if (this.proto.isSupport) return 0;
    return Math.round((this.baseDamage || 0) * (1 + this.buffDamage));
  }

  get effectiveFireRate() {
    if (this.proto.isSupport) return 0;
    return (this.baseFireRate || 0) * (1 + this.buffSpeed);
  }

  get effectiveRange() {
    return this.range * (1 + this.buffRange);
  }

  get dps() {
    if (this.proto.isSupport) return 0;
    if (this.proto.isBeam) return Math.round(this.effectiveDamage);
    return Math.round(this.effectiveDamage * this.effectiveFireRate);
  }

  canUpgrade() {
    return this.tier < 3;
  }

  getNextUpgrade() {
    if (this.tier >= 3) return null;
    return this.proto.upgrades[this.tier - 1];
  }

  upgrade(game) {
    const next = this.getNextUpgrade();
    if (!next || game.credits < next.cost) return false;

    game.credits -= next.cost;
    this.totalInvestedCost += next.cost;
    this.tier++;
    this.tierName = next.tierName;

    if (next.damageDelta) this.baseDamage += next.damageDelta;
    if (next.rateDelta) this.baseFireRate += next.rateDelta;
    if (next.rangeDelta) this.range += next.rangeDelta;
    if (next.splashDelta && this.proto.splashRadius) this.proto.splashRadius += next.splashDelta;
    if (next.slowFactor) this.proto.slowFactor = next.slowFactor;
    if (next.burnZone) this.burnZoneEnabled = true;
    if (next.shredArmor) this.shredArmor = true;
    if (next.critChance) this.critChance = next.critChance;
    if (next.buffSpeed) this.proto.buffSpeed = next.buffSpeed;
    if (next.bonusCreditsWave) this.proto.bonusCreditsWave = next.bonusCreditsWave;

    game.audio.upgrade();
    game.particles.addShockwave(this.x, this.y, 80, this.proto.color, 4, 0.4);
    game.particles.addText(this.x, this.y - 20, `UPGRADED: ${this.tierName}!`, '#00ff87', 14, true);
    return true;
  }

  getRefund() {
    return Math.round(this.totalInvestedCost * 0.7);
  }

  update(dt, game) {
    // Recoil recovery
    if (this.recoil > 0) {
      this.recoil = Math.max(0, this.recoil - dt * 25);
    }

    // Support beacons do not fire offensive weapons; they radiate buffs
    if (this.proto.isSupport) {
      this.radiateSupportBuffs(game);
      return;
    }

    // Find and aim at best target
    this.target = this.findTarget(game.enemies);

    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.rotation = Math.atan2(dy, dx);
    }

    // Continuous Beam weapon (Cryo Emitter)
    if (this.proto.isBeam) {
      if (this.target) {
        const dps = this.effectiveDamage;
        this.target.takeDamage(dps * dt, 'cold', game, this, false);
        this.target.applySlow(this.proto.slowFactor, 0.4);
        game.particles.createLaserHit(this.target.x, this.target.y, this.proto.color, 1);
        if (Math.random() < 0.15) {
          game.audio.cryo();
        }
      }
      return;
    }

    // Discrete Projectile Cooldowns
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    if (this.fireCooldown <= 0 && this.target) {
      this.fire(this.target, game);
      this.fireCooldown = 1 / this.effectiveFireRate;
      this.recoil = 6;
    }
  }

  radiateSupportBuffs(game) {
    const rangeSq = this.effectiveRange * this.effectiveRange;
    game.towers.forEach(t => {
      if (t !== this && !t.proto.isSupport) {
        const d2 = (t.x - this.x) ** 2 + (t.y - this.y) ** 2;
        if (d2 <= rangeSq) {
          t.buffSpeed = Math.max(t.buffSpeed, this.proto.buffSpeed || 0.25);
          t.buffRange = Math.max(t.buffRange, this.proto.buffRange || 0.15);
          if (this.tier === 3) {
            t.buffDamage = Math.max(t.buffDamage, 0.25);
          }
        }
      }
    });
  }

  findTarget(enemies) {
    const rangeSq = this.effectiveRange * this.effectiveRange;
    const candidates = enemies.filter(e => {
      if (e.isDead || e.reachedEnd) return false;
      const d2 = (e.x - this.x) ** 2 + (e.y - this.y) ** 2;
      return d2 <= rangeSq;
    });

    if (candidates.length === 0) return null;

    switch (this.targetPriority) {
      case 'last':
        return candidates.reduce((prev, curr) => curr.distanceTraveled < prev.distanceTraveled ? curr : prev);
      case 'strongest':
        return candidates.reduce((prev, curr) => curr.hp > prev.hp ? curr : prev);
      case 'weakest':
        return candidates.reduce((prev, curr) => curr.hp < prev.hp ? curr : prev);
      case 'closest':
        return candidates.reduce((prev, curr) => {
          const dCurr = (curr.x - this.x) ** 2 + (curr.y - this.y) ** 2;
          const dPrev = (prev.x - this.x) ** 2 + (prev.y - this.y) ** 2;
          return dCurr < dPrev ? curr : prev;
        });
      case 'first':
      default:
        return candidates.reduce((prev, curr) => curr.distanceTraveled > prev.distanceTraveled ? curr : prev);
    }
  }

  fire(target, game) {
    const damage = this.effectiveDamage;

    if (this.type === 'gatling') {
      game.audio.laser();
      game.projectiles.push(new Projectile(
        this.x, this.y, target, 'bullet', damage, 550, this.proto.color, this, { shredArmor: this.shredArmor }
      ));
    } else if (this.type === 'artillery') {
      game.audio.plasmaShot();
      game.projectiles.push(new Projectile(
        this.x, this.y, target, 'mortar', damage, 320, this.proto.color, this, {
          splashRadius: this.proto.splashRadius,
          burnZone: this.burnZoneEnabled
        }
      ));
    } else if (this.type === 'tesla') {
      game.audio.tesla();
      this.fireTesla(target, game, damage);
    } else if (this.type === 'railgun') {
      game.audio.railgun();
      this.fireRailgun(target, game, damage);
    }
  }

  fireTesla(primaryTarget, game, damage) {
    const chainLimit = (this.proto.chainCount || 3) + (this.tier > 1 ? 2 : 0);
    const chained = [primaryTarget];
    let current = primaryTarget;

    primaryTarget.takeDamage(damage, 'energy', game, this);
    if (Math.random() < (this.proto.stunChance || 0.25)) {
      primaryTarget.applyStun(0.65);
      game.particles.addText(primaryTarget.x, primaryTarget.y - 15, 'STUNNED!', '#c77dff', 12);
    }

    for (let c = 1; c < chainLimit; c++) {
      const nextCandidates = game.enemies.filter(e => 
        !e.isDead && !e.reachedEnd && !chained.includes(e) &&
        Math.hypot(e.x - current.x, e.y - current.y) < 130
      );
      if (nextCandidates.length === 0) break;
      const next = nextCandidates[0];
      const chainDmg = damage * Math.pow(0.8, c);
      next.takeDamage(chainDmg, 'energy', game, this);
      chained.push(next);
      current = next;
    }

    // Spawn lightning visuals
    game.projectiles.push(new LightningArc(this.x, this.y, chained, this.proto.color));
  }

  fireRailgun(target, game, damage) {
    let finalDmg = damage;
    let isCrit = false;
    if (this.critChance && Math.random() < this.critChance) {
      finalDmg *= 3;
      isCrit = true;
    }
    if (target.isBoss) {
      finalDmg *= (this.proto.bossBonus || 1.5);
    }

    // Pierce all enemies intersected by the ray
    const angle = this.rotation;
    const rayLength = this.effectiveRange;
    const endX = this.x + Math.cos(angle) * rayLength;
    const endY = this.y + Math.sin(angle) * rayLength;

    game.enemies.forEach(e => {
      if (e.isDead || e.reachedEnd) return;
      const d = distToSegment({ x: e.x, y: e.y }, { x: this.x, y: this.y }, { x: endX, y: endY });
      if (d <= e.size + 10) {
        e.takeDamage(finalDmg, isCrit ? 'crit' : 'kinetic', game, this);
        game.particles.createLaserHit(e.x, e.y, '#ff007f', 6);
      }
    });

    game.projectiles.push(new RailgunBeam(this.x, this.y, endX, endY, '#ff007f', isCrit));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Support Beacon Aura Ring
    if (this.proto.isSupport) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 214, 160, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, this.effectiveRange, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Overdrive or Beacon Buff Glow Ring around tower base
    if (this.buffSpeed > 0 || this.buffDamage > 0) {
      ctx.strokeStyle = '#00ff87';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff87';
      ctx.beginPath();
      ctx.arc(0, 0, CELL_SIZE * 0.44, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Base Pedestal
    ctx.fillStyle = '#0b1326';
    ctx.strokeStyle = this.proto.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.proto.color;
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Turret Rotating Head
    ctx.rotate(this.rotation);

    if (this.type === 'gatling') {
      // Twin rapid barrels
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = this.proto.color;
      ctx.lineWidth = 1.5;

      // Barrels with recoil offset
      const rx = -this.recoil;
      ctx.fillRect(rx + 6, -5, 14, 3);
      ctx.fillRect(rx + 6, 2, 14, 3);

      // Core dome
      ctx.fillStyle = this.proto.color;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'artillery') {
      // Heavy wide bore mortar
      ctx.fillStyle = '#ff6b35';
      const rx = -this.recoil;
      ctx.fillRect(rx + 2, -6, 18, 12);

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'cryo') {
      // Crystal Lens Focus
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(2, -6);
      ctx.lineTo(2, 6);
      ctx.closePath();
      ctx.fill();

      // Pulsing crystal
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'tesla') {
      // Multi-prong Tesla coil
      ctx.strokeStyle = '#c77dff';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(12, i * 7);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, 0, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'railgun') {
      // Long sleek high-precision rail
      ctx.fillStyle = '#ff007f';
      const rx = -this.recoil;
      ctx.fillRect(rx + 4, -2.5, 24, 5);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx + 24, -1, 4, 2);

    } else if (this.type === 'beacon') {
      // Rotating satellite array
      ctx.fillStyle = '#00ff87';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00ff87';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -10, 20, 20);
    }

    ctx.restore();

    // Draw Cryo Beam to target
    if (this.proto.isBeam && this.target) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
      ctx.lineWidth = 3 + Math.sin(Date.now() * 0.02);
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();
      ctx.restore();
    }

    // Tier indicator pips (at bottom of tower)
    ctx.save();
    ctx.fillStyle = '#ffd166';
    for (let p = 0; p < this.tier; p++) {
      const px = this.x + (p - (this.tier - 1) / 2) * 8;
      const py = this.y + CELL_SIZE * 0.36;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class Projectile {
  constructor(x, y, target, kind, damage, speed, color, sourceTower, extra = {}) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.targetX = target ? target.x : x;
    this.targetY = target ? target.y : y;
    this.kind = kind; // 'bullet', 'mortar'
    this.damage = damage;
    this.speed = speed;
    this.color = color;
    this.sourceTower = sourceTower;
    this.extra = extra;
    this.isDead = false;
    this.life = 4.0; // Safety timeout to prevent any projectile getting stuck

    // Mortar arc tracking
    this.startX = x;
    this.startY = y;
    this.totalDist = Math.max(1, Math.hypot(this.targetX - x, this.targetY - y));
    this.travelDist = 0;
  }

  update(dt, game) {
    if (this.isDead) return false;

    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
      return false;
    }

    if (this.kind === 'bullet') {
      if (this.target && !this.target.isDead) {
        this.targetX = this.target.x;
        this.targetY = this.target.y;
      }
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      const step = this.speed * dt;

      if (dist <= step || isNaN(dist) || dist === 0) {
        this.isDead = true;
        if (this.target && !this.target.isDead) {
          const dmgType = this.extra.shredArmor ? 'energy' : 'kinetic';
          this.target.takeDamage(this.damage, dmgType, game, this.sourceTower);
        }
        game.particles.createLaserHit(this.targetX, this.targetY, this.color, 4);
        return false;
      } else {
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
    } else if (this.kind === 'mortar') {
      const dx = this.targetX - this.startX;
      const dy = this.targetY - this.startY;
      const step = this.speed * dt;
      this.travelDist += step;
      const progress = Math.min(1, this.travelDist / this.totalDist);

      this.x = this.startX + dx * progress;
      this.y = this.startY + dy * progress;

      // Arc height
      const arcHeight = Math.sin(progress * Math.PI) * 50;
      this.renderY = this.y - arcHeight;

      if (progress >= 1 || isNaN(progress)) {
        this.isDead = true;
        this.detonateMortar(game);
        return false;
      }
    }

    return !this.isDead;
  }

  detonateMortar(game) {
    const splash = this.extra.splashRadius || 65;
    game.audio.explosion();
    game.particles.createExplosion(this.targetX, this.targetY, this.color, 16, 4.0, 3.5);

    game.enemies.forEach(e => {
      if (e.isDead || e.reachedEnd) return;
      const dist = Math.hypot(e.x - this.targetX, e.y - this.targetY);
      if (dist <= splash) {
        const falloff = 1 - (dist / splash) * 0.45;
        e.takeDamage(this.damage * falloff, 'energy', game, this.sourceTower);
      }
    });

    if (this.extra.burnZone) {
      game.burnZones.push(new BurnZone(this.targetX, this.targetY, splash * 0.8, 45, 4.0, this.sourceTower));
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.kind === 'bullet') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'mortar') {
      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing plasma bomb
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.renderY || this.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class LightningArc {
  constructor(startX, startY, targets, color) {
    this.startX = startX;
    this.startY = startY;
    this.targets = targets;
    this.color = color;
    this.life = 0.18;
    this.isDead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
    }
    return !this.isDead;
  }

  draw(ctx) {
    if (this.isDead || this.targets.length === 0) return;
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;

    let prevX = this.startX;
    let prevY = this.startY;

    for (let t of this.targets) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      const midX = (prevX + t.x) / 2 + (Math.random() * 16 - 8);
      const midY = (prevY + t.y) / 2 + (Math.random() * 16 - 8);
      ctx.lineTo(midX, midY);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();

      prevX = t.x;
      prevY = t.y;
    }
    ctx.restore();
  }
}

export class RailgunBeam {
  constructor(x1, y1, x2, y2, color, isCrit) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.isCrit = isCrit;
    this.life = 0.25;
    this.maxLife = 0.25;
    this.isDead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
    }
    return !this.isDead;
  }

  draw(ctx) {
    if (this.isDead) return;
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.isCrit ? '#ffd166' : this.color;
    ctx.lineWidth = (this.isCrit ? 5 : 3.5) * alpha;

    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();

    // Inner core white streak
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * alpha;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();

    ctx.restore();
  }
}

export class BurnZone {
  constructor(x, y, radius, dps, duration, sourceTower) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dps = dps;
    this.duration = duration;
    this.life = duration;
    this.sourceTower = sourceTower;
  }

  update(dt, game) {
    this.life -= dt;
    if (this.life <= 0) return false;

    // Apply ticking burn damage to enemies in zone
    game.enemies.forEach(e => {
      if (e.isDead || e.reachedEnd) return;
      if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius) {
        e.takeDamage(this.dps * dt, 'burn', game, this.sourceTower, false);
      }
    });

    return true;
  }

  draw(ctx) {
    const alpha = Math.min(0.6, (this.life / this.duration) * 0.7);
    ctx.save();
    ctx.fillStyle = `rgba(255, 107, 53, ${alpha * 0.4})`;
    ctx.strokeStyle = `rgba(255, 183, 3, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6b35';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// Distance from point to line segment
function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}
