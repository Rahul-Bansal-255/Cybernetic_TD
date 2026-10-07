// Game Bootstrapper and Canvas Interaction Controller

import { CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { GameEngine } from './game.js';
import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';

function bootGame() {
  const canvas = document.getElementById('game-canvas');
  const viewport = document.getElementById('canvas-viewport');

  const game = new GameEngine();
  const renderer = new Renderer(canvas, game);
  const ui = new UIManager(game);

  // Link game engine callbacks to UI
  game.onStateChange = () => ui.updateHUD();
  game.onWaveChange = () => ui.updateHUD();
  game.onSelectTower = (tower) => ui.syncInspector();

  // Mouse Coordinate Translator
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Canvas Mouse Move
  canvas.addEventListener('mousemove', (e) => {
    const coords = getCanvasCoords(e);
    game.mousePos = coords;

    const col = Math.floor(coords.x / CELL_SIZE);
    const row = Math.floor(coords.y / CELL_SIZE);
    game.hoverTile = { col, row };
  });

  canvas.addEventListener('mouseleave', () => {
    game.hoverTile = null;
  });

  // Canvas Click
  canvas.addEventListener('click', (e) => {
    if (!game.hasStarted) {
      ui.modalMapSelect.classList.add('active');
      ui.renderSectorsModal();
      return;
    }

    const coords = getCanvasCoords(e);
    const col = Math.floor(coords.x / CELL_SIZE);
    const row = Math.floor(coords.y / CELL_SIZE);

    // 1. Orbital Superweapon Cast
    if (game.activeAbilityMode === 'orbital') {
      game.castOrbitalStrike(coords.x, coords.y);
      ui.updateHUD();
      return;
    }

    // 2. Tower Placement Mode
    if (game.placementMode && game.selectedPlacementProto) {
      const success = game.placeTower(col, row, game.selectedPlacementProto.id);
      if (success) {
        // If not holding shift or cannot afford another, cancel placement mode
        if (!e.shiftKey || game.credits < game.selectedPlacementProto.cost) {
          ui.cancelPlacement();
        }
      }
      ui.updateHUD();
      return;
    }

    // 3. Select existing tower or deselect
    const clickedTower = game.towers.find(t => t.col === col && t.row === row);
    if (clickedTower) {
      game.selectedTower = clickedTower;
      game.audio.towerPlace();
    } else {
      game.selectedTower = null;
    }
    ui.syncInspector();
  });

  // Responsive Fit Canvas to Viewport
  function resizeViewport() {
    const vpWidth = viewport.clientWidth - 20;
    const vpHeight = viewport.clientHeight - 20;
    const aspect = CANVAS_WIDTH / CANVAS_HEIGHT;

    let targetWidth = vpWidth;
    let targetHeight = vpWidth / aspect;

    if (targetHeight > vpHeight) {
      targetHeight = vpHeight;
      targetWidth = vpHeight * aspect;
    }

    canvas.style.width = `${Math.floor(targetWidth)}px`;
    canvas.style.height = `${Math.floor(targetHeight)}px`;
  }

  window.addEventListener('resize', resizeViewport);
  resizeViewport();

  // Initialize Game State
  game.init('sector_alpha');
  ui.updateHUD();

  // Animation Frame Game Loop
  let lastTime = performance.now();
  function gameLoop(currentTime) {
    const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    try {
      game.update(dt);
      renderer.render(dt);
    } catch (err) {
      console.error('Game tick error:', err);
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('DOMContentLoaded', bootGame);
