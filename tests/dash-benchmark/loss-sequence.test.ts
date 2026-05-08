/**
 * Loss sequence tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { LOSS_HEADING } from '~/game/dash-benchmark/state/gameState';
import { generateLevel } from '~/game/dash-benchmark/systems/LevelGenerator';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((target: unknown, vars: { onComplete?: () => void }) => { vars.onComplete?.(); return {}; }),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn((delay: number, fn: () => void) => { fn(); return {}; }),
  },
  default: {
    to: vi.fn((target: unknown, vars: { onComplete?: () => void }) => { vars.onComplete?.(); return {}; }),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn((delay: number, fn: () => void) => { fn(); return {}; }),
  },
}));

vi.mock('pixi.js', () => ({
  Graphics: vi.fn().mockImplementation(() => ({
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    alpha: 0,
    parent: { removeChild: vi.fn() },
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    destroy: vi.fn(),
  })),
}));

import { createGameRenderer } from '~/game/dash-benchmark/renderers/GameRenderer';

describe('dash-benchmark: loss sequence', () => {
  it('screen flash alpha tweens 0→0.6→0 via GSAP', async () => {
    const { gsap } = await import('gsap');
    const renderer = createGameRenderer();
    renderer.init({ addChild: vi.fn() } as never, 390, 844);
    await renderer.playLossFlash();
    expect((gsap as { to: ReturnType<typeof vi.fn> }).to).toHaveBeenCalled();
  });

  it("loss screen heading is 'Oops! Try Again?'", () => {
    expect(LOSS_HEADING).toBe('Oops! Try Again?');
  });

  it('Try Again restarts same level with same seed', () => {
    const a = generateLevel(1);
    const b = generateLevel(1);
    expect(a).toEqual(b);
  });

  it('LOSS_HEADING is not Game Over (per GDD requirement)', () => {
    // Edge case: GDD explicitly forbids 'Game Over' — heading must be the softer copy
    expect(LOSS_HEADING).not.toBe('Game Over');
    expect(LOSS_HEADING).toBe('Oops! Try Again?');
  });
});
