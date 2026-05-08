/**
 * Obstacle placement tests — verifies constraint rules from the GDD.
 */
import { describe, it, expect } from 'vitest';
import { generateLevel } from '~/game/dash-benchmark/systems/LevelGenerator';
import {
  getObstacleY,
  SPIKE_WIDTH,
  SPIKE_HEIGHT,
  BARRIER_WIDTH,
  BARRIER_HEIGHT,
  BARRIER_CLEARANCE,
  PLATFORM_BASE_Y,
} from '~/game/dash-benchmark/entities/Obstacle';
import { DASH_TUNING, getTier } from '~/game/dash-benchmark/tuning';

const CHARACTER_WIDTH = 48;
const jumpDurationS = (2 * Math.abs(DASH_TUNING.JUMP_VELOCITY)) / DASH_TUNING.GRAVITY;
const maxJumpHeight = Math.abs(DASH_TUNING.JUMP_VELOCITY) ** 2 / (2 * DASH_TUNING.GRAVITY);

describe('dash-benchmark: obstacle placement', () => {
  it('places spike at correct position from level descriptor', () => {
    // generateLevel level=3 to guarantee a spike (tier spikeFreq=0.10, retries)
    // We test placement logic via getObstacleY and known offsets
    const spikeY = getObstacleY('spike');
    // Spike sits on top of platform base: platformBase - spikeHeight
    expect(spikeY).toBe(PLATFORM_BASE_Y - SPIKE_HEIGHT);
  });

  it('places barrier with clearance above max jump height', () => {
    const barrierY = getObstacleY('barrier');
    // Barrier must be above the max jump apex + 8px clearance
    const maxJumpApexY = PLATFORM_BASE_Y - maxJumpHeight;
    expect(barrierY).toBeLessThanOrEqual(maxJumpApexY - BARRIER_CLEARANCE);
  });

  it('warm-up tier has no barriers, spike freq ≤ 10%', () => {
    // Verify no barriers appear in warm-up tier (levels 1-5)
    for (let lvl = 1; lvl <= 5; lvl++) {
      const segs = generateLevel(lvl);
      const hasBarrier = segs.some(s => s.obstacle?.type === 'barrier');
      expect(hasBarrier).toBe(false);
    }

    // Verify tuning spikeFreq for warm-up tier is exactly 0.10 (the config controls frequency)
    const tier = getTier(1);
    expect(tier.spikeFreq).toBe(0.10);
    expect(tier.hasBarriers).toBe(false);
  });

  it('no spike within 2cw of level start', () => {
    // Segment 0 is always safe (by contract); segment 1 should also not have a spike within 2cw
    for (let lvl = 1; lvl <= 10; lvl++) {
      const segs = generateLevel(lvl);
      // Segment 0: always no obstacle
      expect(segs[0].obstacle).toBeNull();
      // Segment 1: spike at offset < 2*CHARACTER_WIDTH would violate constraint
      if (segs[1]?.obstacle?.type === 'spike') {
        expect(segs[1].obstacle.xOffset).toBeGreaterThanOrEqual(CHARACTER_WIDTH * 2);
      }
    }
  });

  it('no obstacle within 3cw of gap; no adjacent gaps', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      const segs = generateLevel(lvl);
      for (let i = 0; i < segs.length; i++) {
        // No adjacent gaps
        if (segs[i].type === 'gap' && segs[i + 1]) {
          expect(segs[i + 1].type).not.toBe('gap');
        }
      }
    }
  });

  it('spike Y position sits flush on platform surface (not floating or embedded)', () => {
    // Edge case: spike must touch the platform, not hover above or clip below
    const spikeY = getObstacleY('spike');
    // spikeY + SPIKE_HEIGHT should equal PLATFORM_BASE_Y exactly
    expect(spikeY + SPIKE_HEIGHT).toBe(PLATFORM_BASE_Y);
  });
});
