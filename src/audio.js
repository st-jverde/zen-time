import * as Tone from 'tone';

const { Player, start, getContext, Buffer } = Tone;

const players = {};
const audioBuffers = {};

export const loadAudio = async (sampleName, url) => {
    try {
        audioBuffers[sampleName] = await Buffer.fromUrl(url);
    } catch (error) {
        console.error(`Error loading audio for ${sampleName}:`, error);
        throw new Error(`Error loading audio for ${sampleName}: ${error.message}`);
    }
};

export const initializeAudio = async (sampleName, highpassEffect, reverbEffect) => {
    try {
        await start();
        
        if (getContext().state === "suspended") {
            await getContext().resume();
        }

        if (!players[sampleName] && audioBuffers[sampleName]) {
            players[sampleName] = new Player(audioBuffers[sampleName]).toDestination();
            players[sampleName].playbackRate = 1;
        } else if (!audioBuffers[sampleName]) {
            console.error(`Audio buffer for ${sampleName} is not loaded.`);
        }

        // Configure the reverb effect
        reverbEffect.decay = 1.5; // You can adjust the decay as needed
        await reverbEffect.generate();

        // Connect the player to the highpass filter (and thus through to the reverb)
        if (players[sampleName]) {
            players[sampleName].connect(highpassEffect);
        }

    } catch (error) {
        console.error(`Error initializing audio for ${sampleName}:`, error);
        throw new Error(`Error initializing audio for ${sampleName}: ${error.message}`);
    }
};

// Utility function to increase the filter frequency
export const increaseFilterFrequency = (highpass, value) => {
    if (highpass) {
        highpass.frequency.rampTo(value, 1); // 1 second ramp time, you can adjust
        console.log("Filter: " + value);
    } else {
        console.error('Highpass filter not initialized');
    }
};

// Utility function to set reverb wet level (0 is dry, 1 is fully wet)
export const setReverbWetLevel = (reverb, value) => {
    if (reverb) {
        reverb.wet.value = value;
        console.log("Reverb: " + value);
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
    console.log('Setting Volume:', volumeValue);
    Tone.Destination.volume.value = volumeValue;
};
  