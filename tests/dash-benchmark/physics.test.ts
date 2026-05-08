import { describe, it, expect } from 'vitest';
import { stepPhysics, createCharacterState, type CharacterState } from '~/game/dash-benchmark/systems/PhysicsSystem';
import { DASH_TUNING } from '~/game/dash-benchmark/tuning';

const GROUND_Y = 506;
const VIEWPORT_BOTTOM = 844;

describe('dash-benchmark: physics system', () => {
  it('sets velocityY to JUMP_VELOCITY on jump from Idle', () => {
    const state: CharacterState = createCharacterState(GROUND_Y);
    // Gravity is applied in the same tick after jump, so velocity = JUMP_VELOCITY + GRAVITY * dt
    const dt = 0.016;
    const next = stepPhysics(state, dt, GROUND_Y, VIEWPORT_BOTTOM, true);
    expect(next.velocityY).toBeCloseTo(DASH_TUNING.JUMP_VELOCITY + DASH_TUNING.GRAVITY * dt, 5);
    expect(next.movementState).toBe('Jumping');
  });

  it('ignores double-jump when Jumping', () => {
    const dt = 0.016;
    // Character in mid-air, high up so it can't land
    const jumping: CharacterState = { ...createCharacterState(GROUND_Y), movementState: 'Jumping', velocityY: DASH_TUNING.JUMP_VELOCITY, y: GROUND_Y - 200 };
    const next = stepPhysics(jumping, dt, GROUND_Y, VIEWPORT_BOTTOM, true);
    // Jump input ignored; velocity continues with gravity only
    expect(next.velocityY).toBeCloseTo(DASH_TUNING.JUMP_VELOCITY + DASH_TUNING.GRAVITY * dt, 5);
    expect(next.movementState).toBe('Jumping');
  });

  it('applies gravity to velocityY each step', () => {
    const jumping: CharacterState = { ...createCharacterState(GROUND_Y), movementState: 'Jumping', velocityY: DASH_TUNING.JUMP_VELOCITY, y: GROUND_Y - 100 };
    const dt = 0.016;
    const next = stepPhysics(jumping, dt, GROUND_Y, VIEWPORT_BOTTOM, false);
    expect(next.velocityY).toBeCloseTo(DASH_TUNING.JUMP_VELOCITY + DASH_TUNING.GRAVITY * dt, 5);
  });

  it('clamps to ground and resets to Idle on landing', () => {
    // Character at groundY - 1 with positive velocityY (descending)
    const descending: CharacterState = { ...createCharacterState(GROUND_Y), movementState: 'Jumping', velocityY: 50, y: GROUND_Y - 1 };
    const next = stepPhysics(descending, 0.1, GROUND_Y, VIEWPORT_BOTTOM, false);
    expect(next.y).toBe(GROUND_Y);
    expect(next.velocityY).toBe(0);
    expect(next.movementState).toBe('Idle');
  });

  it('transitions to Lost when falling below viewport bottom', () => {
    // Character past viewport bottom — groundY not present (gap)
    const falling: CharacterState = { ...createCharacterState(GROUND_Y), movementState: 'Jumping', velocityY: 100, y: VIEWPORT_BOTTOM + 1 };
    const next = stepPhysics(falling, 0.016, null, VIEWPORT_BOTTOM, false);
    expect(next.movementState).toBe('Lost');
  });
});
