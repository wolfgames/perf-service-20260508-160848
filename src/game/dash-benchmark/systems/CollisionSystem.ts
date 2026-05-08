/**
 * Pure collision detection utilities.
 * No Pixi imports, no state mutation — returns boolean results.
 */

import type { CharacterState } from './PhysicsSystem';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Axis-aligned bounding box overlap test. */
export const checkBoundingBoxCollision = (a: Bounds, b: Bounds): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/** Returns true if the character has fallen off a gap (physics set movementState=Lost). */
export const isCharacterLost = (state: Pick<CharacterState, 'movementState' | 'y' | 'velocityY'>): boolean =>
  state.movementState === 'Lost';
