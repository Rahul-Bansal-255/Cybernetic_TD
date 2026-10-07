// Tactical Battle Sectors (Maps) and Waypoint Geometry

import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './constants.js';

function getLineCells(p1, p2) {
  const cells = new Set();
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const steps = Math.max(1, Math.ceil(dist / (CELL_SIZE * 0.35)));
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = p1.x + (p2.x - p1.x) * t;
    const y = p1.y + (p2.y - p1.y) * t;
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);
    if (c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS) {
      cells.add(`${c},${r}`);
    }
  }
  return cells;
}

function computePathCells(waypoints) {
  const cells = new Set();
  for (let i = 0; i < waypoints.length - 1; i++) {
    const lineCells = getLineCells(waypoints[i], waypoints[i + 1]);
    lineCells.forEach(cell => cells.add(cell));
  }
  return cells;
}

export const MAPS = {
  sector_alpha: {
    id: 'sector_alpha',
    name: 'Sector Alpha: Neon Ridge',
    difficulty: 'STANDARD',
    tagline: 'Winding neon highway with central choke bastion',
    description: 'An expansive cyber-corridor featuring double hairpin curves. Perfect for mastering tower synergies and artillery splash zones.',
    theme: {
      bg: '#070b16',
      gridLine: 'rgba(0, 242, 254, 0.08)',
      roadFill: 'rgba(12, 24, 48, 0.95)',
      roadBorder: '#00f2fe',
      roadGlow: 'rgba(0, 242, 254, 0.35)',
      coreColor: '#00f2fe',
      spawnerColor: '#ff007f',
      obstacleColor: '#1a2642'
    },
    paths: [
      [
        { x: -24, y: 3.5 * CELL_SIZE },
        { x: 5.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 5.5 * CELL_SIZE, y: 11.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 11.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 18.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 18.5 * CELL_SIZE, y: 11.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 11.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 8, row: 6, type: 'relay' },
      { col: 9, row: 6, type: 'relay' },
      { col: 8, row: 7, type: 'relay' },
      { col: 9, row: 7, type: 'relay' },
      { col: 15, row: 7, type: 'server' },
      { col: 15, row: 8, type: 'server' },
      { col: 2, row: 8, type: 'rock' },
      { col: 21, row: 5, type: 'rock' }
    ]
  },

  sector_beta: {
    id: 'sector_beta',
    name: 'Sector Beta: Nexus Matrix',
    difficulty: 'ADVANCED',
    tagline: 'Dual convergence assault lanes',
    description: 'Enemies infiltrate from both northern and southern breaches, converging at the Nexus Plaza before advancing on the reactor core.',
    theme: {
      bg: '#0c0716',
      gridLine: 'rgba(217, 70, 239, 0.08)',
      roadFill: 'rgba(28, 14, 48, 0.95)',
      roadBorder: '#d946ef',
      roadGlow: 'rgba(217, 70, 239, 0.35)',
      coreColor: '#ffd166',
      spawnerColor: '#00f2fe',
      obstacleColor: '#30184a'
    },
    paths: [
      // Top Lane
      [
        { x: -24, y: 2.5 * CELL_SIZE },
        { x: 6.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 16.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 16.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 10.5 * CELL_SIZE }
      ],
      // Bottom Lane
      [
        { x: -24, y: 12.5 * CELL_SIZE },
        { x: 6.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 16.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 16.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 3.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 10.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 8, row: 4, type: 'quantum' },
      { col: 8, row: 10, type: 'quantum' },
      { col: 13, row: 4, type: 'relay' },
      { col: 13, row: 10, type: 'relay' },
      { col: 18, row: 6, type: 'server' },
      { col: 19, row: 6, type: 'server' }
    ]
  },

  sector_gamma: {
    id: 'sector_gamma',
    name: 'Sector Gamma: Magma Crucible',
    difficulty: 'EXPERT',
    tagline: 'High-speed gauntlet bordered by volcanic rifts',
    description: 'Volcanic vents accelerate hostiles along an intricate serpentine track. Demands razor-sharp positioning and heavy crowd control.',
    theme: {
      bg: '#140808',
      gridLine: 'rgba(255, 107, 53, 0.08)',
      roadFill: 'rgba(42, 16, 12, 0.95)',
      roadBorder: '#ff6b35',
      roadGlow: 'rgba(255, 107, 53, 0.4)',
      coreColor: '#ff0055',
      spawnerColor: '#ffd166',
      obstacleColor: '#3a1710'
    },
    paths: [
      [
        { x: -24, y: 7.5 * CELL_SIZE },
        { x: 4.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 4.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 16.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 16.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 22.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 22.5 * CELL_SIZE, y: 8.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 8.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 1, row: 3, type: 'lava' },
      { col: 7, row: 6, type: 'lava' },
      { col: 7, row: 7, type: 'lava' },
      { col: 13, row: 6, type: 'lava' },
      { col: 13, row: 7, type: 'lava' },
      { col: 19, row: 6, type: 'lava' },
      { col: 19, row: 7, type: 'lava' }
    ]
  },

  sector_delta: {
    id: 'sector_delta',
    name: 'Sector Delta: Orbital Centrifuge',
    difficulty: 'TACTICAL',
    tagline: 'Concentric orbital spiral collapsing toward central core',
    description: 'A zero-gravity orbital fortress. Hostile strike wings penetrate the outer perimeter and spiral inwards through concentric defense rings toward the central reactor core.',
    theme: {
      bg: '#090518',
      gridLine: 'rgba(157, 78, 221, 0.08)',
      roadFill: 'rgba(24, 12, 44, 0.95)',
      roadBorder: '#9d4edd',
      roadGlow: 'rgba(157, 78, 221, 0.4)',
      coreColor: '#ffd166',
      spawnerColor: '#00f2fe',
      obstacleColor: '#24123d'
    },
    paths: [
      [
        { x: -24, y: 1.5 * CELL_SIZE },
        { x: 23.5 * CELL_SIZE, y: 1.5 * CELL_SIZE },
        { x: 23.5 * CELL_SIZE, y: 13.5 * CELL_SIZE },
        { x: 1.5 * CELL_SIZE, y: 13.5 * CELL_SIZE },
        { x: 1.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: 20.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: 20.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: 4.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: 4.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 7.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 3, row: 2, type: 'satellite' },
      { col: 21, row: 2, type: 'satellite' },
      { col: 3, row: 12, type: 'satellite' },
      { col: 21, row: 12, type: 'satellite' },
      { col: 12, row: 5, type: 'quantum' },
      { col: 12, row: 9, type: 'quantum' },
      { col: 16, row: 7, type: 'relay' },
      { col: 17, row: 7, type: 'relay' }
    ]
  },

  sector_epsilon: {
    id: 'sector_epsilon',
    name: 'Sector Epsilon: Cryo Trench',
    difficulty: 'ELITE',
    tagline: 'Dual flanking ravines enclosing high-ground sniper plateau',
    description: 'Glacial sub-zero ravine. Hostile incursions breach the western ice barrier and bifurcate into northern and southern channels around a massive tactical firing plateau.',
    theme: {
      bg: '#040e18',
      gridLine: 'rgba(0, 245, 212, 0.08)',
      roadFill: 'rgba(8, 28, 44, 0.95)',
      roadBorder: '#00f5d4',
      roadGlow: 'rgba(0, 245, 212, 0.4)',
      coreColor: '#70d6ff',
      spawnerColor: '#ff70a6',
      obstacleColor: '#0c2538'
    },
    paths: [
      // North Ice Ravine
      [
        { x: -24, y: 7.5 * CELL_SIZE },
        { x: 3.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 3.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: 17.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: 17.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 7.5 * CELL_SIZE }
      ],
      // South Ice Ravine
      [
        { x: -24, y: 7.5 * CELL_SIZE },
        { x: 3.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 3.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 10.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: 17.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: 17.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 21.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 7.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 1, row: 1, type: 'crystal' },
      { col: 1, row: 13, type: 'crystal' },
      { col: 7, row: 7, type: 'ice' },
      { col: 14, row: 7, type: 'ice' },
      { col: 23, row: 1, type: 'crystal' },
      { col: 23, row: 13, type: 'crystal' }
    ]
  },

  sector_zeta: {
    id: 'sector_zeta',
    name: 'Sector Zeta: Hyper-Grid Coliseum',
    difficulty: 'MASTER',
    tagline: 'Triple breach synchronized incursion across dynamic grid',
    description: 'Cyber-warfare mainframe grid. Hostile squadrons launch synchronized assaults from three breach vectors (North, Center, South), navigating rapid zig-zag switchbacks.',
    theme: {
      bg: '#100518',
      gridLine: 'rgba(255, 0, 127, 0.08)',
      roadFill: 'rgba(34, 10, 48, 0.95)',
      roadBorder: '#ff007f',
      roadGlow: 'rgba(255, 0, 127, 0.4)',
      coreColor: '#00f2fe',
      spawnerColor: '#ffd166',
      obstacleColor: '#300c40'
    },
    paths: [
      // North Breach
      [
        { x: -24, y: 2.5 * CELL_SIZE },
        { x: 7.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 7.5 * CELL_SIZE, y: 5.5 * CELL_SIZE },
        { x: 15.5 * CELL_SIZE, y: 5.5 * CELL_SIZE },
        { x: 15.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 2.5 * CELL_SIZE }
      ],
      // Center Penetration
      [
        { x: -24, y: 7.5 * CELL_SIZE },
        { x: 4.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: 4.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: 11.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: 11.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: 19.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: 19.5 * CELL_SIZE, y: 7.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 7.5 * CELL_SIZE }
      ],
      // South Breach
      [
        { x: -24, y: 12.5 * CELL_SIZE },
        { x: 7.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 7.5 * CELL_SIZE, y: 9.5 * CELL_SIZE },
        { x: 15.5 * CELL_SIZE, y: 9.5 * CELL_SIZE },
        { x: 15.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 12.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 1, row: 5, type: 'node' },
      { col: 1, row: 9, type: 'node' },
      { col: 11, row: 1, type: 'node' },
      { col: 11, row: 13, type: 'node' },
      { col: 18, row: 1, type: 'node' },
      { col: 18, row: 13, type: 'node' }
    ]
  },

  sector_omega: {
    id: 'sector_omega',
    name: 'Sector Omega: Singularity Zero',
    difficulty: 'NIGHTMARE',
    tagline: 'Dual inverted criss-cross gauntlet over dark matter void',
    description: 'The ultimate defensive crucible. Hostile formations charge along inverted criss-crossing helices through the dark matter rift, converging in dual killboxes that push defensive setups to the limit.',
    theme: {
      bg: '#050d0a',
      gridLine: 'rgba(0, 255, 135, 0.08)',
      roadFill: 'rgba(10, 34, 22, 0.95)',
      roadBorder: '#00ff87',
      roadGlow: 'rgba(0, 255, 135, 0.45)',
      coreColor: '#ff007f',
      spawnerColor: '#00f2fe',
      obstacleColor: '#0d2b1c'
    },
    paths: [
      // North-to-South Helix
      [
        { x: -24, y: 2.5 * CELL_SIZE },
        { x: 6.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 6.5 * CELL_SIZE, y: 6.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 6.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 18.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 18.5 * CELL_SIZE, y: 4.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 4.5 * CELL_SIZE }
      ],
      // South-to-North Helix
      [
        { x: -24, y: 12.5 * CELL_SIZE },
        { x: 6.5 * CELL_SIZE, y: 12.5 * CELL_SIZE },
        { x: 6.5 * CELL_SIZE, y: 8.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 8.5 * CELL_SIZE },
        { x: 12.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 18.5 * CELL_SIZE, y: 2.5 * CELL_SIZE },
        { x: 18.5 * CELL_SIZE, y: 10.5 * CELL_SIZE },
        { x: (GRID_COLS + 1) * CELL_SIZE, y: 10.5 * CELL_SIZE }
      ]
    ],
    obstacles: [
      { col: 9, row: 4, type: 'core' },
      { col: 9, row: 10, type: 'core' },
      { col: 15, row: 4, type: 'core' },
      { col: 15, row: 10, type: 'core' },
      { col: 1, row: 7, type: 'core' },
      { col: 23, row: 7, type: 'core' }
    ]
  }
};

// Precompute road cells and blocked sets for fast collision checking
Object.values(MAPS).forEach(map => {
  const roadCells = new Set();
  map.paths.forEach(p => {
    const cells = computePathCells(p);
    cells.forEach(c => roadCells.add(c));
  });
  map.roadCells = roadCells;

  const blockedCells = new Set(roadCells);
  map.obstacles.forEach(obs => {
    blockedCells.add(`${obs.col},${obs.row}`);
  });
  map.blockedCells = blockedCells;
});
