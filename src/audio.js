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

export const initializeAudio = async (sampleName) => {
    try {
        await start();
        
        if (getContext().state === "suspended") {
            await getContext().resume();
        }

        if (!players[sampleName] && audioBuffers[sampleName]) {
            players[sampleName] = new Player(audioBuffers[sampleName]).toDestination();
        } else if (!audioBuffers[sampleName]) {
            console.error(`Audio buffer for ${sampleName} is not loaded.`);
        }
    } catch (error) {
        console.error(`Error initializing audio for ${sampleName}:`, error);
        throw new Error(`Error initializing audio for ${sampleName}: ${error.message}`);
    }
};

export const playSample = (sampleName, onEndCallback) => {
    if (players[sampleName]) {
        if (Tone.getContext().state !== "running") {
            console.warn("Tone context is not in 'running' state.");
            return;
        }
        players[sampleName].start();

        if (onEndCallback) {
            players[sampleName].onended = onEndCallback;
        }
    } else {
        console.error(`Sample ${sampleName} not loaded or player not initialized`);
    }
};

// Utility to set global volume
export const setGlobalVolume = (volumeValue) => {
  Tone.Destination.volume.value = volumeValue;
};
  