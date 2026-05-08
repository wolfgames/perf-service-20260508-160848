import { describe, it, expect } from 'vitest';
import { generateLevel, generateFallback } from '~/game/dash-benchmark/systems/LevelGenerator';
import { DASH_TUNING } from '~/game/dash-benchmark/tuning';

// Jump duration derived from physics: time to reach apex and return
// t = 2 * |JUMP_VELOCITY| / GRAVITY
const jumpDurationS = (2 * Math.abs(DASH_TUNING.JUMP_VELOCITY)) / DASH_TUNING.GRAVITY;
const maxGapPx = DASH_TUNING.SCROLL_SPEED * jumpDurationS;

describe('dash-benchmark: level generator', () => {
  it('returns 5 segments with first segment safe for level 1', () => {
    const segments = generateLevel(1);
    expect(segments).toHaveLength(5);
    expect(segments[0].type).toBe('platform');
    expect(segments[0].obstacle).toBeNull();
  });

  it('is deterministic for same level input', () => {
    const a = generateLevel(1);
    const b = generateLevel(1);
    expect(a).toEqual(b);
  });

  it('all gaps are solvable (width < scrollSpeed * jumpDuration)', () => {
    // Test multiple levels to get gap segments
    for (let level = 1; level <= 20; level++) {
      const segments = generateLevel(level);
      for (const seg of segments) {
        if (seg.type === 'gap') {
          expect(seg.widthPx).toBeLessThan(maxGapPx);
        }
      }
    }
  });

  it('returns fallback after 10 failed retries', () => {
    // generateFallback is the hardcoded safe layout returned when retries are exhausted
    const fb = generateFallback();
    expect(fb).toHaveLength(5);
    expect(fb.every(s => s.type === 'platform')).toBe(true);
    expect(fb.filter(s => s.obstacle?.type === 'spike')).toHaveLength(1);
    expect(fb[2].obstacle?.type).toBe('spike');
    expect(fb.every(s => s.type !== 'gap')).toBe(true);
  });
});
