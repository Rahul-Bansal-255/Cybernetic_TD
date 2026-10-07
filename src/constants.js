// Game Configuration & Archetype Definitions

export const GRID_COLS = 25;
export const GRID_ROWS = 15;
export const CELL_SIZE = 48;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE; // 1200
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 720

export const DIFFICULTY_MODES = {
  cadet: {
    id: 'cadet',
    name: 'CADET',
    tagline: 'Casual & friendly defensive training',
    badgeColor: '#06d6a0',
    hpMult: 0.75,
    speedMult: 0.90,
    bountyMult: 1.20,
    scoreMult: 1.0,
    startingCredits: 350,
    lives: 25,
    waveScale: 0.12,
    desc: 'Relaxed enemy waves. Generous starting supply. Basic turrets easily hold the line.'
  },
  veteran: {
    id: 'veteran',
    name: 'VETERAN',
    tagline: 'Standard balanced defense challenge',
    badgeColor: '#ffd166',
    hpMult: 1.0,
    speedMult: 1.0,
    bountyMult: 1.0,
    scoreMult: 1.4,
    startingCredits: 260,
    lives: 20,
    waveScale: 0.16,
    desc: 'Standard tactical balance. Rewarding steady turret upgrades, choke points, and beam slows.'
  },
  elite: {
    id: 'elite',
    name: 'ELITE',
    tagline: 'High threat incursion for tactical commanders',
    badgeColor: '#ff007f',
    hpMult: 1.25,
    speedMult: 1.05,
    bountyMult: 0.90,
    scoreMult: 2.0,
    startingCredits: 220,
    lives: 15,
    waveScale: 0.18,
    desc: '+25% Enemy HP, +5% Speed, 15 Core HP. Demands coordinated crowd control and splash coverage.'
  },
  apocalypse: {
    id: 'apocalypse',
    name: 'APOCALYPSE',
    tagline: 'Brutal onslaught. High precision required.',
    badgeColor: '#ef476f',
    hpMult: 1.50,
    speedMult: 1.10,
    bountyMult: 0.80,
    scoreMult: 2.8,
    startingCredits: 180,
    lives: 12,
    waveScale: 0.22,
    desc: '+50% Enemy HP, +10% Speed, 12 Core HP. Requires max tier towers, choke points, and timely superweapons.'
  }
};

export const TOWER_TYPES = {
  gatling: {
    id: 'gatling',
    name: 'Pulse Blaster',
    tagline: 'High fire-rate kinetic disruptor',
    icon: '🔫',
    cost: 85,
    range: 160,
    damage: 18,
    fireRate: 4.5, // 81 DPS
    color: '#00f2fe',
    description: 'Rapid-fire kinetic blasters. Destroys scout drones in just 2–3 hits.',
    upgrades: [
      {
        cost: 80,
        tierName: 'Twin Pulsar',
        damageDelta: 10,
        rateDelta: 0.8,
        rangeDelta: 20,
        desc: '+10 Damage, +0.8 Fire Rate, +20 Range'
      },
      {
        cost: 160,
        tierName: 'Hyper-Vulcan',
        damageDelta: 18,
        rateDelta: 1.2,
        rangeDelta: 25,
        shredArmor: true,
        desc: '+18 Damage, +1.2 Fire Rate, Armor-Piercing rounds'
      }
    ]
  },
  artillery: {
    id: 'artillery',
    name: 'Plasma Mortar',
    tagline: 'Long-range AoE plasma payload',
    icon: '💥',
    cost: 150,
    range: 190,
    damage: 85,
    splashRadius: 70,
    fireRate: 0.8,
    color: '#ff6b35',
    description: 'Fires high-explosive plasma spheres that obliterate enemy clusters.',
    upgrades: [
      {
        cost: 120,
        tierName: 'Heavy Bombard',
        damageDelta: 50,
        rangeDelta: 20,
        splashDelta: 20,
        desc: '+50 Damage, +20 Blast Radius, +20 Range'
      },
      {
        cost: 220,
        tierName: 'Thermite Cataclysm',
        damageDelta: 80,
        rangeDelta: 25,
        splashDelta: 25,
        burnZone: true,
        desc: '+80 Damage, Lingering burning plasma field on impact'
      }
    ]
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo Emitter',
    tagline: 'Sub-zero continuous beam slow',
    icon: '❄️',
    cost: 125,
    range: 150,
    damage: 28, // dps
    slowFactor: 0.40,
    color: '#00e5ff',
    isBeam: true,
    description: 'Continuous cryogenic beam that drastically slows enemies and chills armor.',
    upgrades: [
      {
        cost: 100,
        tierName: 'Blizzard Ray',
        damageDelta: 18,
        rangeDelta: 20,
        slowFactor: 0.55,
        desc: '+18 DPS, Increases slow to 55%, +20 Range'
      },
      {
        cost: 190,
        tierName: 'Absolute Zero',
        damageDelta: 30,
        rangeDelta: 25,
        slowFactor: 0.70,
        chains: 2,
        desc: '+30 DPS, 70% freeze, Chains beam to 2 adjacent targets'
      }
    ]
  },
  tesla: {
    id: 'tesla',
    name: 'Tesla Pylon',
    tagline: 'Chaining high-voltage lightning',
    icon: '⚡',
    cost: 180,
    range: 175,
    damage: 60,
    fireRate: 1.1,
    chainCount: 3,
    stunChance: 0.25,
    color: '#c77dff',
    description: 'Discharges arcs of chaining lightning that jump between targets with 25% stun.',
    upgrades: [
      {
        cost: 140,
        tierName: 'Arc Matrix',
        damageDelta: 35,
        rangeDelta: 20,
        chainDelta: 2,
        desc: '+35 Damage, Chains up to 5 targets, +20 Range'
      },
      {
        cost: 250,
        tierName: 'Storm Overlord',
        damageDelta: 65,
        rangeDelta: 25,
        chainDelta: 2,
        stunChance: 0.40,
        desc: '+65 Damage, Chains 7 targets, 40% Stun Chance'
      }
    ]
  },
  railgun: {
    id: 'railgun',
    name: 'Void Railgun',
    tagline: 'Hyper-velocity sniper lance',
    icon: '🎯',
    cost: 260,
    range: 310,
    damage: 320,
    fireRate: 0.45,
    pierce: true,
    bossBonus: 1.75,
    color: '#ff007f',
    description: 'Devastating line-piercing sniper lance with massive range and high boss damage.',
    upgrades: [
      {
        cost: 200,
        tierName: 'Gauss Lance',
        damageDelta: 180,
        rangeDelta: 35,
        bossBonus: 2.0,
        desc: '+180 Damage, +35 Range, 2.0x Boss Multiplier'
      },
      {
        cost: 360,
        tierName: 'Orbital Annihilator',
        damageDelta: 320,
        rangeDelta: 45,
        critChance: 0.30,
        desc: '+320 Damage, +45 Range, 30% chance for 2.5x Critical Hit'
      }
    ]
  },
  beacon: {
    id: 'beacon',
    name: 'Aegis Relay',
    tagline: 'Buffs adjacent towers & income',
    icon: '🌐',
    cost: 160,
    range: 160,
    buffSpeed: 0.25,
    buffRange: 0.15,
    bonusCreditsWave: 25,
    color: '#00ff87',
    isSupport: true,
    description: 'Boosts attack speed and range of neighboring turrets while generating bonus credits.',
    upgrades: [
      {
        cost: 120,
        tierName: 'Overcharge Relay',
        buffSpeed: 0.35,
        rangeDelta: 25,
        bonusCreditsWave: 35,
        desc: '+35% Atk Speed Aura, 35 ⚡ bonus per wave, +25 Range'
      },
      {
        cost: 230,
        tierName: 'Chronos Citadel',
        buffSpeed: 0.50,
        buffDamage: 0.25,
        rangeDelta: 35,
        bonusCreditsWave: 50,
        desc: '+50% Atk Speed, +25% Damage Aura, 50 ⚡ per wave'
      }
    ]
  }
};

export const ENEMY_TYPES = {
  scout: {
    type: 'scout',
    name: 'Scout Drone',
    hp: 45,
    speed: 1.6,
    armor: 0,
    shield: 0,
    bounty: 3,
    score: 25,
    color: '#00f2fe',
    size: 13,
    icon: '🛸'
  },
  raider: {
    type: 'raider',
    name: 'Cyber Raider',
    hp: 140,
    speed: 1.2,
    armor: 4,
    shield: 0,
    bounty: 6,
    score: 50,
    color: '#ffd166',
    size: 16,
    icon: '🤖'
  },
  juggernaut: {
    type: 'juggernaut',
    name: 'Iron Juggernaut',
    hp: 420,
    speed: 0.75,
    armor: 18,
    shield: 0,
    bounty: 16,
    score: 120,
    color: '#9d4edd',
    size: 22,
    icon: '🛡️'
  },
  speeder: {
    type: 'speeder',
    name: 'Phase Speeder',
    hp: 85,
    speed: 2.2,
    armor: 0,
    shield: 35,
    bounty: 7,
    score: 65,
    color: '#06d6a0',
    size: 14,
    icon: '⚡'
  },
  shielded: {
    type: 'shielded',
    name: 'Aegis Crusher',
    hp: 260,
    speed: 0.95,
    armor: 10,
    shield: 200,
    bounty: 20,
    score: 150,
    color: '#4cc9f0',
    size: 19,
    icon: '🔮'
  },
  titan: {
    type: 'titan',
    name: 'Titan Dreadnought',
    hp: 1200,
    speed: 0.52,
    armor: 20,
    shield: 450,
    bounty: 120,
    score: 1000,
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
    cooldown: 55,
    radius: 130,
    damage: 600,
    key: 'Q'
  },
  stasis: {
    id: 'stasis',
    name: 'Cryo Stasis',
    cooldown: 55,
    duration: 3.8,
    key: 'W'
  },
  overdrive: {
    id: 'overdrive',
    name: 'Overdrive Surge',
    cooldown: 48,
    duration: 5.0,
    key: 'E'
  }
};
