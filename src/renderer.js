// Canvas 2D Cyber-Aesthetic Renderer

import { CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_COLS, GRID_ROWS } from './constants.js';

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.time = 0;

    // Retina / High-DPI support
    this.setupCanvasDPI();
  }

  setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${CANVAS_WIDTH}px`;
    this.canvas.style.height = `${CANVAS_HEIGHT}px`;
  }

  render(dt) {
    this.time += dt;
    const ctx = this.ctx;
    const map = this.game.currentMap;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Sector Background & Matrix Grid
    this.drawBackground(ctx, map);

    // 2. Road Paths and Holographic Chevrons
    this.drawPaths(ctx, map);

    // 3. Spawner & Core Reactor Portals
    this.drawPortals(ctx, map);

    // 4. Map Obstacles
    this.drawObstacles(ctx, map);

    // 5. Lingering Hazards / Burn Zones
    for (let bz of this.game.burnZones) {
      bz.draw(ctx);
    }

    // 6. Placed Towers
    for (let tower of this.game.towers) {
      tower.draw(ctx);
    }

    // 7. Active Tower Selection / Range Ring
    this.drawSelectedTowerOverlay(ctx);

    // 8. Hostile Enemies
    for (let enemy of this.game.enemies) {
      enemy.draw(ctx);
    }

    // 9. Combat Projectiles & Special FX
    for (let proj of this.game.projectiles) {
      proj.draw(ctx);
    }

    // 10. Particle System & Floating Numbers
    this.game.particles.render(ctx);

    // 11. Mouse Hover Placement Preview or Ability Targeting
    this.drawHoverPlacement(ctx);
    this.drawAbilityCrosshair(ctx);
  }

  drawBackground(ctx, map) {
    // Solid sector background
    ctx.fillStyle = map.theme.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle Sci-Fi Grid Lines
    ctx.strokeStyle = map.theme.gridLine;
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, CANVAS_HEIGHT);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, r * CELL_SIZE);
    }
    ctx.stroke();

    // Subtle moving circuit dots
    ctx.fillStyle = map.theme.roadBorder;
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 12; i++) {
      const px = ((i * 123 + this.time * 25) % CANVAS_WIDTH);
      const py = ((i * 87 + this.time * 15) % CANVAS_HEIGHT);
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.globalAlpha = 1.0;
  }

  drawPaths(ctx, map) {
    for (let path of map.paths) {
      if (path.length < 2) continue;

      // 1. Outer glow path track
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = map.theme.roadFill;
      ctx.lineWidth = CELL_SIZE * 0.95;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // 2. Cyber road border line
      ctx.strokeStyle = map.theme.roadBorder;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = map.theme.roadBorder;
      ctx.stroke();

      // 3. Center pulsing neon track
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14]);
      ctx.lineDashOffset = -this.time * 40;
      ctx.stroke();

      ctx.restore();
    }
  }

  drawPortals(ctx, map) {
    // Draw Spawners at start of each path
    map.paths.forEach(p => {
      const start = p[0];
      const px = Math.max(20, start.x);
      const py = start.y;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = map.theme.spawnerColor;
      ctx.strokeStyle = map.theme.spawnerColor;
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(239, 71, 111, 0.2)';

      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spawner vortex icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ENTRY', px, py);
      ctx.restore();
    });

    // Draw Core Generator at end of path
    const lastP = map.paths[0][map.paths[0].length - 1];
    const endX = Math.min(CANVAS_WIDTH - 24, lastP.x);
    const endY = lastP.y;

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = map.theme.coreColor;
    ctx.strokeStyle = map.theme.coreColor;
    ctx.lineWidth = 3.5;
    ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';

    ctx.beginPath();
    ctx.arc(endX, endY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotating Core Ring
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(this.time * 1.5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORE', endX, endY);
    ctx.restore();
  }

  drawObstacles(ctx, map) {
    map.obstacles.forEach(obs => {
      const x = obs.col * CELL_SIZE;
      const y = obs.row * CELL_SIZE;

      ctx.save();
      ctx.fillStyle = map.theme.obstacleColor;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;

      // Beveled tech pillar
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6);
      ctx.fill();
      ctx.stroke();

      // Pillar core emblem
      ctx.fillStyle = map.theme.roadBorder;
      ctx.globalAlpha = 0.5 + Math.sin(this.time * 2 + obs.col) * 0.3;
      ctx.beginPath();
      ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawSelectedTowerOverlay(ctx) {
    const tower = this.game.selectedTower;
    if (!tower) return;

    ctx.save();
    // Glowing Animated Range Circle
    ctx.strokeStyle = tower.proto.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = tower.proto.color;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -this.time * 20;

    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.effectiveRange, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `${tower.proto.color}15`;
    ctx.fill();

    // Selection reticle around tower base
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, CELL_SIZE * 0.46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawHoverPlacement(ctx) {
    if (!this.game.placementMode || !this.game.hoverTile) return;

    const { col, row } = this.game.hoverTile;
    const towerProto = this.game.selectedPlacementProto;
    if (!towerProto) return;

    const isValid = this.game.isValidPlacement(col, row);
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;

    ctx.save();
    // Grid box highlight
    ctx.fillStyle = isValid ? 'rgba(0, 255, 135, 0.25)' : 'rgba(239, 71, 111, 0.3)';
    ctx.strokeStyle = isValid ? '#00ff87' : '#ef476f';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = isValid ? '#00ff87' : '#ef476f';

    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Range preview circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, towerProto.range, 0, Math.PI * 2);
    ctx.strokeStyle = isValid ? towerProto.color : '#ef476f';
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.fillStyle = `${isValid ? towerProto.color : '#ef476f'}12`;
    ctx.fill();

    // Preview Icon
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(towerProto.icon, centerX, centerY);

    ctx.restore();
  }

  drawAbilityCrosshair(ctx) {
    if (!this.game.activeAbilityMode || !this.game.mousePos) return;

    const { x, y } = this.game.mousePos;
    const ability = this.game.activeAbilityMode;

    ctx.save();
    if (ability === 'orbital') {
      const radius = 130;
      ctx.strokeStyle = '#ff007f';
      ctx.fillStyle = 'rgba(255, 0, 127, 0.18)';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff007f';

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Targeting crosshairs
      ctx.beginPath();
      ctx.moveTo(x - radius - 15, y);
      ctx.lineTo(x + radius + 15, y);
      ctx.moveTo(x, y - radius - 15);
      ctx.lineTo(x, y + radius + 15);
      ctx.stroke();

      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET ORBITAL BEAM', x, y - radius - 20);
    }
    ctx.restore();
  }
}
