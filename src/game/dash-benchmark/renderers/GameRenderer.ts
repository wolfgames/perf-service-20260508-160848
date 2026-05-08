/**
 * GameRenderer — owns the flash effect overlay and coordinates
 * screen-level visual events (loss flash, win transitions).
 */

import { Container, Graphics } from 'pixi.js';
import { gsap } from 'gsap';

export interface GameRenderer {
  init: (uiLayer: Container, width: number, height: number) => void;
  playLossFlash: () => Promise<void>;
  destroy: () => void;
}

export const createGameRenderer = (): GameRenderer => {
  let flashRect: Graphics | null = null;

  const init = (uiLayer: Container, width: number, height: number): void => {
    flashRect = new Graphics();
    flashRect.rect(0, 0, width, height).fill(0xffffff);
    flashRect.alpha = 0;
    uiLayer.addChild(flashRect);
  };

  const playLossFlash = (): Promise<void> =>
    new Promise(resolve => {
      if (!flashRect) { resolve(); return; }
      gsap.killTweensOf(flashRect);
      gsap.to(flashRect, {
        alpha: 0.6,
        duration: 0.05,
        ease: 'power1.in',
        onComplete: () => {
          gsap.to(flashRect!, {
            alpha: 0,
            duration: 0.05,
            ease: 'power1.out',
            onComplete: resolve,
          });
        },
      });
    });

  const destroy = (): void => {
    if (flashRect) {
      gsap.killTweensOf(flashRect);
      flashRect.parent?.removeChild(flashRect);
      flashRect.destroy({ children: true });
      flashRect = null;
    }
  };

  return { init, playLossFlash, destroy };
};
