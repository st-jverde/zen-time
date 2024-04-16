import * as Tone from 'tone';

const { Player, start, getContext, Buffer } = Tone;

const players = {};
const audioBuffers = {};
let reverb;
let highpassBreath;
let highpassDrum;
let lowpassDrone, highpassDrone, droneReverb;
let vol; 

let mic = new Tone.UserMedia();
let isMicOpen = false;

// let pitchShift = new Tone.PitchShift(-6);
let micReverb = new Tone.Reverb({ decay: 9 }).toDestination();
micReverb.wet.value = 1;
// let lowpassMic = new Tone.Filter(600, "lowpass");
// let highpassMic = new Tone.Filter(300, "highpass");
// let meter = new Tone.Meter();
// let compressor = new Tone.Compressor(-20, 4);

export let droneVolumeControl = new Tone.Volume();

export const loadAudio = async (sampleName, url) => {
    try {
        audioBuffers[sampleName] = await Buffer.fromUrl(url);
    } catch (error) {
        console.error(`Error loading audio for ${sampleName}:`, error);
        throw new Error(`Error loading audio for ${sampleName}: ${error.message}`);
    }
};

export const initializeAudio = async (sampleName) => {
    try {
        await start();
        
        if (getContext().state === "suspended") {
            await getContext().resume();
        }
        // Tone.Destination.volume.value = -6;
        vol = new Tone.Volume(-12);
        // DRONE FX
        lowpassDrone = new Tone.Filter(500, "lowpass");
        highpassDrone = new Tone.Filter(150, "highpass");
        droneReverb = new Tone.Reverb(6);
        droneReverb.wet.value = 0.6;

        //highpassDrum
        highpassDrum = new Tone.Filter(60, "highpass");

        // Create highpassBreath filter
        highpassBreath = new Tone.Filter(200, "highpass"); // Start at 200Hz

        // Create and configure reverb effect
        reverb = new Tone.Reverb(9);
        reverb.wet.value = 0;
        await reverb.generate();

        if (!players[sampleName] && audioBuffers[sampleName]) {
            players[sampleName] = new Player(audioBuffers[sampleName])
            players[sampleName].playbackRate = 1;

            // Ensure the sample is disconnected from any nodes it might be connected to
            players[sampleName].disconnect();

            switch (sampleName) {
                case "breath-1":
                case "breath-2":
                case "breath-3":
                case "breath-4":
                    players[sampleName].connect(highpassBreath);
                    highpassBreath.connect(reverb);
                    reverb.connect(vol);
                    vol.toDestination();
                    break;
                case "ZT-sha-L":
                case "ZT-sha-R":
                    players[sampleName].connect(highpassDrum);
                    highpassDrum.connect(reverb);
                    reverb.connect(vol);
                    vol.toDestination();
                    break;
                case "ZT-drone-1":
                case "ZT-drone-2":
                    players[sampleName].connect(lowpassDrone);
                    lowpassDrone.connect(highpassDrone);
                    highpassDrone.connect(droneReverb);
                    droneReverb.connect(droneVolumeControl);
                    droneVolumeControl.connect(vol);
                    vol.toDestination();
                    break;
                default:
                    players[sampleName].connect(reverb);
                    reverb.connect(vol);
                    vol.toDestination();
                    break;
            }
        } else if (!audioBuffers[sampleName]) {
            console.error(`Audio buffer for ${sampleName} is not loaded.`);
        }

    } catch (error) {
        console.error(`Error initializing audio for ${sampleName}:`, error);
        throw new Error(`Error initializing audio for ${sampleName}: ${error.message}`);
    }
};

export const handleDroneVolume = (value) => {
    if (droneVolumeControl) {
        droneVolumeControl.volume.value = value;
        console.log("Drone db: ", value);
    }
};

// Utility function to increase the filter frequency
export const increaseFilterBreathFrequency = (value) => {
    if (highpassBreath) {
        console.log("highpass Breath: ", value);
        highpassBreath.frequency.rampTo(value, 1); // 1 second ramp time, you can adjust
    }else {
        console.error('Highpass filter not initialized');
    }
};

export const increaseFilterDrumFrequency = (value) => {
    if (highpassDrum) {
        console.log("highpass Drum: ", value);
        highpassDrum.frequency.rampTo(value, 1);

    }else {
        console.error('Highpass filter not initialized');
    }
};

// Utility function to set reverb wet level (0 is dry, 1 is fully wet)
export const setReverbWetLevel = (value) => {
    if (reverb) {
        console.log("reverb: ", value);
        reverb.wet.value = Math.min(Math.max(value, 0), 1);
    } else {
        console.error('Reverb not initialized');
    }
};

export const playSample = (sampleName, playbackRate = 1.0, onEndCallback) => {
    if (players[sampleName]) {
        if (Tone.getContext().state !== "running") {
            console.warn("Tone context is not in 'running' state.");
            return;
        }
        players[sampleName].playbackRate = playbackRate;
        players[sampleName].start();
        if (onEndCallback) {
            players[sampleName].onended = onEndCallback;
        }
        return players[sampleName];
    } else {
        console.error(`Sample ${sampleName} not loaded or player not initialized`);
        return null;
    }
};

// export const stopSample = (sampleName) => {
//     if (players[sampleName]) {
//         players[sampleName].stop();
//         return players[sampleName];
//     } else {
//         console.error(`Sample ${sampleName} not loaded or player not initialized`);
//         return null;
//     }
// };

export const stopAllSamples = () => {
    Object.values(players).forEach(player => {
        if (player && player.state === "started") {
            player.stop();
        }
    });
};

// Utility to set global volume
export const setGlobalVolume = (volumeValue) => {
    Tone.Destination.volume.value = volumeValue;
};

// Function to get the current volume level
export const getMicVolumeLevel = () => {
    const db = meter.getValue();
    console.log("Mic db: ", db)
    return db;
};

export const openMic = async () => {
    try {
        await mic.open();
        isMicOpen = true;
        console.log("Microphone is open");

        mic.connect(micReverb);
        micReverb.connect(compressor);
        compressor.connect(meter);
        meter.toDestination();

        const gain = meter.output.value;
        console.log("Gain: ", gain);

        await micReverb.generate();

    } catch (error) {
        console.error("Error opening microphone:", error);
        isMicOpen = false;
    }
};

export const closeMic = () => {
    if (isMicOpen) {
        mic.disconnect(micReverb);
        micReverb.disconnect(compressor);
        compressor.disconnect(meter);

        mic.close();
        isMicOpen = false;
        console.log("Microphone is closed");
    }
};

export const setMicVolume = (volume) => {
    if (mic) {
        mic.volume.value = volume;
    }
};

export default { openMic, closeMic, setMicVolume, getMicVolumeLevel };

  