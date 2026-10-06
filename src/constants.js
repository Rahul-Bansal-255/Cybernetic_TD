// Game Configuration & Archetype Definitions

export const GRID_COLS = 25;
export const GRID_ROWS = 15;
export const CELL_SIZE = 48;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE; // 1200
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 720

export const TOWER_TYPES = {
  gatling: {
    id: 'gatling',
    name: 'Pulse Blaster',
    tagline: 'High fire-rate kinetic disruptor',
    icon: '🔫',
    cost: 100,
    range: 150,
    damage: 18,
    fireRate: 5.0, // shots per sec
    color: '#00f2fe',
    description: 'Rapid-fire energy bullets. Excels against swift drones and low-armor targets.',
    upgrades: [
      {
        cost: 90,
        tierName: 'Twin Pulsar',
        damageDelta: 12,
        rateDelta: 1.2,
        rangeDelta: 15,
        desc: '+12 Damage, +1.2 Fire Rate, +15 Range'
      },
      {
        cost: 180,
        tierName: 'Hyper-Vulcan',
        damageDelta: 24,
        rateDelta: 1.8,
        rangeDelta: 20,
        shredArmor: true,
        desc: '+24 Damage, +1.8 Fire Rate, Armor-Piercing rounds'
      }
    ]
  },
  artillery: {
    id: 'artillery',
    name: 'Plasma Mortar',
    tagline: 'Long-range AoE plasma payload',
    icon: '💥',
    cost: 175,
    range: 190,
    damage: 85,
    splashRadius: 65,
    fireRate: 0.85,
    color: '#ff6b35',
    description: 'Fires high-explosive plasma spheres that detonate in an area on impact.',
    upgrades: [
      {
        cost: 135,
        tierName: 'Heavy Bombard',
        damageDelta: 55,
        rangeDelta: 20,
        splashDelta: 15,
        desc: '+55 Damage, +15 Blast Radius, +20 Range'
      },
      {
        cost: 250,
        tierName: 'Thermite Cataclysm',
        damageDelta: 100,
        rangeDelta: 25,
        splashDelta: 25,
        burnZone: true,
        desc: '+100 Damage, Leaves lingering burning plasma zone on impact'
      }
    ]
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo Emitter',
    tagline: 'Sub-zero continuous beam slow',
    icon: '❄️',
    cost: 150,
    range: 140,
    damage: 30, // dps
    slowFactor: 0.45,
    color: '#00e5ff',
    isBeam: true,
    description: 'Continuous cryogenic beam that drastically slows enemies and deals thermal shock.',
    upgrades: [
      {
        cost: 110,
        tierName: 'Blizzard Ray',
        damageDelta: 20,
        rangeDelta: 20,
        slowFactor: 0.60,
        desc: '+20 DPS, Increases slow to 60%, +20 Range'
      },
      {
        cost: 210,
        tierName: 'Absolute Zero',
        damageDelta: 35,
        rangeDelta: 25,
        slowFactor: 0.75,
        chains: 2,
        desc: '+35 DPS, 75% freeze, Chains beam to 2 adjacent targets'
      }
    ]
  },
  tesla: {
    id: 'tesla',
    name: 'Tesla Pylon',
    tagline: 'Chaining high-voltage lightning',
    icon: '⚡',
    cost: 220,
    range: 165,
    damage: 60,
    fireRate: 1.15,
    chainCount: 3,
    stunChance: 0.25,
    color: '#c77dff',
    description: 'Discharges arcs of chaining lightning that jump between targets with a chance to stun.',
    upgrades: [
      {
        cost: 160,
        tierName: 'Arc Matrix',
        damageDelta: 38,
        rangeDelta: 20,
        chainDelta: 2,
        desc: '+38 Damage, Chains up to 5 targets, +20 Range'
      },
      {
        cost: 280,
        tierName: 'Storm Overlord',
        damageDelta: 75,
        rangeDelta: 25,
        chainDelta: 3,
        stunChance: 0.45,
        desc: '+75 Damage, Chains 8 targets, 45% Stun Chance'
      }
    ]
  },
  railgun: {
    id: 'railgun',
    name: 'Void Railgun',
    tagline: 'Hyper-velocity sniper lance',
    icon: '🎯',
    cost: 300,
    range: 310,
    damage: 280,
    fireRate: 0.42,
    pierce: true,
    bossBonus: 1.5,
    color: '#ff007f',
    description: 'Devastating line-piercing sniper beam with massive range and high boss damage.',
    upgrades: [
      {
        cost: 225,
        tierName: 'Gauss Lance',
        damageDelta: 190,
        rangeDelta: 40,
        bossBonus: 1.8,
        desc: '+190 Damage, +40 Range, 1.8x Boss Multiplier'
      },
      {
        cost: 400,
        tierName: 'Orbital Annihilator',
        damageDelta: 380,
        rangeDelta: 60,
        critChance: 0.35,
        desc: '+380 Damage, +60 Range, 35% chance for 3x Critical Hit'
      }
    ]
  },
  beacon: {
    id: 'beacon',
    name: 'Aegis Relay',
    tagline: 'Buffs adjacent towers & income',
    icon: '🌐',
    cost: 200,
    range: 160,
    buffSpeed: 0.25,
    buffRange: 0.15,
    bonusCreditsWave: 25,
    color: '#00ff87',
    isSupport: true,
    description: 'Boosts attack speed and range of neighboring turrets while generating bonus credits.',
    upgrades: [
      {
        cost: 140,
        tierName: 'Overcharge Relay',
        buffSpeed: 0.40,
        rangeDelta: 25,
        bonusCreditsWave: 45,
        desc: '+40% Atk Speed Aura, 45 ⚡ bonus per wave, +25 Range'
      },
      {
        cost: 260,
        tierName: 'Chronos Citadel',
        buffSpeed: 0.60,
        buffDamage: 0.25,
        rangeDelta: 35,
        bonusCreditsWave: 75,
        desc: '+60% Atk Speed, +25% Damage Aura, 75 ⚡ per wave'
      }
    ]
  }
};

export const ENEMY_TYPES = {
  scout: {
    type: 'scout',
    name: 'Scout Drone',
    hp: 85,
    speed: 2.3,
    armor: 0,
    shield: 0,
    bounty: 12,
    score: 50,
    color: '#00f2fe',
    size: 13,
    icon: '🛸'
  },
  raider: {
    type: 'raider',
    name: 'Cyber Raider',
    hp: 210,
    speed: 1.6,
    armor: 5,
    shield: 0,
    bounty: 20,
    score: 90,
    color: '#ffd166',
    size: 16,
    icon: '🤖'
  },
  juggernaut: {
    type: 'juggernaut',
    name: 'Iron Juggernaut',
    hp: 650,
    speed: 0.95,
    armor: 25,
    shield: 0,
    bounty: 50,
    score: 220,
    color: '#9d4edd',
    size: 22,
    icon: '🛡️'
  },
  speeder: {
    type: 'speeder',
    name: 'Phase Speeder',
    hp: 150,
    speed: 3.0,
    armor: 0,
    shield: 40,
    bounty: 28,
    score: 130,
    color: '#06d6a0',
    size: 14,
    icon: '⚡'
  },
  shielded: {
    type: 'shielded',
    name: 'Aegis Crusher',
    hp: 360,
    speed: 1.25,
    armor: 12,
    shield: 250,
    bounty: 55,
    score: 280,
    color: '#4cc9f0',
    size: 19,
    icon: '🔮'
  },
  titan: {
    type: 'titan',
    name: 'Titan Dreadnought',
    hp: 4200,
    speed: 0.72,
    armor: 30,
    shield: 1200,
    bounty: 400,
    score: 2500,
    color: '#ef476f',
    size: 32,
    isBoss: true,
    icon: '☠️'
  }
};

export const SUPERWEAPONS = {
  orbital: {
    id: 'orbital',
    name: 'Orbital Strike',
    cooldown: 45,
    radius: 130,
    damage: 750,
    key: 'Q'
  },
  stasis: {
    id: 'stasis',
    name: 'Cryo Stasis',
    cooldown: 50,
    duration: 4.5,
    key: 'W'
  },
  overdrive: {
    id: 'overdrive',
    name: 'Overdrive Surge',
    cooldown: 40,
    duration: 6.0,
    key: 'E'
  }
};
