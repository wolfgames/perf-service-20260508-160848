/**
 * Dash Benchmark game controller — Pixi mode.
 *
 * Wires together: state signals, physics, platform scroll, obstacle system,
 * character, HUD, renderers, audio, and the loss/win sequences.
 *
 * Architecture: Controller → Systems (pure logic) → Renderers (Pixi display).
 */

import { createSignal } from 'solid-js';
import { Application, Container } from 'pixi.js';
import { gsap } from 'gsap';
import type { GameControllerDeps, GameController, SetupGame } from '~/game/mygame-contract';
import { dashGameState } from '../state/gameState';
import { createCharacterState } from '../systems/PhysicsSystem';
import { createPlatformScrollSystem } from '../systems/PlatformScrollSystem';
import { createCharacterController, CHARACTER_SIZE } from '../entities/PlayerCharacter';
import { createPlatformRenderer } from '../renderers/PlatformRenderer';
import { createCharacterRenderer } from '../renderers/CharacterRenderer';
import { createObstacleRenderer } from '../renderers/ObstacleRenderer';
import { createGameRenderer } from '../renderers/GameRenderer';
import { createHudRenderer } from '../renderers/HudRenderer';
import { createAudioSetup } from '../audio/audioSetup';
import type { CharacterState } from '../systems/PhysicsSystem';

/** Platform base Y (60% of 844). */
const PLATFORM_BASE_Y = 506;

export const setupGame: SetupGame = (deps: GameControllerDeps): GameController => {
  const [ariaText, setAriaText] = createSignal('Game loading...');

  let app: Application | null = null;
  let inputEnabled = false;
  let gameEnding = false; // guard against re-entrant win/loss handling
  let charState: CharacterState = createCharacterState(PLATFORM_BASE_Y);
  let prevCharState: CharacterState = charState;
  let jumpQueued = false;

  // Initial level placeholder — reset to gameState.level() in init().
  const scrollSystem = createPlatformScrollSystem(1);
  const gameRenderer = createGameRenderer();
  const hudRenderer = createHudRenderer();

  let platformRenderer: ReturnType<typeof createPlatformRenderer> | null = null;
  let obstacleRenderer: ReturnType<typeof createObstacleRenderer> | null = null;
  let charController: ReturnType<typeof createCharacterController> | null = null;
  let charRenderer: ReturnType<typeof createCharacterRenderer> | null = null;

  const audio = createAudioSetup({
    play: (alias: string) => (deps.coordinator as { audio?: { play?: (a: string) => Promise<void> } })?.audio?.play?.(alias) ?? Promise.resolve(),
  });

  const onTap = (): void => {
    if (!inputEnabled) return;
    jumpQueued = true;
  };

  const handleLoss = async (): Promise<void> => {
    if (gameEnding) return;
    gameEnding = true;
    inputEnabled = false;
    setAriaText('Oh no! Try Again?');
    await new Promise<void>(resolve => { gsap.delayedCall(0.2, resolve); });
    await gameRenderer.playLossFlash();
    await audio.playLoss();
    dashGameState.setLost();
    deps.goto?.('results');
  };

  const handleWin = (): void => {
    if (gameEnding) return;
    gameEnding = true;
    inputEnabled = false;
    setAriaText('Level Complete!');
    void audio.playWin();
    dashGameState.setWon();
    deps.goto?.('results');
  };

  return {
    gameMode: 'pixi',
    ariaText,

    async init(container: HTMLDivElement) {
      setAriaText('Gameplay Screen');

      app = new Application();
      await app.init({
        resizeTo: container,
        background: 0x1a1a2e,
        resolution: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
        autoDensity: true,
      }).catch((err: unknown) => { console.error('Pixi init failed:', err); throw err; });

      container.appendChild(app.canvas as HTMLCanvasElement);

      // ── Layer setup ──────────────────────────────────────────────────────
      app.stage.eventMode = 'static';

      const bgLayer = new Container();
      bgLayer.eventMode = 'none';

      const platformLayer = new Container();
      platformLayer.eventMode = 'passive';

      const charLayer = new Container();
      charLayer.eventMode = 'passive';

      const hudLayer = new Container();
      hudLayer.eventMode = 'none';

      const uiLayer = new Container();
      uiLayer.eventMode = 'passive';

      app.stage.addChild(bgLayer, platformLayer, charLayer, hudLayer, uiLayer);

      // ── Renderers ────────────────────────────────────────────────────────
      const viewportW = app.screen.width;
      const viewportH = app.screen.height;
      const groundY = PLATFORM_BASE_Y;

      platformRenderer = createPlatformRenderer();
      platformRenderer.init(platformLayer);

      obstacleRenderer = createObstacleRenderer();
      obstacleRenderer.init(platformLayer);

      charController = createCharacterController({ groundY, viewportWidth: viewportW, viewportBottom: viewportH });
      charState = createCharacterState(groundY);
      prevCharState = charState;

      charRenderer = createCharacterRenderer(charController);
      charRenderer.init(charLayer);

      gameRenderer.init(uiLayer, viewportW, viewportH);
      hudRenderer.init(hudLayer, viewportW, viewportH);

      // ── Initial state ────────────────────────────────────────────────────
      // dashGameState.level() is pre-set by ResultsScreen (handleNextLevel / handleTryAgain)
      // before navigating to game. For first load it defaults to 1.
      gameEnding = false;
      const currentLevel = dashGameState.level();
      dashGameState.reset(currentLevel);
      scrollSystem.reset(currentLevel);
      platformRenderer.update(scrollSystem.getSegments());
      obstacleRenderer.update(scrollSystem.getSegments());
      charRenderer.update(charState, prevCharState);
      hudRenderer.update(0);

      // ── Full-screen tap zone ─────────────────────────────────────────────
      app.stage.on('pointertap', onTap);

      // ── Game loop ────────────────────────────────────────────────────────
      app.ticker.add((ticker) => {
        const state = dashGameState.boardState();
        const frozen = state === 'Won' || state === 'Lost';
        const dt = ticker.deltaMS / 1000;

        // Platform + distance
        scrollSystem.tick(dt, frozen);
        if (!frozen) {
          dashGameState.stepDistance(dt);
          if (scrollSystem.getScrollSpeed() !== dashGameState.scrollSpeed()) {
            dashGameState.setScrollSpeed(scrollSystem.getScrollSpeed());
          }
        }
        platformRenderer?.update(scrollSystem.getSegments());
        obstacleRenderer?.update(scrollSystem.getSegments());
        hudRenderer.update(dashGameState.distance());

        if (frozen) return;

        // Character physics
        const groundPresent = isCharacterOverGround(scrollSystem.getSegments(), viewportW * 0.25, CHARACTER_SIZE);
        const effectiveGroundY = groundPresent ? groundY : null;
        prevCharState = charState;
        charState = charController!.applyInput(charState, jumpQueued);
        jumpQueued = false;
        charState = charController!.stepPhysics(charState, dt, effectiveGroundY);
        charRenderer?.update(charState, prevCharState);

        if (charState.movementState === 'Lost') {
          void handleLoss();
          return;
        }

        // Bounding-box collision with obstacles
        if (checkObstacleCollision(scrollSystem.getSegments(), viewportW * 0.25, charState.y - CHARACTER_SIZE, CHARACTER_SIZE)) {
          void handleLoss();
          return;
        }

        // Win check (boardState set by stepDistance)
        if (dashGameState.boardState() === 'Won') {
          handleWin();
        }
      });

      inputEnabled = true;
      setAriaText('Tap to jump');
    },

    destroy() {
      inputEnabled = false;
      app?.stage?.off?.('pointertap', onTap);
      gsap.killTweensOf(app?.stage ?? {});
      hudRenderer.destroy();
      charRenderer?.destroy();
      obstacleRenderer?.destroy();
      platformRenderer?.destroy();
      gameRenderer.destroy();
      app?.destroy(true, { children: true });
      app = null;
    },
  };
};

const isCharacterOverGround = (
  segments: Array<{ type: string; xOffset: number; widthPx: number }>,
  charX: number,
  charSize: number,
): boolean =>
  segments.some(
    seg => seg.type === 'platform' && charX + charSize > seg.xOffset && charX < seg.xOffset + seg.widthPx,
  );

const checkObstacleCollision = (
  segments: Array<{ type: string; xOffset: number; obstacle: { type: string; xOffset: number } | null }>,
  charX: number,
  charY: number,
  charSize: number,
): boolean => {
  for (const seg of segments) {
    if (!seg.obstacle) continue;
    const obstX = seg.xOffset + seg.obstacle.xOffset;
    const obstW = seg.obstacle.type === 'spike' ? 24 : 12;
    const obstH = seg.obstacle.type === 'spike' ? 20 : 40;
    const obstY = PLATFORM_BASE_Y - obstH;
    if (charX < obstX + obstW && charX + charSize > obstX && charY < obstY + obstH && charY + charSize > obstY) {
      return true;
    }
  }
  return false;
};
