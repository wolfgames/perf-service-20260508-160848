# Dash Benchmark
**Tagline:** Every frame counts — keep the momentum alive.
**Genre:** Platformer / Casual Runner
**Platform:** Mobile first (portrait, touch), playable on web
**Target Audience:** Casual adults 30+

---

## Table of Contents

**The Game**
1. [Game Overview](#game-overview)
2. [At a Glance](#at-a-glance)

**How It Plays**
3. [Core Mechanics](#core-mechanics)
4. [Level Generation](#level-generation)

**How It Flows**
5. [Game Flow](#game-flow)

---

## Game Overview

Dash Benchmark is a minimal, single-screen platformer designed to test rendering performance across devices. The player controls a small character that runs automatically, and the sole input is a single tap to jump over gaps and obstacles. Player does [tap to jump] -> which causes [the character to leap over an oncoming obstacle or gap] -> which unlocks [the next procedurally generated segment, advancing the level and earning a distance score].

**Setting:** A stark, abstract test environment — clean geometric shapes against a flat background — with no narrative decoration. The world is a scrolling tech benchmark arena designed to stress-test frame delivery.

**Core Loop:** Player taps to jump → character clears obstacles and gaps → distance score increments → new procedural segment loads → cycle repeats until the player fails or a distance goal is reached.

---

## At a Glance

| | |
|---|---|
| **Play Surface** | Single scrolling lane, portrait viewport |
| **Input** | Single tap — jump |
| **Character** | One player character (auto-run) |
| **Obstacles** | Ground spikes, floating barriers, gaps |
| **Levels / Chapter** | 5 segments per level, infinite loop |
| **Session Target** | 1–3 min per run |
| **Distance Range** | 200–1 000 units per level |
| **Chapters at Launch** | 1 (single endless environment) |
| **Failure** | Yes — collision with obstacle or fall into gap |
| **Continue System** | Instant retry; no ad gate |
| **Star Rating** | None — distance score only |
| **Companion** | None |
| **Content Cadence** | Single environment; performance-test focus |

---

## Core Mechanics

### Primary Input

**Input type:** Single-finger tap (on mobile) / mouse click (on web).
**Acts on:** The player character.
**Produces:** A jump arc — the character leaves the ground and follows a fixed parabolic trajectory, landing back on the platform after a defined time.

Only one tap is registered per jump. A second tap while airborne is ignored (no double-jump). This keeps input requirements minimal and frame budget predictable.

### Play Surface

- **Orientation:** Portrait. The visible world is a horizontally scrolling lane occupying the full screen width.
- **Viewport dimensions:** Full device width × full device height (`100dvh`). The lane sits in the bottom 40 % of the screen; the upper 60 % is empty sky (background fill only — no interactive elements).
- **Scroll direction:** Right-to-left continuous scroll. The character is fixed at approximately 25 % from the left edge.
- **Ground line:** A single flat ground surface running the full width. The character always lands on this ground line unless a gap is present.
- **Fit rule:** The play lane must fit within a 9:16 portrait viewport. On wider viewports (tablet / desktop), the game canvas is centred with neutral side margins — no gameplay extension.

### Game Entities

#### Player Character

| Property | Value |
|----------|-------|
| Visual | Small rectangular sprite (32 × 32 px visual; 44 × 44 pt tap target) |
| Horizontal position | Fixed at 25 % of screen width |
| Vertical position | Rests on ground line; rises during jump arc |
| Behavior | Auto-runs continuously; jumps on tap |
| Edge cases | Cannot run off screen left or right; cannot jump while already airborne |

#### Ground Platform

| Property | Value |
|----------|-------|
| Visual | Solid horizontal bar filling screen width |
| Behavior | Scrolls left at the current speed constant; segments are chained seamlessly |
| Edge cases | Gap segments replace the platform with empty space; character falls if it enters a gap without jumping |

#### Ground Spike (obstacle)

| Property | Value |
|----------|-------|
| Visual | Triangle pointing upward, 24 × 20 px |
| Behavior | Placed on the platform surface; scrolls with the ground |
| Hit rule | IF character bounding box overlaps spike THEN trigger Loss Sequence |
| Edge cases | Never placed inside a gap segment; never placed within 2 character-widths of the level start |

#### Floating Barrier (obstacle)

| Property | Value |
|----------|-------|
| Visual | Horizontal rectangle, 12 × 40 px, positioned above ground |
| Behavior | Static relative to its platform segment; scrolls with ground |
| Hit rule | IF character bounding box overlaps barrier while ascending or descending THEN trigger Loss Sequence |
| Clearance | Positioned so the gap between barrier bottom and character max jump height is always exactly 8 px — always passable, never free |
| Edge cases | Never placed in the same segment as a gap; never stacked |

#### Gap

| Property | Value |
|----------|-------|
| Visual | Absence of ground platform — sky colour shows through |
| Width | 1.0–2.0 character widths (generated per difficulty tier) |
| Behavior | Character falls if it enters a gap without having jumped before the gap's left edge |
| Fall rule | IF character reaches the gap and is not airborne THEN trigger Loss Sequence |
| Edge cases | Never placed within 3 character-widths of the previous obstacle |

### Movement & Physics Rules

All durations are fixed constants — not frame-dependent — to ensure consistent frame-budget measurement.

| Rule | Condition | Outcome |
|------|-----------|---------|
| Auto-run | Always | Character moves at scroll speed (constant, never stops) |
| Jump start | IF tap received AND character is on ground | Character enters `Jumping` state; vertical velocity set to `JUMP_VELOCITY` |
| Jump arc | WHILE character is in `Jumping` state | Apply `GRAVITY` constant each frame to vertical velocity; move character vertically by velocity × deltaTime |
| Landing | IF character bottom edge meets or crosses ground line AND character is in `Jumping` state | Character enters `Running` state; vertical position clamped to ground line |
| Falling into gap | IF character is over a gap AND not in `Jumping` state | Character enters `Falling` state; `GRAVITY` applied; trigger Loss Sequence when character exits viewport bottom |
| Obstacle collision | IF character bounding box intersects obstacle bounding box | Trigger Loss Sequence immediately |
| Input during air | IF tap received AND character is in `Jumping` or `Falling` state | Input ignored |

**Constants (tuning handles — not hardcoded):**

| Constant | Default | Notes |
|----------|---------|-------|
| `SCROLL_SPEED` | 280 px/s | Increases by 5 px/s every 200 units of distance |
| `JUMP_VELOCITY` | −520 px/s | Negative = upward |
| `GRAVITY` | 1 400 px/s² | Applied per frame |
| `JUMP_DURATION` | ~480 ms at default gravity | Derived, not set directly |

> For invalid action feedback (visual, audio, duration), see [Feedback & Juice](#feedback--juice).

---

## Level Generation

### Method

**Procedural** — all segments are generated at runtime using a seeded random number generator. No hand-crafted levels. The seed is derived from the level number so the same level always produces the same obstacle layout.

### Generation Algorithm

**Step 1: Seed Initialisation**
- Inputs: `levelNumber` (integer, 1-based)
- Outputs: Seeded RNG instance
- Constraints: Seed formula is `levelNumber × 48271`. Same seed always produces the same sequence.

**Step 2: Difficulty Tier Selection**
- Inputs: `levelNumber`, tier table
- Outputs: Active `DifficultyTier` object (`{ gapWidthRange, spikeFrequency, barrierFrequency, scrollSpeedBonus }`)
- Constraints:

| Levels | Tier | Gap Width | Spike Freq | Barrier Freq | Speed Bonus |
|--------|------|-----------|------------|--------------|-------------|
| 1–5 | Warm-up | 1.0–1.2 cw | 10 % | 0 % | 0 px/s |
| 6–15 | Easy | 1.0–1.5 cw | 20 % | 10 % | 10 px/s |
| 16–30 | Medium | 1.2–1.8 cw | 30 % | 20 % | 20 px/s |
| 31+ | Hard | 1.5–2.0 cw | 35 % | 25 % | 30 px/s |

(cw = character widths)

**Step 3: Segment Sequence Generation**
- Inputs: RNG, `DifficultyTier`, target segment count (default 5 per level pass)
- Outputs: Array of segment descriptors (`{ type: 'platform' | 'gap', obstacleType: 'none' | 'spike' | 'barrier', obstacleOffset }`)
- Constraints:
  - First segment of every level is always `platform` with no obstacle (safe landing zone).
  - No two gaps may be adjacent.
  - An obstacle is never placed within 3 cw of a gap edge.
  - After generating each segment, validate the spacing rules above. If violated, regenerate that segment (max 5 retries).

**Step 4: Solvability Check**
- Inputs: Segment array, `JUMP_DURATION`, `SCROLL_SPEED`, `DifficultyTier`
- Outputs: Pass / Fail
- Constraints:
  - Every gap must be crossable: `gap_width_px < SCROLL_SPEED × JUMP_DURATION_s`. If not, reduce gap width to the maximum crossable value and mark as adjusted.
  - Every barrier must be avoidable: clearance gap is always exactly 8 px above character max jump height (enforced during placement, not checked here).
  - IF check fails after 10 full regeneration attempts THEN fall back to the last-resort layout.

**Step 5: Fallback — Last-Resort Layout**
- A hardcoded segment array is baked into the build: 5 platform segments with one spike at segment 3, no gaps, no barriers.
- This layout is guaranteed solvable at all scroll speeds within the defined constant range.
- The fallback is only used when the procedural generator fails 10 consecutive solvability checks (should not occur in practice).

### Seeding & Reproducibility

- Seed formula: `levelNumber × 48271`
- The same seed always produces the same segment array.
- If a failed seed triggers the fallback, the fallback layout is logged (level number + seed) for debugging.

### Solvability Validation

| Condition | Action |
|-----------|--------|
| Gap too wide to jump | Clamp to max crossable width |
| Adjacent gaps | Regenerate second gap segment |
| Obstacle too close to gap | Regenerate obstacle offset |
| 10 failed full-level attempts | Use hardcoded fallback layout |

**Last-resort guarantee:** The hardcoded fallback (5 safe platform segments, 1 spike, no gaps) is always solvable. It requires no RNG and cannot fail.

### Hand-Crafted Levels

None. All levels are procedurally generated. The fallback layout is embedded directly in the generator module as a constant — it is owned by the game developer and version-controlled with the source code.

---

## Game Flow

### Master Flow Diagram

```
App open
  ↓ (BOOT: assets load)
Loading Screen
  ↓ (assets ready)
Start Screen  [TITLE]
  ↓ (player taps "Start")
Gameplay Screen  [PLAY]
  ↓ (player reaches distance goal)  →  Level Complete Screen  [OUTCOME]
  ↓ (player hits obstacle / falls)  →  Loss Screen  [OUTCOME]
                                           ↓ (player taps "Try Again")
                                        Gameplay Screen  [PLAY]
Level Complete Screen
  ↓ (player taps "Next" or "Play Again")
Gameplay Screen (next level)  [PLAY]
```

### Screen Breakdown

#### Loading Screen
- **lifecycle_phase:** BOOT
- **Purpose:** Display a minimal loading indicator while the asset bundle loads.
- **Player sees:** Game logo or title text centred; a small animated progress indicator (e.g., a pulsing bar or spinner).
- **Player does:** Nothing — passive wait.
- **What happens next:** When assets are ready, transition automatically to Start Screen.
- **Expected duration:** < 2 s on a modern device.

#### Start Screen
- **lifecycle_phase:** TITLE
- **Purpose:** Entry point for a new run. Communicates the game title and single call to action.
- **Player sees:** Game title ("Dash Benchmark"), a short one-line instruction ("Tap to jump"), and a large "Start" button.
- **Player does:** Taps "Start" (minimum 44 × 44 pt button).
- **What happens next:** Gameplay Screen loads immediately (no interstitial).
- **Expected duration:** 5–15 s (player reads, decides, taps).

#### Gameplay Screen
- **lifecycle_phase:** PLAY
- **Purpose:** The active play experience. Character auto-runs; player taps to jump.
- **Player sees:** Scrolling platform lane (bottom 40 % of screen); player character (fixed left); distance score counter (top-left corner, large readable text); obstacles approaching from the right.
- **Player does:** Taps anywhere on screen to jump. No other interaction.
- **What happens next:**
  - IF distance goal reached → transition to Level Complete Screen (animated transition, 300 ms slide-up).
  - IF collision or fall → transition to Loss Screen (freeze frame 200 ms → screen flash 100 ms → Loss Screen slide-in 300 ms).
- **Expected duration:** 1–3 min per run.

#### Level Complete Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Celebrate completion; show score; offer continuation.
- **Player sees:** "Level Complete!" heading; distance score achieved; a "Next Level" button and a "Play Again" button.
- **Player does:** Taps "Next Level" (proceeds to next generated level) or "Play Again" (restarts same level).
- **What happens next:** Gameplay Screen for the chosen level.
- **Expected duration:** 5–20 s.

#### Loss Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Acknowledge failure gently; encourage immediate retry.
- **Player sees:** "Oops! Try Again?" heading (never "Game Over"); distance reached this run; a large "Try Again" button; a smaller "Start Screen" link.
- **Player does:** Taps "Try Again" (instant restart, same level + same seed) or "Start Screen" (returns to title).
- **What happens next:** Gameplay Screen (retry) or Start Screen.
- **Expected duration:** 3–10 s.

### Board States

| State | Description | Input Allowed? |
|-------|-------------|----------------|
| `Idle` | Character on ground, scroll active, waiting for tap | Yes — tap triggers jump |
| `Jumping` | Character in jump arc | No — tap ignored |
| `Falling` | Character over gap, falling | No — tap ignored |
| `Won` | Distance goal reached, transition animating | No |
| `Lost` | Collision/fall detected, loss sequence running | No |
| `Paused` | (Reserved — not used in minimal version) | No |

Any state transition that changes visible pieces (character position, obstacle positions) is an animated transition — no instant state changes. State switches that trigger screen transitions use a 300 ms animated slide or fade.

### Win Condition

```
IF character.distanceTravelled >= level.distanceGoal THEN enter Won state
```

### Lose Condition

```
IF character.boundingBox.intersects(obstacle.boundingBox) THEN enter Lost state
IF character.position.y > viewport.bottom AND character.state == 'Falling' THEN enter Lost state
```

### Win Sequence (ordered)

1. Set board state → `Won`.
2. Disable all input.
3. Play win audio cue (short chime, 400 ms).
4. Freeze character in current position (stop GSAP scroll tween).
5. Display distance score with a pop-in animation (GSAP `back.out`, 300 ms).
6. Slide Level Complete Screen into view from bottom (GSAP, 300 ms, ease `power2.out`).
7. Enable "Next Level" and "Play Again" buttons.

### Loss Sequence (ordered)

1. Set board state → `Lost`.
2. Disable all input.
3. Freeze character in collision/fall position (200 ms hold).
4. Flash screen white (alpha 0 → 0.6 → 0, 100 ms GSAP, `power1.inOut`).
5. Play loss audio cue (soft thud, 300 ms).
6. Slide Loss Screen into view from bottom (GSAP, 300 ms, `power2.out`).
7. Enable "Try Again" and "Start Screen" buttons.
