import { Player, start, getContext, Buffer } from "tone";

let player;
let audioBuffer;

export const loadAudio = async () => {
    try {
        audioBuffer = await Buffer.fromUrl("/samples/ZT-start-gong.mp3");
    } catch (error) {
        console.error("Error loading audio:", error);
    }
};

export const initializeAudio = async () => {
    try {
        await start();

        // Ensure context is not suspended
        if (getContext().state === "suspended") {
            await getContext().resume();
        }

        if (audioBuffer) {
            player = new Player(audioBuffer).toDestination();

            // Listen for errors
            player.on("error", (e) => {
                console.error("There was an error with the Player:", e);
            });
        } else {
            console.error("Audio buffer is not loaded.");
        }
    } catch (error) {
        console.error("Error initializing audio:", error);
    }
};

export const playSample = () => {
    if (player) {
        player.start();
    } else {
        console.error("Sample not loaded or player not initialized");
    }
};
