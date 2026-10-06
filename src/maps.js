// Tactical Battle Sectors (Maps) and Waypoint Geometry

import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './constants.js';

function getLineCells(p1, p2) {
  const cells = new Set();
  const c1 = Math.floor(p1.x / CELL_SIZE);
  const r1 = Math.floor(p1.y / CELL_SIZE);
  const c2 = Math.floor(p2.x / CELL_SIZE);
  const r2 = Math.floor(p2.y / CELL_SIZE);

  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);

  for (let c = minC; c <= maxC; c++) {
    for (let r = minR; r <= maxR; r++) {
      if (c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS) {
        cells.add(`${c},${r}`);
      }
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
