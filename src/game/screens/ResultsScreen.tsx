import { createEffect, Show, onMount } from 'solid-js';
import { gsap } from 'gsap';
import { useScreen } from '~/core/systems/screens';
import { Button } from '~/core/ui/Button';
import { gameState } from '~/game/state';
import { dashGameState } from '~/game/dash-benchmark/state/gameState';
import { LOSS_HEADING, WIN_HEADING } from '~/game/dash-benchmark/state/gameState';

export function ResultsScreen() {
  const { goto } = useScreen();
  let containerEl: HTMLDivElement | undefined;
  let scoreEl: HTMLDivElement | undefined;

  const isWin = () => dashGameState.boardState() === 'Won';
  const score = () => dashGameState.levelScore();
  const level = () => gameState.level();

  onMount(() => {
    if (!containerEl) return;
    // Slide in from bottom
    gsap.fromTo(
      containerEl,
      { y: '100%' },
      { y: '0%', duration: 0.3, ease: 'power2.out' },
    );

    // Score pop-in for win
    if (isWin() && scoreEl) {
      gsap.fromTo(
        scoreEl,
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: 'back.out(1.7)', delay: 0.15 },
      );
    }
  });

  const handleTryAgain = () => {
    dashGameState.reset(level());
    gameState.setScore(0);
    goto('game');
  };

  const handleNextLevel = () => {
    gameState.incrementLevel();
    dashGameState.reset(gameState.level());
    gameState.setScore(0);
    goto('game');
  };

  const handlePlayAgain = () => {
    dashGameState.reset(level());
    gameState.setScore(0);
    goto('game');
  };

  const handleStartScreen = () => {
    goto('start');
  };

  return (
    <div
      ref={containerEl}
      class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black px-6"
    >
      <h1 class="text-3xl font-bold text-white mb-2">
        {isWin() ? WIN_HEADING : LOSS_HEADING}
      </h1>

      <div ref={scoreEl} class="text-center mb-8">
        <p class="text-white/60 text-sm mb-1">Score</p>
        <p class="text-5xl font-bold text-white">
          {score()}
        </p>
      </div>

      <div class="flex flex-col gap-3 w-full max-w-xs">
        <Show
          when={isWin()}
          fallback={
            <>
              {/* Loss path */}
              <Button onClick={handleTryAgain} class="w-full py-4 text-lg min-h-[44px]">
                Try Again
              </Button>
              <button
                onClick={handleStartScreen}
                class="text-white/70 underline text-base py-3 min-h-[44px]"
              >
                Start Screen
              </button>
            </>
          }
        >
          {/* Win path */}
          <Button onClick={handleNextLevel} class="w-full py-4 text-lg min-h-[44px]">
            Next Level
          </Button>
          <Button variant="secondary" onClick={handlePlayAgain} class="w-full py-4 text-lg min-h-[44px]">
            Play Again
          </Button>
        </Show>
      </div>
    </div>
  );
}
