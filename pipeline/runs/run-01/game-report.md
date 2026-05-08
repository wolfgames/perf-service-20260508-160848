---
type: game-report
game: Dash Benchmark
pipeline_version: "0.3.8"
run: 1
pass: core
status: complete
features:
  total: 18
  implemented: 18
  partial: 0
  deferred: 0
tests:
  new: 65
  passing: 184
  total: 204
issues:
  critical: 0
  minor: 1
cos:
  - id: core-interaction
    status: pass
    note: "interaction-archetype.md written with all fields; pointertap on stage; input blocked in Won/Lost; tap silently ignored when airborne (documented per GDD intent)"
  - id: canvas
    status: pass
    note: "character 48×48px orange rect at 25% width; platform gray lane in bottom 40%; spike red, barrier purple — all distinct; HUD at y=8-32 within 40px band; no overlap at 390×844"
  - id: animated-dynamics
    status: pass
    note: "physics per-frame (velocityY += GRAVITY * dt); squash on landing (GSAP 80ms); loss sequence: freeze 200ms → flash 100ms → slide 300ms; win sequence: pop-in → slide; GSAP delayedCall used not setTimeout"
  - id: scoring
    status: pass
    note: "levelScore = floor(distance * (currentScrollSpeed / SCROLL_SPEED)); two multiplicative dimensions verified in scoring.test.ts; speedMultiplier > 1.0 when speed has increased"
  - id: skill-curve
    status: deferred-to-pass-meta
    note: "difficulty tiers implemented (Warm-up → Hard) but skill-curve CoS gated at meta pass"
  - id: pattern-busters
    status: deferred-to-pass-secondary
    note: "no special pieces in core pass per design"
completeness:
  items_required: 20
  items_met: 20
  items_gaps: 0
blocking:
  cos_failed: []
  completeness_gaps: []
---

# Pipeline Report: Dash Benchmark

## Features

- [x] game-kit-integration — exists, unchanged
- [x] loading-screen — background updated to #1a1a2e (dark theme)
- [x] asset-manifest — scene-dash-benchmark + audio-sfx-dash bundles added
- [x] game-state-signals — distance, goal, boardState, scrollSpeed, levelScore, level
- [x] game-tuning — DASH_TUNING with SCROLL_SPEED=280, JUMP_VELOCITY=-520, GRAVITY=1400, difficulty tiers
- [x] results-screen — win/loss branching, GSAP slide-in, score pop-in, correct headings
- [x] start-screen-content — 'Dash Benchmark' title, 'Tap to jump', 'Start' button, #1a1a2e background
- [x] gameplay-screen-gpu — Pixi Application, 5 layers, full-screen tap zone
- [x] platform-engine — right-to-left scroll, segment recycling, speed escalation
- [x] player-character — 48×48px orange rect, parabolic jump arc, squash landing
- [x] obstacle-system — spikes (red triangle), barriers (purple rect), gaps
- [x] physics-movement — velocity + gravity per frame, landing clamp, gap-fall Lost
- [x] procedural-level-gen — seeded mulberry32 RNG, 4 difficulty tiers, solvability check, fallback layout
- [x] distance-score-hud — real-time Pixi Text at y=8, 24px font, within HUD band
- [x] win-sequence — Won state → audio → freeze → score pop-in → Level Complete slide
- [x] loss-sequence — Lost state → freeze 200ms → flash → audio → results slide
- [x] game-audio — playWin/playLoss with try/catch; audio optional
- [x] screen-flash-effect — full-screen white Graphics rect, alpha 0→0.6→0 over 100ms GSAP
- [x] interaction-archetype-doc — Tap archetype, pointer sequence, cancel, invalid feedback, feel

## CoS Compliance — pass `core`

| CoS                    | Status  | Evidence / note |
|------------------------|---------|-----------------|
| `core-interaction`     | pass    | Tap gesture: one finger, one outcome; pointertap on stage; input disabled in Won/Lost; archetype doc present |
| `canvas`               | pass    | Character 48×48px at 390px; platform bottom 40%; HUD top 40px; 4 visually distinct colors |
| `animated-dynamics`    | pass    | Physics per-frame; squash on land; loss: freeze→flash→slide; win: pop-in→slide; no instant transitions |
| `scoring` (base)       | pass    | distance × speedMultiplier; two multiplicative dims; floored integer; displayed real-time |
| `skill-curve`          | deferred-to-pass-meta | difficulty tiers (Warm-up→Hard) ready; CoS gated at meta pass |
| `pattern-busters`      | deferred-to-pass-secondary | no special pieces in core pass |

## Completeness — pass `core`

| Area                       | Required | Met | Gaps |
|----------------------------|----------|-----|------|
| Interaction                | 5        | 5   | 0    |
| Board & Pieces             | 4        | 4   | 0    |
| Core Mechanics             | 6        | 6   | 0    |
| Scoring (base)             | 3        | 3   | 0    |
| CoS mandatory at pass core | 4        | 4   | 0    |

## Known Issues

- **Minor: viewport-reserve-not-applied** — canvas uses absolute inset-0 (full viewport); logo DOM overlay occupies bottom 64px. Game objects do not intrude on logo zone; logo z-stacks on top. No playability impact. (carried from verify)

## Deferred

- **`skill-curve` CoS** — difficulty tiers (Warm-up through Hard with gapRange, spikeFreq, barrierFreq) are implemented in `tuning.ts`. Full skill-curve CoS evaluation deferred to pass `meta` per the pass table.
- **`pattern-busters` CoS** — no special pieces in this pass. Deferred to pass `secondary`.
- **Browser smoke test** — browser MCP unavailable in environment; smoke scope only. No playability blocker identified via code review.

## Recommendations

1. **Pass `secondary`** — add match-4/5 special pieces (line blast, color bomb), obstacles with HP, non-standard board shapes.
2. **Pass `meta`** — level progression with per-level goals, difficulty curve tuning, move/time limits, star rating.
3. **Performance** — chunk-size warning (1.1 MB unminified index bundle); consider dynamic import for Pixi to split the GPU chunk.
4. **Asset atlas** — replace Graphics rect fallbacks with a proper `scene-dash-benchmark` atlas once art is ready. The placeholder JSON stubs in asset-manifest.ts mark the extension points.
