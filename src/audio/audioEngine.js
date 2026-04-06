import * as Tone from 'tone';

/**
 * Registers the procedural drone AudioWorklet and returns the node, or null if unsupported.
 * Uses Tone's createAudioWorkletNode — not `new AudioWorkletNode(rawContext, …)` — because
 * Tone's `rawContext` comes from standardized-audio-context and is not the native BaseAudioContext
 * the global AudioWorkletNode constructor expects.
 */
export async function initDroneWorklet() {
  const toneCtx = Tone.getContext();
  try {
    const moduleUrl = new URL('./droneWorkletProcessor.js', import.meta.url);
    await toneCtx.addAudioWorkletModule(moduleUrl.href, 'zen-drone-processor');
    const node = toneCtx.createAudioWorkletNode('zen-drone', {
      processorOptions: { sampleRate: toneCtx.sampleRate },
      numberOfOutputs: 1,
      outputChannelCount: [2],
      channelCount: 2,
      channelCountMode: 'explicit',
    });
    return node;
  } catch (err) {
    console.error('initDroneWorklet failed:', err);
    return null;
  }
}
