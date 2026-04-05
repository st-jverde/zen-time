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

/**
 * Builds the signal graph once: shared reverb → destination, drone chain unchanged.
 */
export async function buildGraph(audioBuffers, droneVolumeControl) {
  let reverb;
  let highpassBreath;
  let highpassDrum;
  let lowpassDrone;
  let highpassDrone;
  let droneReverb;
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

  reverb.connect(Tone.Destination);

  highpassBreath.connect(reverb);
  highpassDrum.connect(reverb);

  lowpassDrone.connect(highpassDrone);
  highpassDrone.connect(droneReverb);
  droneReverb.connect(droneVolumeControl);
  droneVolumeControl.connect(Tone.Destination);

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
      player.connect(lowpassDrone);
    } else {
      player.connect(reverb);
    }
    players[name] = player;
  }

  Tone.Destination.volume.value = -6;

  return {
    players,
    reverb,
    highpassBreath,
    highpassDrum,
    lowpassDrone,
    highpassDrone,
    droneReverb,
  };
}
