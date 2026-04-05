import { ensurePlaybackContext } from './context';
import * as Tone from 'tone';
import { buildGraph } from './graph';

const { start, getContext } = Tone;

const audioBuffers = {};
let graph = null;

export let droneVolumeControl = new Tone.Volume();

let mic = new Tone.UserMedia();
let isMicOpen = false;

let micReverb = new Tone.Reverb({ decay: 9 }).toDestination();
micReverb.wet.value = 1;

let meter = new Tone.Meter();
let compressor = new Tone.Compressor(-20, 4);

export async function loadAudio(sampleName, url) {
  ensurePlaybackContext();
  try {
    audioBuffers[sampleName] = await Tone.Buffer.fromUrl(url);
  } catch (error) {
    console.error(`Error loading audio for ${sampleName}:`, error);
    throw new Error(`Error loading audio for ${sampleName}: ${error.message}`);
  }
}

/**
 * One-shot: start context, build players and effects, connect shared reverb once.
 */
export async function initializeAllAudio() {
  ensurePlaybackContext();
  try {
    await start();
    if (getContext().state === 'suspended') {
      await getContext().resume();
    }
    if (!graph) {
      graph = await buildGraph(audioBuffers, droneVolumeControl);
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

export function playSample(sampleName, playbackRate = 1.0, onEndCallback) {
  const player = graph?.players?.[sampleName];
  if (player) {
    if (Tone.getContext().state !== 'running') {
      console.warn("Tone context is not in 'running' state.");
      return null;
    }
    player.playbackRate = playbackRate;
    player.start();
    if (onEndCallback) {
      player.onended = onEndCallback;
    }
    return player;
  }
  console.error(`Sample ${sampleName} not loaded or player not initialized`);
  return null;
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
  Tone.Destination.volume.value = volumeValue;
}

export function getMicVolumeLevel() {
  return meter.getValue();
}

export async function openMic() {
  try {
    ensurePlaybackContext();
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
  if (isMicOpen) {
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
