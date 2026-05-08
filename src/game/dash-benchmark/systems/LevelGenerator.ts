/**
 * Procedural level generator with seeded RNG and solvability validation.
 * No Pixi imports, no Math.random(), no DOM reads.
 */

import { DASH_TUNING, getTier } from '../tuning';

/** Character width in pixels (also the unit for gap sizing). */
const CHARACTER_WIDTH = 48;

/** Segments per level pass. */
const SEGMENTS_PER_LEVEL = 5;

/** Max regeneration attempts before returning the hardcoded fallback. */
const MAX_RETRIES = 10;

export type ObstacleType = 'spike' | 'barrier';

export interface ObstacleDef {
  type: ObstacleType;
  /** X offset within the segment (pixels from segment start). */
  xOffset: number;
}

export interface SegmentDescriptor {
  type: 'platform' | 'gap';
  /** Width of the segment in pixels. A platform spans a full screen width share. */
  widthPx: number;
  obstacle: ObstacleDef | null;
}

// ─── Seeded RNG ──────────────────────────────────────────────────────────────

/** mulberry32 — deterministic 32-bit LCG, suitable for seeded game RNG. */
const seededRng = (seed: number) => {
  let s = seed >>> 0;
  return (): number => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
};

/** Compute seed from level number per spec: level * 48271. */
const seedForLevel = (level: number): number => level * 48271;

// ─── Solvability ─────────────────────────────────────────────────────────────

const jumpDurationS = (2 * Math.abs(DASH_TUNING.JUMP_VELOCITY)) / DASH_TUNING.GRAVITY;
const maxSolvableGapPx = DASH_TUNING.SCROLL_SPEED * jumpDurationS;

const isSolvable = (segments: SegmentDescriptor[]): boolean =>
  segments.every(s => s.type !== 'gap' || s.widthPx < maxSolvableGapPx);

// ─── Fallback ────────────────────────────────────────────────────────────────

/** Hardcoded safe layout returned after MAX_RETRIES exhausted. */
export const generateFallback = (): SegmentDescriptor[] => {
  const base: SegmentDescriptor = { type: 'platform', widthPx: CHARACTER_WIDTH * 4, obstacle: null };
  const segments: SegmentDescriptor[] = Array.from({ length: SEGMENTS_PER_LEVEL }, () => ({ ...base }));
  segments[2] = { type: 'platform', widthPx: CHARACTER_WIDTH * 4, obstacle: { type: 'spike', xOffset: CHARACTER_WIDTH } };
  return segments;
};

// ─── Generator ───────────────────────────────────────────────────────────────

const tryGenerateLevel = (level: number, rng: () => number): SegmentDescriptor[] | null => {
  const tier = getTier(level);
  const segments: SegmentDescriptor[] = [];

  // Segment 0 is always a safe platform
  segments.push({ type: 'platform', widthPx: CHARACTER_WIDTH * 4, obstacle: null });

  for (let i = 1; i < SEGMENTS_PER_LEVEL; i++) {
    const prevIsGap = segments[i - 1]?.type === 'gap';

    // No adjacent gaps
    const canBeGap = !prevIsGap && i < SEGMENTS_PER_LEVEL - 1;
    const isGap = canBeGap && rng() < 0.2; // ~20% chance of gap in eligible slots

    if (isGap) {
      const [minMult, maxMult] = tier.gapRange;
      const widthPx = (minMult + rng() * (maxMult - minMult)) * CHARACTER_WIDTH;
      segments.push({ type: 'gap', widthPx, obstacle: null });
      continue;
    }

    // Obstacle placement — mutually exclusive; respects tier frequency
    let obstacle: ObstacleDef | null = null;
    if (i >= 2) {
      // Single roll determines obstacle type
      const roll = rng();
      if (tier.hasBarriers && roll < 0.08) {
        // Barrier (rarer than spike)
        obstacle = { type: 'barrier', xOffset: CHARACTER_WIDTH * (0.5 + rng()) };
      } else if (roll < 0.08 + tier.spikeFreq) {
        obstacle = { type: 'spike', xOffset: CHARACTER_WIDTH * (0.5 + rng()) };
      }
    }

    segments.push({ type: 'platform', widthPx: CHARACTER_WIDTH * 4, obstacle });
  }

  return isSolvable(segments) ? segments : null;
};

/**
 * Generate a deterministic, solvable level layout.
 * Returns the hardcoded fallback if all retries are exhausted.
 */
export const generateLevel = (level: number): SegmentDescriptor[] => {
  const rng = seededRng(seedForLevel(level));

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const result = tryGenerateLevel(level, rng);
    if (result) return result;
  }

  return generateFallback();
};
