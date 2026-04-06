import * as Tone from 'tone';

const { Player } = Tone;

/** Sample names in load / routing order */
export const SAMPLE_NAMES = [
  'startGong',
  'endGong',
  'breath-1',
  'breath-2',
  'breath-3',
  'breath-4',
  'ZT-sha-L',
  'ZT-sha-R',
  'ZT-drone-1',
  'ZT-drone-2',
];

const BREATH = new Set(['breath-1', 'breath-2', 'breath-3', 'breath-4']);
const DRUM = new Set(['ZT-sha-L', 'ZT-sha-R']);
const DRONE = new Set(['ZT-drone-1', 'ZT-drone-2']);

/** Gongs, breath, drums — load-time WASM processing; drone loops stay Tone-only. */
export const WASM_SAMPLE_NAMES = SAMPLE_NAMES.filter((name) => !DRONE.has(name));

/**
 * Builds the signal graph once: shared reverb → destination, drone chain unchanged.
 * @param {AudioWorkletNode | null} [droneWorkletNode] procedural drone; sample-only path when null
 */
export async function buildGraph(audioBuffers, droneVolumeControl, droneWorkletNode = null) {
  let reverb;
  let highpassBreath;
  let highpassDrum;
  let lowpassDrone;
  let highpassDrone;
  let droneReverb;
  let droneSampleGain;
  let droneProceduralGain = null;
  const players = {};

  // DRONE FX (preserve routing and values)
  lowpassDrone = new Tone.Filter(500, 'lowpass');
  highpassDrone = new Tone.Filter(150, 'highpass');
  droneReverb = new Tone.Reverb(6);
  droneReverb.wet.value = 0.6;
  await droneReverb.generate();

  highpassDrum = new Tone.Filter(60, 'highpass');

  highpassBreath = new Tone.Filter(200, 'highpass');

  reverb = new Tone.Reverb(9);
  reverb.wet.value = 0;
  await reverb.generate();

  const destination = Tone.getDestination();
  reverb.connect(destination);

  highpassBreath.connect(reverb);
  highpassDrum.connect(reverb);

  droneSampleGain = new Tone.Gain(1);

  lowpassDrone.connect(highpassDrone);
  highpassDrone.connect(droneReverb);
  droneReverb.connect(droneVolumeControl);
  droneVolumeControl.connect(destination);

  droneSampleGain.connect(lowpassDrone);
  if (droneWorkletNode) {
    droneProceduralGain = new Tone.Gain(0);
    droneWorkletNode.connect(droneProceduralGain.input);
    droneProceduralGain.connect(lowpassDrone);
  }

  for (const name of SAMPLE_NAMES) {
    const buf = audioBuffers[name];
    if (!buf) {
      console.error(`Missing buffer for ${name}`);
      continue;
    }
    const player = new Player(buf);
    player.playbackRate = 1;
    player.disconnect();

    if (BREATH.has(name)) {
      player.connect(highpassBreath);
    } else if (DRUM.has(name)) {
      player.connect(highpassDrum);
    } else if (DRONE.has(name)) {
      player.connect(droneSampleGain);
    } else {
      player.connect(reverb);
    }
    players[name] = player;
  }

  destination.volume.value = -6;

  return {
    players,
    reverb,
    highpassBreath,
    highpassDrum,
    lowpassDrone,
    highpassDrone,
    droneReverb,
    droneSampleGain,
    droneProceduralGain,
    droneWorkletNode,
  };
}
