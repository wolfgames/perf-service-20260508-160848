/**
 * HUD renderer — displays the real-time distance counter in the top-left.
 * Stays within the 40px HUD band; never overlaps the platform lane.
 */

import { Container, Text } from 'pixi.js';

/** Font size for the distance counter. ≥ 18px per UX guidelines. */
export const HUD_FONT_SIZE = 24;

export interface HudRenderer {
  init: (parent: Container, viewportW: number, viewportH: number) => void;
  update: (distance: number) => void;
  /** Expose text node for testing. */
  getText: () => { text: string; y: number; height: number };
  destroy: () => void;
}

export const createHudRenderer = (): HudRenderer => {
  let text: InstanceType<typeof Text> | null = null;

  const init = (parent: Container, _viewportW: number, _viewportH: number): void => {
    text = new Text({
      text: '0',
      style: {
        fontSize: HUD_FONT_SIZE,
        fontFamily: 'system-ui, sans-serif',
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.x = 8;
    text.y = 8;
    parent.addChild(text);
  };

  const update = (distance: number): void => {
    if (!text) return;
    text.text = String(Math.floor(distance));
  };

  const getText = () => ({
    get text() { return text?.text ?? ''; },
    set text(v: string) { if (text) text.text = v; },
    y: text?.y ?? 8,
    height: text?.height ?? HUD_FONT_SIZE,
  });

  const destroy = (): void => {
    text?.destroy();
    text = null;
  };

  return { init, update, getText, destroy };
};
