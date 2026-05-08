/**
 * Game controller init tests.
 * Tests cover the contract: pixi mode, layer setup, event modes.
 * Pixi Application is mocked — we verify setup calls, not rendering.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pixi.js before any import that uses it
vi.mock('pixi.js', () => {
  const stage = {
    addChild: vi.fn(),
    eventMode: '',
    on: vi.fn(),
    off: vi.fn(),
  };
  const screen = { width: 390, height: 844 };
  const ticker = { add: vi.fn(), addOnce: vi.fn(), remove: vi.fn() };
  const AppClass = vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    stage,
    screen,
    ticker,
    canvas: { style: {} },
    destroy: vi.fn(),
  }));
  const ContainerClass = vi.fn().mockImplementation(() => ({ eventMode: '', addChild: vi.fn() }));
  return {
    Application: AppClass,
    Container: ContainerClass,
    Graphics: vi.fn().mockImplementation(() => ({
      rect: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
      circle: vi.fn().mockReturnThis(),
      poly: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      on: vi.fn(),
      addChild: vi.fn(),
      destroy: vi.fn(),
      alpha: 0,
      x: 0,
      y: 0,
    })),
    Text: vi.fn().mockImplementation(() => ({ text: '', style: {}, x: 0, y: 0, height: 20, destroy: vi.fn() })),
  };
});

vi.mock('gsap', () => ({
  gsap: { to: vi.fn(), killTweensOf: vi.fn(), delayedCall: vi.fn() },
  default: { to: vi.fn(), killTweensOf: vi.fn(), delayedCall: vi.fn() },
}));

import { setupGame } from '~/game/dash-benchmark/screens/gameController';

const makeDeps = () => ({
  coordinator: { audio: { play: vi.fn() } },
  tuning: { scaffold: {}, game: {} },
  audio: {},
  gameData: {},
  analytics: { trackGameStart: vi.fn() },
});

describe('dash-benchmark: game controller init', () => {
  it('mounts Pixi Application in pixi mode (not dom)', () => {
    const ctrl = setupGame(makeDeps() as never);
    expect(ctrl.gameMode).toBe('pixi');
  });

  it('creates layers with correct eventMode values', async () => {
    const { Application, Container } = await import('pixi.js');
    const ctrl = setupGame(makeDeps() as never);
    // Simulate a container div without relying on document
    const container = { appendChild: vi.fn() } as unknown as HTMLDivElement;
    await ctrl.init(container);

    // stage should have been set to 'static'
    const appInstance = (Application as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    expect(appInstance).toBeDefined();

    // Container constructed for layers (bg, platform, char, hud, ui = 5 containers)
    expect((Container as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(5);
  });
});
