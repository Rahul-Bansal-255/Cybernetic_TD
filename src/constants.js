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
    tagline: 'Standard defensive training',
    badgeColor: '#06d6a0',
    hpMult: 1.0,
    speedMult: 1.0,
    bountyMult: 0.85,
    scoreMult: 1.0,
    startingCredits: 240,
    lives: 20,
    waveScale: 0.22,
    desc: 'Standard hostile incursions. Balanced baseline economy.'
  },
  veteran: {
    id: 'veteran',
    name: 'VETERAN',
    tagline: 'Recommended challenge for tactical defense',
    badgeColor: '#ffd166',
    hpMult: 1.45,
    speedMult: 1.08,
    bountyMult: 0.65,
    scoreMult: 1.4,
    startingCredits: 190,
    lives: 15,
    waveScale: 0.28,
    desc: '+45% Enemy HP, +8% Speed, -35% Bounty, 15 Core HP. Requires sharp synergies.'
  },
  elite: {
    id: 'elite',
    name: 'ELITE',
    tagline: 'Severe threat incursion with depleted supply',
    badgeColor: '#ff007f',
    hpMult: 2.1,
    speedMult: 1.18,
    bountyMult: 0.45,
    scoreMult: 2.0,
    startingCredits: 150,
    lives: 10,
    waveScale: 0.35,
    desc: '+110% Enemy HP, +18% Speed, -55% Bounty, 10 Core HP. Intense pressure.'
  },
  apocalypse: {
    id: 'apocalypse',
    name: 'APOCALYPSE',
    tagline: 'Ruthless invasion. Extreme lethal precision.',
    badgeColor: '#ef476f',
    hpMult: 3.0,
    speedMult: 1.28,
    bountyMult: 0.32,
    scoreMult: 3.2,
    startingCredits: 120,
    lives: 5,
    waveScale: 0.45,
    desc: '+200% Enemy HP, +28% Speed, -68% Bounty, 5 Core HP. Zero error margin.'
  }
};

export const TOWER_TYPES = {
  gatling: {
    id: 'gatling',
    name: 'Pulse Blaster',
    tagline: 'High fire-rate kinetic disruptor',
    icon: '🔫',
    cost: 110,
    range: 150,
    damage: 14,
    fireRate: 4.5, // shots per sec (63 DPS)
    color: '#00f2fe',
    description: 'Rapid-fire energy bullets. Excels against swift drones and low-armor targets.',
    upgrades: [
      {
        cost: 100,
        tierName: 'Twin Pulsar',
        damageDelta: 8,
        rateDelta: 0.8,
        rangeDelta: 15,
        desc: '+8 Damage, +0.8 Fire Rate, +15 Range'
      },
      {
        cost: 200,
        tierName: 'Hyper-Vulcan',
        damageDelta: 16,
        rateDelta: 1.2,
        rangeDelta: 20,
        shredArmor: true,
        desc: '+16 Damage, +1.2 Fire Rate, Armor-Piercing rounds'
      }
    ]
  },
  artillery: {
    id: 'artillery',
    name: 'Plasma Mortar',
    tagline: 'Long-range AoE plasma payload',
    icon: '💥',
    cost: 185,
    range: 185,
    damage: 70,
    splashRadius: 60,
    fireRate: 0.75,
    color: '#ff6b35',
    description: 'Fires high-explosive plasma spheres that detonate in an area on impact.',
    upgrades: [
      {
        cost: 150,
        tierName: 'Heavy Bombard',
        damageDelta: 40,
        rangeDelta: 15,
        splashDelta: 15,
        desc: '+40 Damage, +15 Blast Radius, +15 Range'
      },
      {
        cost: 280,
        tierName: 'Thermite Cataclysm',
        damageDelta: 70,
        rangeDelta: 20,
        splashDelta: 20,
        burnZone: true,
        desc: '+70 Damage, Leaves lingering burning plasma zone on impact'
      }
    ]
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo Emitter',
    tagline: 'Sub-zero continuous beam slow',
    icon: '❄️',
    cost: 160,
    range: 140,
    damage: 22, // dps
    slowFactor: 0.35,
    color: '#00e5ff',
    isBeam: true,
    description: 'Continuous cryogenic beam that drastically slows enemies and deals thermal shock.',
    upgrades: [
      {
        cost: 130,
        tierName: 'Blizzard Ray',
        damageDelta: 14,
        rangeDelta: 15,
        slowFactor: 0.50,
        desc: '+14 DPS, Increases slow to 50%, +15 Range'
      },
      {
        cost: 240,
        tierName: 'Absolute Zero',
        damageDelta: 22,
        rangeDelta: 20,
        slowFactor: 0.65,
        chains: 2,
        desc: '+22 DPS, 65% freeze, Chains beam to 2 adjacent targets'
      }
    ]
  },
  tesla: {
    id: 'tesla',
    name: 'Tesla Pylon',
    tagline: 'Chaining high-voltage lightning',
    icon: '⚡',
    cost: 230,
    range: 165,
    damage: 48,
    fireRate: 1.0,
    chainCount: 3,
    stunChance: 0.20,
    color: '#c77dff',
    description: 'Discharges arcs of chaining lightning that jump between targets with a chance to stun.',
    upgrades: [
      {
        cost: 175,
        tierName: 'Arc Matrix',
        damageDelta: 28,
        rangeDelta: 15,
        chainDelta: 2,
        desc: '+28 Damage, Chains up to 5 targets, +15 Range'
      },
      {
        cost: 310,
        tierName: 'Storm Overlord',
        damageDelta: 50,
        rangeDelta: 20,
        chainDelta: 2,
        stunChance: 0.35,
        desc: '+50 Damage, Chains 7 targets, 35% Stun Chance'
      }
    ]
  },
  railgun: {
    id: 'railgun',
    name: 'Void Railgun',
    tagline: 'Hyper-velocity sniper lance',
    icon: '🎯',
    cost: 320,
    range: 290,
    damage: 220,
    fireRate: 0.38,
    pierce: true,
    bossBonus: 1.5,
    color: '#ff007f',
    description: 'Devastating line-piercing sniper beam with massive range and high boss damage.',
    upgrades: [
      {
        cost: 250,
        tierName: 'Gauss Lance',
        damageDelta: 140,
        rangeDelta: 30,
        bossBonus: 1.7,
        desc: '+140 Damage, +30 Range, 1.7x Boss Multiplier'
      },
      {
        cost: 450,
        tierName: 'Orbital Annihilator',
        damageDelta: 250,
        rangeDelta: 40,
        critChance: 0.25,
        desc: '+250 Damage, +40 Range, 25% chance for 2.5x Critical Hit'
      }
    ]
  },
  beacon: {
    id: 'beacon',
    name: 'Aegis Relay',
    tagline: 'Buffs adjacent towers & income',
    icon: '🌐',
    cost: 210,
    range: 150,
    buffSpeed: 0.20,
    buffRange: 0.10,
    bonusCreditsWave: 15,
    color: '#00ff87',
    isSupport: true,
    description: 'Boosts attack speed and range of neighboring turrets while generating bonus credits.',
    upgrades: [
      {
        cost: 160,
        tierName: 'Overcharge Relay',
        buffSpeed: 0.30,
        rangeDelta: 20,
        bonusCreditsWave: 25,
        desc: '+30% Atk Speed Aura, 25 ⚡ bonus per wave, +20 Range'
      },
      {
        cost: 290,
        tierName: 'Chronos Citadel',
        buffSpeed: 0.45,
        buffDamage: 0.20,
        rangeDelta: 30,
        bonusCreditsWave: 40,
        desc: '+45% Atk Speed, +20% Damage Aura, 40 ⚡ per wave'
      }
    ]
  }
};

export const ENEMY_TYPES = {
  scout: {
    type: 'scout',
    name: 'Scout Drone',
    hp: 140,
    speed: 2.4,
    armor: 0,
    shield: 0,
    bounty: 3,
    score: 20,
    color: '#00f2fe',
    size: 13,
    icon: '🛸'
  },
  raider: {
    type: 'raider',
    name: 'Cyber Raider',
    hp: 320,
    speed: 1.65,
    armor: 8,
    shield: 0,
    bounty: 6,
    score: 45,
    color: '#ffd166',
    size: 16,
    icon: '🤖'
  },
  juggernaut: {
    type: 'juggernaut',
    name: 'Iron Juggernaut',
    hp: 950,
    speed: 0.95,
    armor: 30,
    shield: 0,
    bounty: 15,
    score: 110,
    color: '#9d4edd',
    size: 22,
    icon: '🛡️'
  },
  speeder: {
    type: 'speeder',
    name: 'Phase Speeder',
    hp: 220,
    speed: 3.1,
    armor: 0,
    shield: 80,
    bounty: 8,
    score: 60,
    color: '#06d6a0',
    size: 14,
    icon: '⚡'
  },
  shielded: {
    type: 'shielded',
    name: 'Aegis Crusher',
    hp: 550,
    speed: 1.25,
    armor: 14,
    shield: 450,
    bounty: 18,
    score: 140,
    color: '#4cc9f0',
    size: 19,
    icon: '🔮'
  },
  titan: {
    type: 'titan',
    name: 'Titan Dreadnought',
    hp: 6800,
    speed: 0.72,
    armor: 35,
    shield: 2400,
    bounty: 80,
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
