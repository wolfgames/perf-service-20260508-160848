/**
 * Dash Benchmark physics constants and difficulty configuration.
 *
 * All game logic reads tuning handles from here — never hardcode in logic files.
 */

export interface DifficultyTier {
  name: string;
  minLevel: number;
  maxLevel: number;
  /** Gap width range as a multiple of character width (48px) */
  gapRange: [number, number];
  /** Probability that any given non-gap segment has a spike */
  spikeFreq: number;
  /** Whether barriers (floating obstacles) appear in this tier */
  hasBarriers: boolean;
}

export interface DashTuning {
  /** Horizontal scroll speed in px/s */
  SCROLL_SPEED: number;
  /** Initial vertical velocity on jump (negative = upward) in px/s */
  JUMP_VELOCITY: number;
  /** Downward gravitational acceleration in px/s² */
  GRAVITY: number;
  /** Speed increase per distance milestone in px/s */
  SPEED_INCREASE_AMOUNT: number;
  /** Distance units between each speed increase */
  SPEED_INCREASE_INTERVAL: number;
  /** Difficulty tiers in ascending level order */
  TIERS: DifficultyTier[];
}

export const DASH_TUNING: DashTuning = {
  SCROLL_SPEED: 280,
  JUMP_VELOCITY: -520,
  GRAVITY: 1400,
  SPEED_INCREASE_AMOUNT: 5,
  SPEED_INCREASE_INTERVAL: 200,
  TIERS: [
    { name: 'Warm-up',  minLevel: 1,  maxLevel: 5,  gapRange: [1.0, 1.2], spikeFreq: 0.10, hasBarriers: false },
    { name: 'Standard', minLevel: 6,  maxLevel: 15, gapRange: [1.2, 1.6], spikeFreq: 0.20, hasBarriers: true  },
    { name: 'Advanced', minLevel: 16, maxLevel: 25, gapRange: [1.4, 1.8], spikeFreq: 0.30, hasBarriers: true  },
    { name: 'Expert',   minLevel: 26, maxLevel: Infinity, gapRange: [1.6, 2.0], spikeFreq: 0.40, hasBarriers: true },
  ],
};

/** Resolve the difficulty tier for a given level number. */
export const getTier = (level: number): DifficultyTier =>
  DASH_TUNING.TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) ??
  DASH_TUNING.TIERS[DASH_TUNING.TIERS.length - 1];
