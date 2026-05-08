import { createSignal, createRoot } from 'solid-js';
import type { BoardState } from './types';
import { DASH_TUNING } from '../tuning';

/** Player-facing heading shown on the loss results screen. */
export const LOSS_HEADING = 'Oops! Try Again?';
/** Player-facing heading shown on the win results screen. */
export const WIN_HEADING = 'Level Complete!';

/**
 * Distance-based scoring for Dash Benchmark.
 * Two multiplicative dimensions: distance × speed multiplier.
 */
export const computeLevelScore = (distanceTravelled: number, currentScrollSpeed: number): number =>
  Math.floor(distanceTravelled * (currentScrollSpeed / DASH_TUNING.SCROLL_SPEED));

/** Goal distance for a given level (grows with level to provide progression). */
const goalForLevel = (level: number): number => 200 + (level - 1) * 50;

export interface GameStateDash {
  distance: () => number;
  goal: () => number;
  boardState: () => BoardState;
  scrollSpeed: () => number;
  levelScore: () => number;

  /** Advance distance by scrollSpeed * dt; clamps when Won/Lost. */
  stepDistance: (dt: number) => void;
  /** Trigger the Won transition and compute final score. */
  setWon: () => void;
  /** Trigger the Lost transition. */
  setLost: () => void;
  /** Increase scroll speed by the configured amount. */
  incrementScrollSpeed: () => void;
  /** Set scroll speed to an explicit value (used to freeze on win). */
  setScrollSpeed: (speed: number) => void;
  /** Reset all state for a new level run. */
  reset: (level: number) => void;
}

function createGameStateDash(): GameStateDash {
  const [distance, setDistance] = createSignal(0);
  const [goal, setGoal] = createSignal(200);
  const [boardState, setBoardState] = createSignal<BoardState>('Idle');
  const [scrollSpeed, setScrollSpeedSignal] = createSignal(DASH_TUNING.SCROLL_SPEED);
  const [levelScore, setLevelScore] = createSignal(0);

  const stepDistance = (dt: number): void => {
    if (boardState() !== 'Idle' && boardState() !== 'Jumping' && boardState() !== 'Falling') return;
    const next = distance() + scrollSpeed() * dt;
    setDistance(next);
    if (next >= goal()) setWon();
  };

  const setWon = (): void => {
    setLevelScore(computeLevelScore(distance(), scrollSpeed()));
    setBoardState('Won');
  };

  const setLost = (): void => {
    setBoardState('Lost');
  };

  const incrementScrollSpeed = (): void => {
    setScrollSpeedSignal(s => s + DASH_TUNING.SPEED_INCREASE_AMOUNT);
  };

  const setScrollSpeed = (speed: number): void => {
    setScrollSpeedSignal(speed);
  };

  const reset = (level: number): void => {
    setDistance(0);
    setGoal(goalForLevel(level));
    setBoardState('Idle');
    setScrollSpeedSignal(DASH_TUNING.SCROLL_SPEED);
    setLevelScore(0);
  };

  return {
    distance,
    goal,
    boardState,
    scrollSpeed,
    levelScore,
    stepDistance,
    setWon,
    setLost,
    incrementScrollSpeed,
    setScrollSpeed,
    reset,
  };
}

export { createGameStateDash };

/** Singleton for use across the game. */
export const dashGameState = createRoot(createGameStateDash);
