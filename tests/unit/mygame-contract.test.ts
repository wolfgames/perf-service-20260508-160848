/**
 * mygame contract validation.
 *
 * Ensures the mygame module exports functions that satisfy
 * the contract types required by the scaffold screens.
 */

import { describe, it, expect, vi } from 'vitest';

// pixi.js uses browser globals (navigator) — mock it for the node test environment
vi.mock('pixi.js', () => ({
  Application: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    stage: { addChild: vi.fn(), eventMode: '', on: vi.fn(), off: vi.fn() },
    screen: { width: 390, height: 844 },
    ticker: { add: vi.fn() },
    canvas: {},
    destroy: vi.fn(),
  })),
  Container: vi.fn().mockImplementation(() => ({ eventMode: '', addChild: vi.fn() })),
  Graphics: vi.fn().mockImplementation(() => ({
    rect: vi.fn().mockReturnThis(), fill: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(), destroy: vi.fn(), alpha: 0, x: 0, y: 0,
  })),
  Text: vi.fn().mockImplementation(() => ({ text: '', x: 0, y: 0, height: 20, destroy: vi.fn() })),
}));

vi.mock('@wolfgames/components/solid', () => ({
  Spinner: () => null,
  ProgressBar: () => null,
  useSignal: (s: { get: () => unknown }) => s.get,
}));

vi.mock('solid-js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('solid-js')>();
  return { ...actual };
});

import { setupGame, setupStartScreen } from '~/game/mygame';
import type { SetupGame, SetupStartScreen } from '~/game/mygame-contract';

describe('mygame contract', () => {
  it('exports setupGame matching SetupGame signature', () => {
    expect(typeof setupGame).toBe('function');

    const _typeCheck: SetupGame = setupGame;
    expect(_typeCheck).toBe(setupGame);
  });

  it('exports setupStartScreen matching SetupStartScreen signature', () => {
    expect(typeof setupStartScreen).toBe('function');

    const _typeCheck: SetupStartScreen = setupStartScreen;
    expect(_typeCheck).toBe(setupStartScreen);
  });
});
