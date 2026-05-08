/**
 * Pure physics step for the player character.
 * No Pixi imports, no Math.random(), no DOM reads.
 * All state flows in, new state flows out.
 */

import type { MovementState } from '../state/types';
import { DASH_TUNING } from '../tuning';

export interface CharacterState {
  /** Vertical position in pixels (increases downward). */
  y: number;
  /** Vertical velocity in px/s (negative = upward). */
  velocityY: number;
  /** Current movement FSM state. */
  movementState: MovementState;
}

export const createCharacterState = (groundY: number): CharacterState => ({
  y: groundY,
  velocityY: 0,
  movementState: 'Idle',
});

/**
 * Advance physics by one frame.
 *
 * @param state         Current character state
 * @param dt            Delta time in seconds
 * @param groundY       Y position of the ground surface, or null when over a gap
 * @param viewportBottom Bottom edge of the viewport in pixels
 * @param jumpPressed   Whether a jump input was received this frame
 */
export const stepPhysics = (
  state: CharacterState,
  dt: number,
  groundY: number | null,
  viewportBottom: number,
  jumpPressed: boolean,
): CharacterState => {
  let { y, velocityY, movementState } = state;

  // Already terminal — no further physics
  if (movementState === 'Lost') return state;

  // Jump input: only from Idle
  if (jumpPressed && movementState === 'Idle') {
    velocityY = DASH_TUNING.JUMP_VELOCITY;
    movementState = 'Jumping';
  }

  // Apply gravity when airborne
  if (movementState !== 'Idle') {
    velocityY += DASH_TUNING.GRAVITY * dt;
    y += velocityY * dt;
  }

  // Landing check
  if (groundY !== null && y >= groundY && velocityY >= 0) {
    y = groundY;
    velocityY = 0;
    movementState = 'Idle';
    return { y, velocityY, movementState };
  }

  // Gap-fall check
  if (y > viewportBottom) {
    return { y, velocityY, movementState: 'Lost' };
  }

  return { y, velocityY, movementState };
};
