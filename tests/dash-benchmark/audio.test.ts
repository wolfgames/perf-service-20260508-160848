/**
 * Audio wiring tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { createAudioSetup } from '~/game/dash-benchmark/audio/audioSetup';

describe('dash-benchmark: audio wiring', () => {
  it('win chime plays on Won state', async () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined);
    const audio = createAudioSetup({ play: mockPlay });
    await audio.playWin();
    expect(mockPlay).toHaveBeenCalledWith('sfx-win-chime');
  });

  it('loss thud plays on Lost state', async () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined);
    const audio = createAudioSetup({ play: mockPlay });
    await audio.playLoss();
    expect(mockPlay).toHaveBeenCalledWith('sfx-loss-thud');
  });

  it('game continues without error when audio bundle not loaded', async () => {
    const mockPlay = vi.fn().mockRejectedValue(new Error('Bundle not loaded'));
    const audio = createAudioSetup({ play: mockPlay });
    // Should not throw
    await expect(audio.playWin()).resolves.toBeUndefined();
    await expect(audio.playLoss()).resolves.toBeUndefined();
  });
});
