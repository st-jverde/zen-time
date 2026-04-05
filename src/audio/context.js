import * as Tone from 'tone';

let contextConfigured = false;

/**
 * Larger internal lookAhead / buffer tradeoff — helps reduce glitches on mobile.
 * Must run before Tone.start() or node construction.
 */
export function ensurePlaybackContext() {
  if (contextConfigured) {
    return;
  }
  Tone.setContext(new Tone.Context({ latencyHint: 'playback' }));
  contextConfigured = true;
}

ensurePlaybackContext();
