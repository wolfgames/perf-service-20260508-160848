/**
 * Character renderer — mounts the character sprite into the scene graph
 * and delegates physics sync to the PlayerCharacter entity.
 */

import { Container } from 'pixi.js';
import type { CharacterController } from '../entities/PlayerCharacter';
import type { CharacterState } from '../systems/PhysicsSystem';

export interface CharacterRenderer {
  init: (parent: Container) => void;
  update: (state: CharacterState, prevState: CharacterState) => void;
  destroy: () => void;
}

export const createCharacterRenderer = (controller: CharacterController): CharacterRenderer => {
  const init = (parent: Container): void => {
    parent.addChild(controller.getSprite());
  };

  const update = (state: CharacterState, prevState: CharacterState): void => {
    controller.syncSprite(state, prevState);
  };

  const destroy = (): void => {
    controller.destroy();
  };

  return { init, update, destroy };
};
