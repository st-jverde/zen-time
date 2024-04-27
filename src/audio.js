import * as Tone from 'tone';

const { Player, start, getContext, Buffer } = Tone;

const players = {};
const audioBuffers = {};
let reverb;
let highpassBreath;
let highpassDrum;

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
        Tone.Destination.volume.value = -1;
        // vol = new Tone.Volume(-6);

        //highpassDrum
        highpassDrum = new Tone.Filter(125, "highpass");

        // Create highpassBreath filter
        highpassBreath = new Tone.Filter(250, "highpass"); // Start at 200Hz

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
                    reverb.toDestination();
                    break;
                case "ZT-sha-L":
                case "ZT-sha-R":
                    players[sampleName].connect(highpassDrum);
                    highpassDrum.connect(reverb);
                    reverb.toDestination();
                    break;
                default:
                    players[sampleName].connect(reverb);
                    reverb.toDestination();
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

// Utility to set global volume
// export const setGlobalVolume = (volumeValue) => {
//     Tone.Destination.volume.value = volumeValue;
// };

  