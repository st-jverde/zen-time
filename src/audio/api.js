/**
 * Zen Time audio API (Tone.js graph + players).
 *
 * By default, decoded gong/breath/drum buffers go through `zen_samples` (`process_channel_inplace`);
 * use `setWasmSamplesProcessing(false)` to skip WASM (e.g. tests). Drone loop samples stay Tone-only.
 *
 * Drone: procedural layer is the JS AudioWorklet (`droneWorkletProcessor.js`), not Rust/WASM.
 * `setDronePathProcedural` / `setProceduralDroneActive` route the procedural vs sample drone path.
 */

import { ensurePlaybackContext } from './context';
import * as Tone from 'tone';
import { initDroneWorklet } from './audioEngine';
import { buildGraph } from './graph';
import { loadZenSamplesWasm, processToneBufferWithWasm } from './experimentalWasmSamples';

const { start, getContext } = Tone;

/** When true, `loadAudio` passes each decoded buffer through WASM (see experimentalWasmSamples.js). */
let wasmSamplesProcessingEnabled = true;

export function setWasmSamplesProcessing(enabled) {
  wasmSamplesProcessingEnabled = !!enabled;
}

const audioBuffers = {};
let graph = null;
/** @type {AudioWorkletNode | null} */
let droneWorkletNode = null;

/** Created only after Tone.start() + resume (user gesture) so all nodes share one AudioContext. */
export let droneVolumeControl = null;

export async function loadAudio(sampleName, url) {
  ensurePlaybackContext();
  try {
    audioBuffers[sampleName] = await Tone.Buffer.fromUrl(url);
    if (wasmSamplesProcessingEnabled) {
      await loadZenSamplesWasm();
      await processToneBufferWithWasm(audioBuffers[sampleName], sampleName);
    }
  } catch (error) {
    console.error(`Error loading audio for ${sampleName}:`, error);
    throw new Error(`Error loading audio for ${sampleName}: ${error.message}`);
  }
}

/**
 * One-shot: start context, build players and effects, connect shared reverb once.
 * Nodes must not be constructed at module load — only after start() so they match one context.
 */
export async function initializeAllAudio() {
  ensurePlaybackContext();
  try {
    await start();
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (wasmSamplesProcessingEnabled) {
      try {
        await loadZenSamplesWasm();
      } catch (err) {
        console.warn('zen_samples wasm preload failed:', err);
      }
    }

    if (!droneVolumeControl) {
      droneVolumeControl = new Tone.Volume();
    }

    if (!graph) {
      droneWorkletNode = await initDroneWorklet();
      graph = await buildGraph(audioBuffers, droneVolumeControl, droneWorkletNode);
    }
  } catch (error) {
    console.error('Error initializing audio:', error);
    throw new Error(`Error initializing audio: ${error.message}`);
  }
}

export function handleDroneVolume(value) {
  if (droneVolumeControl) {
    droneVolumeControl.volume.value = value;
  }
}

/**
 * When true, procedural drone (AudioWorklet) feeds the chain; sample drone loops are muted.
 */
export function setDronePathProcedural(useProcedural) {
  if (!graph?.droneSampleGain) {
    return;
  }
  if (!graph.droneProceduralGain || !graph.droneWorkletNode) {
    graph.droneSampleGain.gain.value = 1;
    return;
  }
  if (useProcedural) {
    graph.droneSampleGain.gain.value = 0;
    graph.droneProceduralGain.gain.value = 1;
  } else {
    graph.droneSampleGain.gain.value = 1;
    graph.droneProceduralGain.gain.value = 0;
  }
}

/**
 * Gate AudioWorklet procedural DSP (still runs process(); zeros output when false).
 */
export function setProceduralDroneActive(active) {
  droneWorkletNode?.port.postMessage({ type: 'active', value: active });
}

export function increaseFilterBreathFrequency(value) {
  if (graph?.highpassBreath) {
    graph.highpassBreath.frequency.rampTo(value, 1);
  } else {
    console.error('Highpass breath filter not initialized');
  }
}

export function increaseFilterDrumFrequency(value) {
  if (graph?.highpassDrum) {
    graph.highpassDrum.frequency.rampTo(value, 1);
  } else {
    console.error('Highpass drum filter not initialized');
  }
}

export function setReverbWetLevel(value) {
  if (graph?.reverb) {
    graph.reverb.wet.value = Math.min(Math.max(value, 0), 1);
  } else {
    console.error('Reverb not initialized');
  }
}

export function resetEffectsToDefaults() {
  if (!graph) {
    return;
  }
  graph.highpassBreath.frequency.value = 200;
  graph.highpassDrum.frequency.value = 60;
  graph.reverb.wet.value = 0;
}

/**
 * One continuous ease-in curve on the audio thread (avoids JS timer + rampTo fighting BPM).
 * Call right after Transport.start() so transport.seconds matches the BPM ramp.
 * @param {number} durationSec
 * @param {boolean} droneOn — when false, drone stays muted (-100 dB) while refs still track phase 1
 */
export function scheduleSettlingAudioRamps(durationSec, droneOn) {
  if (!graph || !droneVolumeControl || durationSec <= 0) {
    return;
  }
  const t = Tone.now();
  const transport = Tone.getTransport();
  const tt = transport.seconds;

  graph.highpassBreath.frequency.cancelScheduledValues(t);
  graph.highpassBreath.frequency.setValueAtTime(200, t);
  graph.highpassBreath.frequency.exponentialRampToValueAtTime(8000, t + durationSec);

  graph.highpassDrum.frequency.cancelScheduledValues(t);
  graph.highpassDrum.frequency.setValueAtTime(60, t);
  graph.highpassDrum.frequency.exponentialRampToValueAtTime(1000, t + durationSec);

  graph.reverb.wet.cancelScheduledValues(t);
  graph.reverb.wet.setValueAtTime(0, t);
  graph.reverb.wet.linearRampToValueAtTime(1, t + durationSec);

  droneVolumeControl.volume.cancelScheduledValues(t);
  if (droneOn) {
    droneVolumeControl.volume.setValueAtTime(-30, t);
    droneVolumeControl.volume.linearRampToValueAtTime(-9, t + durationSec);
  } else {
    droneVolumeControl.volume.setValueAtTime(-100, t);
  }

  transport.bpm.cancelScheduledValues(tt);
  transport.bpm.setValueAtTime(30, tt);
  transport.bpm.linearRampToValueAtTime(10, tt + durationSec);
}

export function cancelSettlingAudioRamps() {
  if (!graph || !droneVolumeControl) {
    return;
  }
  const t = Tone.now();
  const tt = Tone.getTransport().seconds;
  graph.highpassBreath.frequency.cancelScheduledValues(t);
  graph.highpassDrum.frequency.cancelScheduledValues(t);
  graph.reverb.wet.cancelScheduledValues(t);
  droneVolumeControl.volume.cancelScheduledValues(t);
  Tone.getTransport().bpm.cancelScheduledValues(tt);
}

function playSampleTone(sampleName, playbackRate = 1.0, onEndCallback, startTime) {
  const player = graph?.players?.[sampleName];
  if (player) {
    if (Tone.getContext().state !== 'running') {
      console.warn("Tone context is not in 'running' state.");
      return null;
    }
    player.playbackRate = playbackRate;
    if (onEndCallback) {
      player.onended = onEndCallback;
    }
    if (startTime !== undefined && startTime !== null) {
      player.start(startTime);
    } else {
      player.start();
    }
    return player;
  }
  console.error(`Sample ${sampleName} not loaded or player not initialized`);
  return null;
}

/**
 * Plays a loaded sample through the Tone graph. Unless `setWasmSamplesProcessing(false)` was used
 * before load, gong/breath/drum buffers were already passed through `zen_samples` at decode time.
 */
export function playSample(sampleName, playbackRate = 1.0, onEndCallback, startTime) {
  return playSampleTone(sampleName, playbackRate, onEndCallback, startTime);
}

export function stopAllSamples() {
  if (!graph?.players) {
    return;
  }
  Object.values(graph.players).forEach((player) => {
    if (player && player.state === 'started') {
      player.stop();
    }
  });
}

export function setGlobalVolume(volumeValue) {
  Tone.getDestination().volume.value = volumeValue;
}

export function getMicVolumeLevel() {
  return meter ? meter.getValue() : 0;
}

let mic = null;
let isMicOpen = false;

let micReverb = null;
let meter = null;
let compressor = null;

function ensureMicChain() {
  if (!micReverb) {
    micReverb = new Tone.Reverb({ decay: 9 }).toDestination();
    micReverb.wet.value = 1;
    meter = new Tone.Meter();
    compressor = new Tone.Compressor(-20, 4);
  }
  if (!mic) {
    mic = new Tone.UserMedia();
  }
}

export async function openMic() {
  try {
    ensurePlaybackContext();
    await start();
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    ensureMicChain();

    await mic.open();
    isMicOpen = true;

    mic.connect(micReverb);
    micReverb.connect(compressor);
    compressor.connect(meter);
    meter.toDestination();

    await micReverb.generate();
  } catch (error) {
    console.error('Error opening microphone:', error);
    isMicOpen = false;
  }
}

export function closeMic() {
  if (isMicOpen && mic && micReverb && compressor && meter) {
    mic.disconnect(micReverb);
    micReverb.disconnect(compressor);
    compressor.disconnect(meter);

    mic.close();
    isMicOpen = false;
  }
}

export function setMicVolume(volume) {
  if (mic) {
    mic.volume.value = volume;
  }
}

export default { openMic, closeMic, setMicVolume, getMicVolumeLevel };
