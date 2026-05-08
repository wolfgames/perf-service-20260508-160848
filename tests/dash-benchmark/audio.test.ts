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

  it('win and loss audio use distinct alias keys (no accidental swapped calls)', async () => {
    // Edge case: ensure win and loss never call the same alias
    const winCalls: string[] = [];
    const lossCalls: string[] = [];
    const winAudio = createAudioSetup({ play: (a) => { winCalls.push(a); return Promise.resolve(); } });
    const lossAudio = createAudioSetup({ play: (a) => { lossCalls.push(a); return Promise.resolve(); } });
    await winAudio.playWin();
    await lossAudio.playLoss();
    expect(winCalls[0]).not.toBe(lossCalls[0]);
    expect(winCalls[0]).toBe('sfx-win-chime');
    expect(lossCalls[0]).toBe('sfx-loss-thud');
  });
});
