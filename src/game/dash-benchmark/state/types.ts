/** Finite state machine states for the board/game lifecycle. */
export type BoardState = 'Idle' | 'Jumping' | 'Falling' | 'Won' | 'Lost';

/** States for the character's vertical movement. */
export type MovementState = 'Idle' | 'Jumping' | 'Falling' | 'Lost';
