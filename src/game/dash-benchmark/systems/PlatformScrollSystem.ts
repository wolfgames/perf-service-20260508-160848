/**
 * Platform scroll system — pure logic layer.
 * Manages segment positions, scroll speed, and distance tracking.
 * No Pixi imports; renderers consume the data via getSegments().
 */

import { generateLevel, type SegmentDescriptor } from './LevelGenerator';
import { DASH_TUNING } from '../tuning';

/** Segment with its current x position in screen space. */
export interface ActiveSegment extends SegmentDescriptor {
  /** Leftmost x position of this segment in screen space. */
  xOffset: number;
}

export interface PlatformScrollSystem {
  /** Advance state by dt seconds. Pass frozen=true to pause scroll (win/loss). */
  tick: (dt: number, frozen: boolean) => void;
  /** Current visible segments. */
  getSegments: () => ActiveSegment[];
  /** Current scroll speed in px/s. */
  getScrollSpeed: () => number;
  /** Total distance scrolled (same as game state distance). */
  getDistance: () => number;
  /** Reset scroll system for a new level. */
  reset: (level: number) => void;
}

/** Build initial segments for a level, placed end-to-end starting at x=0. */
const buildSegments = (level: number): ActiveSegment[] => {
  const descriptors = generateLevel(level);
  let x = 0;
  return descriptors.map(seg => {
    const active: ActiveSegment = { ...seg, xOffset: x };
    x += seg.widthPx;
    return active;
  });
};

export const createPlatformScrollSystem = (initialLevel: number): PlatformScrollSystem => {
  let segments: ActiveSegment[] = buildSegments(initialLevel);
  let scrollSpeed = DASH_TUNING.SCROLL_SPEED;
  let distance = 0;
  let nextSpeedThreshold = DASH_TUNING.SPEED_INCREASE_INTERVAL;
  // Round-robin counter for deterministic segment recycling (no Math.random() — G9).
  let recycleIdx = 0;
  // Pre-computed descriptor list — cached to avoid per-frame allocation (G6).
  let cachedDescriptors: ReturnType<typeof generateLevel> = generateLevel(initialLevel);

  const tick = (dt: number, frozen: boolean): void => {
    if (frozen) return;

    const shift = scrollSpeed * dt;
    distance += shift;

    // Speed increase at each threshold
    while (distance >= nextSpeedThreshold) {
      scrollSpeed += DASH_TUNING.SPEED_INCREASE_AMOUNT;
      nextSpeedThreshold += DASH_TUNING.SPEED_INCREASE_INTERVAL;
    }

    // Scroll all segments left
    for (const seg of segments) {
      seg.xOffset -= shift;
    }

    // Recycle off-screen segments to the right using deterministic round-robin
    // over the level's seeded descriptor list. No Math.random() allowed in tick() (G9).
    // cachedDescriptors is pre-computed — no allocation per frame (G6).
    const rightEdge = segments.reduce((max, s) => Math.max(max, s.xOffset + s.widthPx), 0);
    for (const seg of segments) {
      if (seg.xOffset + seg.widthPx < 0) {
        const refill = cachedDescriptors[recycleIdx % cachedDescriptors.length];
        recycleIdx++;
        seg.type = refill.type;
        seg.widthPx = refill.widthPx;
        seg.obstacle = refill.obstacle;
        seg.xOffset = rightEdge;
      }
    }
  };

  const getSegments = (): ActiveSegment[] => segments;
  const getScrollSpeed = (): number => scrollSpeed;
  const getDistance = (): number => distance;

  const reset = (newLevel: number): void => {
    segments = buildSegments(newLevel);
    cachedDescriptors = generateLevel(newLevel);
    scrollSpeed = DASH_TUNING.SCROLL_SPEED;
    distance = 0;
    nextSpeedThreshold = DASH_TUNING.SPEED_INCREASE_INTERVAL;
    recycleIdx = 0;
  };

  return { tick, getSegments, getScrollSpeed, getDistance, reset };
};
