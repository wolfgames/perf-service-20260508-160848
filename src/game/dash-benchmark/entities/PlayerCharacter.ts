/**
 * Player character entity — visual representation + input handling wrapper.
 * Composes CharacterState (pure data) with a Pixi Graphics sprite.
 */

import { Graphics } from 'pixi.js';
import type { CharacterState } from '../systems/PhysicsSystem';
import { stepPhysics } from '../systems/PhysicsSystem';
import { DASH_TUNING } from '../tuning';
import type { MovementState } from '../state/types';

/** Character visual size in pixels. Satisfies cos-canvas 48px minimum. */
export const CHARACTER_SIZE = 48;

/** Character orange color (#E87A0B). */
const CHARACTER_COLOR = 0xe87a0b;

export interface CharacterController {
  /** Apply jump input and return immediate state change (velocity set, no physics step). */
  applyInput: (state: CharacterState, jumpPressed: boolean) => CharacterState;
  /** Step physics for one frame. Pass groundY=null when over a gap. */
  stepPhysics: (state: CharacterState, dt: number, groundY: number | null) => CharacterState;
  /** The Pixi sprite for adding to the stage. */
  getSprite: () => Graphics;
  /** Sync sprite position + trigger landing squash animation. */
  syncSprite: (state: CharacterState, prevState: CharacterState) => void;
  /** Clean up tweens and destroy the sprite. */
  destroy: () => void;
}

export interface CharacterControllerOptions {
  groundY: number;
  viewportWidth: number;
  viewportBottom: number;
}

export const createCharacterController = ({
  groundY,
  viewportWidth,
  viewportBottom,
}: CharacterControllerOptions): CharacterController => {
  const sprite = new Graphics();
  sprite.rect(0, 0, CHARACTER_SIZE, CHARACTER_SIZE).fill(CHARACTER_COLOR);
  // Anchor at bottom-left → position.y = groundY - CHARACTER_SIZE when on ground
  sprite.x = viewportWidth * 0.25;

  const applyInput = (state: CharacterState, jumpPressed: boolean): CharacterState => {
    if (!jumpPressed || state.movementState !== 'Idle') return state;
    return { ...state, velocityY: DASH_TUNING.JUMP_VELOCITY, movementState: 'Jumping' as MovementState };
  };

  const step = (state: CharacterState, dt: number, groundY: number | null): CharacterState =>
    stepPhysics(state, dt, groundY, viewportBottom, false);

  const syncSprite = (state: CharacterState, prevState: CharacterState): void => {
    sprite.y = state.y - CHARACTER_SIZE;

    // Squash on landing
    if (prevState.movementState !== 'Idle' && state.movementState === 'Idle') {
      import('gsap').then(({ gsap }) => {
        gsap.killTweensOf(sprite.scale);
        gsap.to(sprite.scale, {
          y: 0.8,
          duration: 0.04,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        });
      }).catch(() => { /* gsap optional in tests */ });
    }
  };

  const destroy = (): void => {
    import('gsap').then(({ gsap }) => {
      gsap.killTweensOf(sprite.scale);
    }).catch(() => { /* no-op */ });
    sprite.destroy({ children: true });
  };

  return { applyInput, stepPhysics: step, getSprite: () => sprite, syncSprite, destroy };
};
