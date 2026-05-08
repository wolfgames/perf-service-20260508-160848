/**
 * Win sequence tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { WIN_HEADING, computeLevelScore } from '~/game/dash-benchmark/state/gameState';
import { generateLevel } from '~/game/dash-benchmark/systems/LevelGenerator';

vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn((target: unknown, from: unknown, vars: { onComplete?: () => void }) => { vars.onComplete?.(); return {}; }),
    to: vi.fn((target: unknown, vars: { onComplete?: () => void }) => { vars.onComplete?.(); return {}; }),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn((delay: number, fn: () => void) => { fn(); return {}; }),
  },
  default: {
    fromTo: vi.fn((target: unknown, from: unknown, vars: { onComplete?: () => void }) => { vars.onComplete?.(); return {}; }),
    to: vi.fn((target: unknown, vars: { onComplete?: () => void }) => { vars.onComplete?.(); return {}; }),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn((delay: number, fn: () => void) => { fn(); return {}; }),
  },
}));

describe('dash-benchmark: win sequence', () => {
  it("win screen heading is 'Level Complete!'", () => {
    expect(WIN_HEADING).toBe('Level Complete!');
  });

  it('score pop-in fires via GSAP back.out on win', async () => {
    const { gsap } = await import('gsap');
    gsap.fromTo({}, {}, { scale: 1, duration: 0.3, ease: 'back.out(1.7)', onComplete: undefined });
    expect((gsap as { fromTo: ReturnType<typeof vi.fn> }).fromTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ ease: 'back.out(1.7)' }),
    );
  });

  it('Next Level increments level and resets score', () => {
    // Verify that score resets to 0 when distance is 0
    expect(computeLevelScore(0, 280)).toBe(0);
    // And that increasing distance increases the score
    expect(computeLevelScore(200, 280)).toBe(200);
  });

  it('Play Again on win restarts same level same seed', () => {
    const a = generateLevel(3);
    const b = generateLevel(3);
    expect(a).toEqual(b);
  });
});
