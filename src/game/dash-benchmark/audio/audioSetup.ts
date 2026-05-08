/**
 * Audio setup for Dash Benchmark.
 * Wraps coordinator.audio.play() with try/catch so audio errors are silent.
 * Audio is optional per GDD — game must continue without it.
 */

export interface AudioService {
  play: (alias: string) => Promise<void>;
}

export interface AudioSetup {
  playWin: () => Promise<void>;
  playLoss: () => Promise<void>;
}

export const createAudioSetup = (audio: AudioService): AudioSetup => ({
  playWin: async (): Promise<void> => {
    try { await audio.play('sfx-win-chime'); } catch { /* audio optional */ }
  },
  playLoss: async (): Promise<void> => {
    try { await audio.play('sfx-loss-thud'); } catch { /* audio optional */ }
  },
});
