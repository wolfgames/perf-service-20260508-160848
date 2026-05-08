/**
 * Platform scroll system tests — pure logic, no Pixi rendering.
 */
import { describe, it, expect } from 'vitest';
import { createPlatformScrollSystem } from '~/game/dash-benchmark/systems/PlatformScrollSystem';
import { DASH_TUNING } from '~/game/dash-benchmark/tuning';

describe('dash-benchmark: platform scroll system', () => {
  it('scrolls segments at SCROLL_SPEED per second', () => {
    const system = createPlatformScrollSystem(1);
    const initial = system.getSegments()[0].xOffset;
    // Use small dt so segments don't go off-screen or trigger speed increase
    system.tick(0.1, false); // 0.1 second
    const after = system.getSegments()[0].xOffset;
    // Segment moved left by SCROLL_SPEED * 0.1 = 28px
    expect(initial - after).toBeCloseTo(DASH_TUNING.SCROLL_SPEED * 0.1, 1);
  });

  it('increases speed by 5 after 200 distance units', () => {
    const system = createPlatformScrollSystem(1);
    const initialSpeed = system.getScrollSpeed();
    // Tick enough to accumulate 200 distance units (200 / 280 ≈ 0.714s)
    system.tick(200 / DASH_TUNING.SCROLL_SPEED + 0.001, false);
    expect(system.getScrollSpeed()).toBe(initialSpeed + DASH_TUNING.SPEED_INCREASE_AMOUNT);
  });

  it('segments chain without seam', () => {
    const system = createPlatformScrollSystem(1);
    const segs = system.getSegments();
    // Each segment's xOffset + widthPx should equal the next segment's xOffset
    for (let i = 0; i < segs.length - 1; i++) {
      expect(segs[i].xOffset + segs[i].widthPx).toBeCloseTo(segs[i + 1].xOffset, 1);
    }
  });

  it('frozen tick does not change segment positions (win/loss state)', () => {
    // Edge case: when frozen=true, segments must not move
    const system = createPlatformScrollSystem(1);
    const xBefore = system.getSegments()[0].xOffset;
    system.tick(0.5, true); // frozen — no scroll
    const xAfter = system.getSegments()[0].xOffset;
    expect(xAfter).toBe(xBefore);
  });
});
