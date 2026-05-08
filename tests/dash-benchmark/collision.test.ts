/**
 * Collision detection tests.
 */
import { describe, it, expect } from 'vitest';
import { checkBoundingBoxCollision, isCharacterLost } from '~/game/dash-benchmark/systems/CollisionSystem';
import type { Bounds } from '~/game/dash-benchmark/systems/CollisionSystem';

describe('dash-benchmark: collision detection', () => {
  it('transitions to Lost on character-obstacle bounding box overlap', () => {
    const char: Bounds = { x: 50, y: 460, width: 48, height: 48 };
    const obstacle: Bounds = { x: 70, y: 470, width: 24, height: 20 };
    expect(checkBoundingBoxCollision(char, obstacle)).toBe(true);
  });

  it('transitions to Lost on gap fall below viewport bottom', () => {
    expect(isCharacterLost({ movementState: 'Lost', y: 900, velocityY: 50 })).toBe(true);
    expect(isCharacterLost({ movementState: 'Idle', y: 506, velocityY: 0 })).toBe(false);
  });
});
