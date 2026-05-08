/**
 * Platform renderer — translates PlatformScrollSystem state into Pixi display objects.
 * Gray rectangles for platforms, transparent (absent) for gaps.
 */

import { Container, Graphics } from 'pixi.js';
import type { ActiveSegment } from '../systems/PlatformScrollSystem';

/** Platform lane height in pixels. */
const LANE_HEIGHT = 274;
/** Y position of the platform base. */
const PLATFORM_BASE_Y = 506;
/** Platform color (#555566 — gray). */
const PLATFORM_COLOR = 0x555566;

export interface PlatformRenderer {
  init: (parent: Container) => void;
  update: (segments: ActiveSegment[]) => void;
  destroy: () => void;
}

export const createPlatformRenderer = (): PlatformRenderer => {
  const container = new Container();
  const segmentSprites: Map<number, Graphics> = new Map();

  const init = (parent: Container): void => {
    parent.addChild(container);
  };

  const getOrCreate = (id: number): Graphics => {
    const existing = segmentSprites.get(id);
    if (existing) return existing;
    const g = new Graphics();
    segmentSprites.set(id, g);
    container.addChild(g);
    return g;
  };

  const update = (segments: ActiveSegment[]): void => {
    const activeIds = new Set<number>();

    segments.forEach((seg, i) => {
      if (seg.type === 'gap') {
        // No visual for gap segments
        return;
      }
      activeIds.add(i);
      const g = getOrCreate(i);
      g.clear();
      g.rect(0, 0, seg.widthPx, LANE_HEIGHT).fill(PLATFORM_COLOR);
      g.x = seg.xOffset;
      g.y = PLATFORM_BASE_Y;
    });

    // Hide inactive (gap) sprites
    for (const [id, g] of segmentSprites) {
      if (!activeIds.has(id)) {
        g.clear();
      }
    }
  };

  const destroy = (): void => {
    for (const g of segmentSprites.values()) {
      g.destroy({ children: true });
    }
    segmentSprites.clear();
    container.destroy({ children: true });
  };

  return { init, update, destroy };
};
