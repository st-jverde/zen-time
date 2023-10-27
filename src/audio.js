import * as Tone from 'tone';

const { Player, start, getContext, Buffer } = Tone;

const players = {};
const audioBuffers = {};
let reverb, highpass; 

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

        // Create highpass filter
        highpass = new Tone.Filter(60, "highpass") // Start at 60Hz

        // Create and configure reverb effect
        reverb = new Tone.Reverb(4)
        await reverb.generate();

        if (!players[sampleName] && audioBuffers[sampleName]) {
            players[sampleName] = new Player(audioBuffers[sampleName])
            players[sampleName].playbackRate = 1;

            // Ensure the sample is disconnected from any nodes it might be connected to
            // players[sampleName].disconnect();

            if (sampleName === "endGong") {
                players[sampleName].toDestination();
            } else {
                players[sampleName].connect(highpass);
                highpass.connect(reverb);
                reverb.toDestination();
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
export const increaseFilterFrequency = (value) => {
    if (highpass) {
        highpass.frequency.rampTo(value, 10); // 1 second ramp time, you can adjust
    } else {
        console.error('Highpass filter not initialized');
    }
};

// Utility function to set reverb wet level (0 is dry, 1 is fully wet)
export const setReverbWetLevel = (value) => {
    if (reverb) {
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
export const setGlobalVolume = (volumeValue) => {
    Tone.Destination.volume.value = volumeValue;
};
  