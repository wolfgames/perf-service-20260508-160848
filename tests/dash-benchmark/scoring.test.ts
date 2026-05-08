import { describe, it, expect } from 'vitest';
import { computeLevelScore } from '~/game/dash-benchmark/state/gameState';
import { DASH_TUNING } from '~/game/dash-benchmark/tuning';

describe('dash-benchmark: scoring formula', () => {
  it('computes levelScore = distance * speedMultiplier', () => {
    const score = computeLevelScore(200, DASH_TUNING.SCROLL_SPEED);
    // speedMultiplier = SCROLL_SPEED / SCROLL_SPEED = 1.0
    expect(score).toBe(200);
  });

  it('speedMultiplier > 1.0 when scrollSpeed has increased', () => {
    const increasedSpeed = DASH_TUNING.SCROLL_SPEED + 10;
    const score = computeLevelScore(200, increasedSpeed);
    expect(score).toBeGreaterThan(200);
  });

  it('score is floored to integer (no fractional scores)', () => {
    // Edge case: floor() ensures the displayed score is always a whole number
    const score = computeLevelScore(201, DASH_TUNING.SCROLL_SPEED + 1);
    expect(score).toBe(Math.floor(score));
    expect(Number.isInteger(score)).toBe(true);
  });
});
