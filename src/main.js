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

  window.__GAME__ = game;
  window.__UI__ = ui;

  // Link game engine callbacks to UI
  game.onStateChange = () => ui.updateHUD();
  game.onWaveChange = () => ui.updateHUD();
  game.onSelectTower = (tower) => ui.syncInspector();

  // Unified Mouse & Touch Coordinate Translator
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function handlePointerMove(e) {
    const coords = getCanvasCoords(e);
    game.mousePos = coords;

    const col = Math.floor(coords.x / CELL_SIZE);
    const row = Math.floor(coords.y / CELL_SIZE);
    game.hoverTile = { col, row };
  }

  function handlePointerLeave() {
    game.hoverTile = null;
  }

  function handleCanvasAction(coords, isShift = false) {
    if (!game.hasStarted) {
      ui.modalMapSelect.classList.add('active');
      ui.renderSectorsModal();
      return;
    }

    const col = Math.floor(coords.x / CELL_SIZE);
    const row = Math.floor(coords.y / CELL_SIZE);

    // 1. Orbital Superweapon Cast
    if (game.activeAbilityMode === 'orbital') {
      game.castOrbitalStrike(coords.x, coords.y);
      if (navigator.vibrate) navigator.vibrate(35);
      ui.updateHUD();
      return;
    }

    // 2. Tower Placement Mode
    if (game.placementMode && game.selectedPlacementProto) {
      const success = game.placeTower(col, row, game.selectedPlacementProto.id);
      if (success) {
        if (navigator.vibrate) navigator.vibrate(20);
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        // On touch screens or if not holding shift or cannot afford another, cancel placement mode
        if (isTouch || !isShift || game.credits < game.selectedPlacementProto.cost) {
          ui.cancelPlacement();
        }
      } else {
        if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
      }
      ui.updateHUD();
      return;
    }

    // 3. Select existing tower or deselect
    const clickedTower = game.towers.find(t => t.col === col && t.row === row);
    if (clickedTower) {
      game.selectedTower = clickedTower;
      game.audio.towerPlace();
      if (navigator.vibrate) navigator.vibrate(10);
      ui.openMobileInspector();
    } else {
      game.selectedTower = null;
      ui.closeMobileInspector();
    }
    ui.syncInspector();
  }

  // Mouse Events
  canvas.addEventListener('mousemove', handlePointerMove);
  canvas.addEventListener('mouseleave', handlePointerLeave);
  canvas.addEventListener('click', (e) => {
    const coords = getCanvasCoords(e);
    handleCanvasAction(coords, e.shiftKey);
  });

  // First-Class Touch Events for Mobile & Tablets
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePointerMove(e);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handlePointerMove(e);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    handleCanvasAction(coords, false);
    handlePointerLeave();
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => {
    handlePointerLeave();
  });

  // Responsive Fit Canvas to Viewport
  function resizeViewport() {
    const rect = viewport.getBoundingClientRect();
    const vpWidth = Math.max(80, rect.width - 12);
    const vpHeight = Math.max(80, rect.height - 12);
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
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeViewport, 150);
  });
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
