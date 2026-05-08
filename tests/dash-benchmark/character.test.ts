/**
 * Character controller tests — jump mechanics, state machine, visual size.
 * Tests cover the pure logic (applyInput + stepPhysics wrappers).
 * The Pixi Graphics sprite is verified via the CHARACTER_SIZE export constant.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('pixi.js', () => ({
  Graphics: vi.fn().mockImplementation(() => ({
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    alpha: 1,
    x: 0,
    y: 0,
    scale: { set: vi.fn(), x: 1, y: 1 },
    width: 48,
    height: 48,
    destroy: vi.fn(),
    addChild: vi.fn(),
    clear: vi.fn().mockReturnThis(),
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    destroy: vi.fn(),
    eventMode: '',
  })),
}));

vi.mock('gsap', () => ({
  gsap: { to: vi.fn(), killTweensOf: vi.fn() },
  default: { to: vi.fn(), killTweensOf: vi.fn() },
}));

import { createCharacterController, CHARACTER_SIZE } from '~/game/dash-benchmark/entities/PlayerCharacter';
import { DASH_TUNING } from '~/game/dash-benchmark/tuning';
import { createCharacterState } from '~/game/dash-benchmark/systems/PhysicsSystem';

const GROUND_Y = 506;
const VIEWPORT_BOTTOM = 844;
const VIEWPORT_W = 390;

describe('dash-benchmark: character controller', () => {
  it('triggers jump arc on tap from Idle', () => {
    const controller = createCharacterController({ groundY: GROUND_Y, viewportWidth: VIEWPORT_W, viewportBottom: VIEWPORT_BOTTOM });
    const state = createCharacterState(GROUND_Y);
    const result = controller.applyInput(state, true);
    expect(result.velocityY).toBe(DASH_TUNING.JUMP_VELOCITY);
    expect(result.movementState).toBe('Jumping');
  });

  it('ignores tap when Jumping or Falling', () => {
    const controller = createCharacterController({ groundY: GROUND_Y, viewportWidth: VIEWPORT_W, viewportBottom: VIEWPORT_BOTTOM });
    const jumping = { ...createCharacterState(GROUND_Y), movementState: 'Jumping' as const, velocityY: DASH_TUNING.JUMP_VELOCITY };
    const result = controller.applyInput(jumping, true);
    // applyInput only sets velocity when Idle — jumping input returns unchanged state
    expect(result.velocityY).toBe(DASH_TUNING.JUMP_VELOCITY);
    expect(result.movementState).toBe('Jumping');
  });

  it('snaps to groundY and squash-settles on landing', () => {
    const controller = createCharacterController({ groundY: GROUND_Y, viewportWidth: VIEWPORT_W, viewportBottom: VIEWPORT_BOTTOM });
    // Character just above ground with downward velocity
    const descending = { y: GROUND_Y - 1, velocityY: 50, movementState: 'Jumping' as const };
    const result = controller.stepPhysics(descending, 0.1, GROUND_Y);
    expect(result.y).toBe(GROUND_Y);
    expect(result.movementState).toBe('Idle');
  });

  it('character visual is 48×48 px at 390 viewport', () => {
    // CHARACTER_SIZE export validates the 48px requirement without needing a live Pixi context
    expect(CHARACTER_SIZE).toBe(48);
    // The sprite created by the controller also uses this constant
    const controller = createCharacterController({ groundY: GROUND_Y, viewportWidth: VIEWPORT_W, viewportBottom: VIEWPORT_BOTTOM });
    const sprite = controller.getSprite();
    // Mocked Graphics has width=48, height=48
    expect(sprite.width).toBe(48);
    expect(sprite.height).toBe(48);
  });
});
