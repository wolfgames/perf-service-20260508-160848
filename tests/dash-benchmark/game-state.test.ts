import { describe, it, expect, beforeEach } from 'vitest';
import { createGameStateDash, type GameStateDash } from '~/game/dash-benchmark/state/gameState';
import { DASH_TUNING } from '~/game/dash-benchmark/tuning';

describe('dash-benchmark: game state', () => {
  let state: GameStateDash;

  beforeEach(() => {
    state = createGameStateDash();
    state.reset(1);
  });

  it('initializes distance=0 goal=200 boardState=Idle scrollSpeed=280', () => {
    expect(state.distance()).toBe(0);
    expect(state.goal()).toBe(200);
    expect(state.boardState()).toBe('Idle');
    expect(state.scrollSpeed()).toBe(DASH_TUNING.SCROLL_SPEED);
  });

  it('increments distance each frame step by scrollSpeed * deltaTime', () => {
    state.stepDistance(0.1);
    expect(state.distance()).toBeCloseTo(28, 5);
  });

  it('transitions to Won when distance reaches goal', () => {
    state.stepDistance(1.0); // 280 units — exceeds goal of 200
    expect(state.boardState()).toBe('Won');
  });

  it('stops incrementing after Won or Lost', () => {
    state.stepDistance(1.0); // transitions to Won
    const distAfterWon = state.distance();
    state.stepDistance(0.1);
    expect(state.distance()).toBe(distAfterWon);

    state.reset(1);
    state.setLost();
    state.stepDistance(0.1);
    expect(state.distance()).toBe(0);
  });
});
