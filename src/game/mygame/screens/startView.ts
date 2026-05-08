/**
 * Dash Benchmark — Start Screen
 *
 * Renders: 'Dash Benchmark' title, 'Tap to jump' instruction, 'Start' button.
 * Calls unlockAudio before navigating to game (mobile audio requirement).
 */

import type {
  StartScreenDeps,
  StartScreenController,
  SetupStartScreen,
} from '~/game/mygame-contract';

export const setupStartScreen: SetupStartScreen = (deps: StartScreenDeps): StartScreenController => {
  let wrapper: HTMLDivElement | null = null;

  return {
    backgroundColor: '#1a1a2e',

    init(container: HTMLDivElement) {
      wrapper = document.createElement('div');
      wrapper.style.cssText =
        'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;background:#1a1a2e;';

      const title = document.createElement('h1');
      title.textContent = 'Dash Benchmark';
      title.style.cssText =
        'font-size:2.5rem;font-weight:700;color:#fff;margin:0;font-family:system-ui,sans-serif;text-align:center;';

      const instruction = document.createElement('p');
      instruction.textContent = 'Tap to jump';
      instruction.style.cssText =
        'font-size:1.125rem;color:rgba(255,255,255,0.8);margin:0;font-family:system-ui,sans-serif;';

      const startBtn = document.createElement('button');
      startBtn.textContent = 'Start';
      startBtn.style.cssText =
        'font-size:1.25rem;font-weight:600;padding:16px 64px;border:none;border-radius:12px;' +
        'background:#4a8c1c;color:#fff;cursor:pointer;font-family:system-ui,sans-serif;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:transform 0.1s,box-shadow 0.1s;' +
        'min-width:160px;min-height:52px;';
      startBtn.onmouseenter = () => { startBtn.style.transform = 'scale(1.05)'; };
      startBtn.onmouseleave = () => { startBtn.style.transform = 'scale(1)'; };

      startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        startBtn.textContent = 'Loading...';
        // Audio unlock must fire before any game sound (mobile requirement)
        deps.unlockAudio();
        await deps.initGpu();
        await deps.loadCore();
        try { await deps.loadAudio(); } catch { /* audio optional */ }
        deps.analytics.trackGameStart({ start_source: 'play_button', is_returning_player: false });
        deps.goto('game');
      }, { once: true });

      wrapper.append(title, instruction, startBtn);
      container.append(wrapper);
    },

    destroy() {
      wrapper?.remove();
      wrapper = null;
    },
  };
};
