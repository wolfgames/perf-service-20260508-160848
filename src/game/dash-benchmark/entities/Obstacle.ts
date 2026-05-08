/**
 * Obstacle type definitions and placement constants.
 * No Pixi imports — pure data types and position helpers.
 */

import { DASH_TUNING } from '../tuning';

export type ObstacleKind = 'spike' | 'barrier';

/** Platform base Y coordinate (60% of 844). */
export const PLATFORM_BASE_Y = 506;

export const SPIKE_WIDTH = 24;
export const SPIKE_HEIGHT = 20;

export const BARRIER_WIDTH = 12;
export const BARRIER_HEIGHT = 40;

/** Minimum vertical clearance between the barrier bottom and the peak jump apex. */
export const BARRIER_CLEARANCE = 8;

/** Compute the max jump height in pixels from tuning constants. */
const maxJumpHeightPx = (): number =>
  Math.abs(DASH_TUNING.JUMP_VELOCITY) ** 2 / (2 * DASH_TUNING.GRAVITY);

/**
 * Compute the Y position (top-left) of an obstacle on screen.
 * Spikes sit flush on the platform surface.
 * Barriers are placed above the maximum jump apex with BARRIER_CLEARANCE.
 */
export const getObstacleY = (kind: ObstacleKind): number => {
  if (kind === 'spike') {
    return PLATFORM_BASE_Y - SPIKE_HEIGHT;
  }
  // Barrier: top edge must be above apex - clearance
  const apexY = PLATFORM_BASE_Y - maxJumpHeightPx();
  return apexY - BARRIER_CLEARANCE - BARRIER_HEIGHT;
};

export interface ObstacleBounds {
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
}
