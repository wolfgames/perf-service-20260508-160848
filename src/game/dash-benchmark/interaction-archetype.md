# Interaction Archetype — Dash Benchmark

## Interaction Type

**Tap** — touch and release anywhere on the game canvas to make the character jump.

## Pointer Sequence

```
pointerdown  → Ignored (we act on release, not press — lets player slide-to-cancel)

pointerup    → If boardState is Idle:
                 Dispatch jump action (velocityY = JUMP_VELOCITY, state → Jumping)
               If boardState is Jumping or Falling:
                 Silently ignore (no double-jump)
               If boardState is Won or Lost:
                 Silently ignore (input blocked)
```

The entire gesture is a single tap. There is no drag, no threshold, no direction detection.

## Cancel Behavior

There is no gesture in progress to cancel — the action fires on `pointerup`. If the player
touches the screen and lifts in the same frame, a jump fires (from Idle). From any other
state the lift is ignored. There is no "partial gesture" concept for a Tap archetype.

## Invalid Gesture Feedback

Tapping while the character is Jumping or Falling is silently ignored — no visual shake,
no audio, no feedback. This is intentional per GDD: the game communicates the no-double-jump
rule through the character's visible arc (the player learns by watching the character stay
on its arc, not through error feedback).

## Feel Description

**Immediate and decisive.** The jump response to tap should feel instantaneous — no lag
between finger lift and character leaving the ground. The parabolic arc is satisfying to
watch: the character rises, arcs, and lands with a brief squash (scale Y 0.8 → 1.0, 80ms).
The rhythm of tapping once per gap, watching the arc, and landing is the core compulsion loop.

## Touch Target

Full canvas area (entire screen). The smallest possible target area exceeds 44×44 px on
any supported device. No precision is required — tap anywhere.

## Input Blocking

Input is blocked when `boardState` is `Won` or `Lost`. The controller disables the
`pointertap` listener immediately on entering either terminal state, before any animation
fires. It is re-enabled only after the player confirms a restart (Try Again / Next Level / Play Again).
