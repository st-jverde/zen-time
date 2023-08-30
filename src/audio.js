import { Player, start, getContext, Buffer } from "tone";

const players = {};
const audioBuffers = {};

export const loadAudio = async (sampleName, url) => {
    try {
        audioBuffers[sampleName] = await Buffer.fromUrl(url);
    } catch (error) {
        console.error(`Error loading audio for ${sampleName}:`, error);
    }
};

export const initializeAudio = async (sampleName) => {
    try {
        await start();

        // Ensure context is not suspended
        if (getContext().state === "suspended") {
            await getContext().resume();
        }

        if (audioBuffers[sampleName]) {
            players[sampleName] = new Player(audioBuffers[sampleName]).toDestination();

            // Listen for errors
            players[sampleName].on("error", (e) => {
                console.error(`There was an error with the Player for ${sampleName}:`, e);
            });
        } else {
            console.error(`Audio buffer for ${sampleName} is not loaded.`);
        }
    } catch (error) {
        console.error(`Error initializing audio for ${sampleName}:`, error);
    }
};

export const playSample = (sampleName) => {
    if (players[sampleName]) {
        players[sampleName].start();
    } else {
        console.error(`Sample ${sampleName} not loaded or player not initialized`);
    }
};
