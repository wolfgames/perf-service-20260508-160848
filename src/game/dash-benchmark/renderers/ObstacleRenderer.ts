/**
 * Obstacle renderer — draws spikes (red triangles) and barriers (purple rects).
 * Colors chosen to be visually distinct from platform (gray) and character (orange).
 */

import { Container, Graphics } from 'pixi.js';
import type { ActiveSegment } from '../systems/PlatformScrollSystem';
import {
  SPIKE_WIDTH,
  SPIKE_HEIGHT,
  BARRIER_WIDTH,
  BARRIER_HEIGHT,
  getObstacleY,
  PLATFORM_BASE_Y,
} from '../entities/Obstacle';

const SPIKE_COLOR = 0xcc2200;   // red
const BARRIER_COLOR = 0x7700cc; // purple

export interface ObstacleRenderer {
  init: (parent: Container) => void;
  update: (segments: ActiveSegment[]) => void;
  destroy: () => void;
}

export const createObstacleRenderer = (): ObstacleRenderer => {
  const container = new Container();
  const sprites: Map<string, Graphics> = new Map();

  const init = (parent: Container): void => {
    parent.addChild(container);
  };

  const key = (segIdx: number): string => `obs-${segIdx}`;

  const getOrCreate = (k: string): Graphics => {
    const existing = sprites.get(k);
    if (existing) return existing;
    const g = new Graphics();
    sprites.set(k, g);
    container.addChild(g);
    return g;
  };

  const update = (segments: ActiveSegment[]): void => {
    const activeKeys = new Set<string>();

    segments.forEach((seg, i) => {
      if (!seg.obstacle) return;
      const k = key(i);
      activeKeys.add(k);
      const g = getOrCreate(k);
      g.clear();

      const obX = seg.xOffset + seg.obstacle.xOffset;

      if (seg.obstacle.type === 'spike') {
        const y = getObstacleY('spike');
        // Triangle: base at bottom, apex at top
        g.poly([
          obX + SPIKE_WIDTH / 2, y,
          obX, y + SPIKE_HEIGHT,
          obX + SPIKE_WIDTH, y + SPIKE_HEIGHT,
        ]).fill(SPIKE_COLOR);
      } else {
        const y = getObstacleY('barrier');
        g.rect(obX, y, BARRIER_WIDTH, BARRIER_HEIGHT).fill(BARRIER_COLOR);
      }
    });

    // Clear unused obstacle sprites
    for (const [k, g] of sprites) {
      if (!activeKeys.has(k)) {
        g.clear();
      }
    }
  };

  const destroy = (): void => {
    for (const g of sprites.values()) {
      g.destroy({ children: true });
    }
    sprites.clear();
    container.destroy({ children: true });
  };

  return { init, update, destroy };
};
