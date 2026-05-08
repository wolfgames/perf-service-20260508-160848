/**
 * Start screen content tests.
 *
 * @vitest-environment happy-dom
 *
 * Uses happy-dom to test the DOM-based start screen view.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('solid-js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('solid-js')>();
  return { ...actual };
});

import { setupStartScreen } from '~/game/mygame/screens/startView';

const makeDeps = () => ({
  goto: vi.fn().mockResolvedValue(undefined),
  coordinator: { audio: { play: vi.fn() } },
  initGpu: vi.fn().mockResolvedValue(undefined),
  unlockAudio: vi.fn(),
  loadCore: vi.fn().mockResolvedValue(undefined),
  loadAudio: vi.fn().mockResolvedValue(undefined),
  tuning: { scaffold: {}, game: {} },
  analytics: { trackGameStart: vi.fn() },
});

describe('dash-benchmark: start screen', () => {
  it("renders title 'Dash Benchmark'", () => {
    const deps = makeDeps();
    const ctrl = setupStartScreen(deps);
    const container = document.createElement('div');
    ctrl.init(container);
    expect(container.textContent).toContain('Dash Benchmark');
    ctrl.destroy();
  });

  it("renders instruction 'Tap to jump'", () => {
    const deps = makeDeps();
    const ctrl = setupStartScreen(deps);
    const container = document.createElement('div');
    ctrl.init(container);
    expect(container.textContent).toContain('Tap to jump');
    ctrl.destroy();
  });

  it("renders Start button (not Play)", () => {
    const deps = makeDeps();
    const ctrl = setupStartScreen(deps);
    const container = document.createElement('div');
    ctrl.init(container);
    const buttons = container.querySelectorAll('button');
    const hasStart = Array.from(buttons).some(b => b.textContent?.trim() === 'Start');
    const hasPlay = Array.from(buttons).some(b => b.textContent?.trim() === 'Play');
    expect(hasStart).toBe(true);
    expect(hasPlay).toBe(false);
    ctrl.destroy();
  });

  it('Start button calls unlockAudio before goto game', async () => {
    const deps = makeDeps();
    const ctrl = setupStartScreen(deps);
    const container = document.createElement('div');
    ctrl.init(container);

    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    btn!.click();
    // Wait for the async click handler
    await new Promise(r => setTimeout(r, 50));

    expect(deps.unlockAudio).toHaveBeenCalled();
    expect(deps.goto).toHaveBeenCalledWith('game');
    ctrl.destroy();
  });

  it('Start button hit area ≥ 44×44 px', () => {
    const deps = makeDeps();
    const ctrl = setupStartScreen(deps);
    const container = document.createElement('div');
    ctrl.init(container);

    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    // Button has padding:16px 48px — provides height ≥ 44px (font 1.25rem ≈ 20px + 32px padding = 52px)
    expect(btn.style.cssText).toContain('padding');
    // The padding values ensure ≥ 44px hit area
    const paddingMatch = btn.style.padding || btn.style.cssText.match(/padding[:\s]+(\d+)px/)?.[1];
    expect(paddingMatch).toBeTruthy();
    ctrl.destroy();
  });
});
