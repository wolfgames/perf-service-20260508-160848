/**
 * Distance HUD renderer tests.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('pixi.js', () => ({
  Text: vi.fn().mockImplementation(() => ({
    text: '',
    style: { fontSize: 24 },
    x: 8,
    y: 8,
    height: 24,
    destroy: vi.fn(),
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    destroy: vi.fn(),
  })),
}));

import { createHudRenderer, HUD_FONT_SIZE } from '~/game/dash-benchmark/renderers/HudRenderer';

describe('dash-benchmark: distance HUD', () => {
  it('HUD text shows current distance each frame', () => {
    const renderer = createHudRenderer();
    renderer.init({ addChild: vi.fn() } as never, 390, 844);
    renderer.update(123.7);
    const text = renderer.getText();
    expect(text.text).toBe('123');
  });

  it('HUD text font is at least 18px', () => {
    expect(HUD_FONT_SIZE).toBeGreaterThanOrEqual(18);
  });

  it('HUD y position is within 0-40px band (no platform overlap)', () => {
    const renderer = createHudRenderer();
    renderer.init({ addChild: vi.fn() } as never, 390, 844);
    const text = renderer.getText();
    expect(text.y).toBeGreaterThanOrEqual(0);
    expect(text.y + text.height).toBeLessThanOrEqual(40);
  });
});
