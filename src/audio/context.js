import * as Tone from 'tone';

let contextConfigured = false;

/**
 * Larger internal lookAhead / buffer tradeoff — helps reduce glitches on mobile.
 * Must run before Tone.start() or node construction.
 *
 * After setContext(), use Tone.getDestination() / Tone.getTransport() / Tone.getContext()
 * — not the Tone.Destination / Tone.Transport module exports (those stick to the first context).
 */
export function ensurePlaybackContext() {
  if (contextConfigured) {
    return;
  }
  Tone.setContext(new Tone.Context({ latencyHint: 'playback' }));
  contextConfigured = true;
}

ensurePlaybackContext();
