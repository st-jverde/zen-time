import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { loadAudio, initializeAudio, playSample } from '../audio';
import '../tailwind.css';

const Main = ({ selectedTime }) => {
    const [countdown, setCountdown] = useState(selectedTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [audioReady, setAudioReady] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);

    const sampleLoopRef = useRef(null);

    useEffect(() => {
        setCountdown(selectedTime * 60);
    }, [selectedTime]);

    useEffect(() => {
        let timer;
        if (isRunning && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else {
            setIsRunning(false);
        }
        return () => clearInterval(timer);
    }, [isRunning, countdown]);

    useEffect(() => {
        // This function will help us chain our promises for each audio load
        const loadAllAudios = async () => {
            try {
                await loadAudio("startGong", "/samples/ZT-start-gong.mp3");
                await loadAudio("endGong", "/samples/ZT-end-gong.mp3");
                await loadAudio("breath-1", "/samples/breath-1.mp3");
                await loadAudio("breath-2", "/samples/breath-2.mp3");
                setAudioReady(true);
            } catch (error) {
                console.error('Failed to load audio:', error);
            }
        };
    
        loadAllAudios();
    }, []);

    const toggleTimer = async () => {
        // Check if Tone is defined and if the audio context is not in a "running" state
        if (Tone && Tone.context && Tone.context.state !== 'running') {
            console.log("Tone.context.state:", Tone.context.state);
    
            try {
                // Attempt to resume the audio context
                await Tone.context.resume();
            } catch (error) {
                console.error("Failed to resume the Tone audio context:", error);
                return;  // If there's an error resuming, don't continue to play the sample or start the timer
            }
        }
        // Toggle timer:    
        setIsRunning(!isRunning);

        let currentSample = "breath-1";  // Start with "breath-1"
    
        if (!isRunning) {
            playSample("startGong");
            
            const playBreath = setTimeout(() => {
                Tone.loaded().then(() => {
                    const loopDuration = 0.75 * 8; // 0.75 seconds/beat * 4 beats = 3 seconds
        
                    const loop = new Tone.Loop(() => {
                        playSample(currentSample); 
                        // Toggle between 'breath-1' and 'breath-2'
                        currentSample = currentSample === "breath-1" ? "breath-2" : "breath-1";
                    }, loopDuration);
                    loop.start(0)

                    sampleLoopRef.current = loop; // Store the loop in the ref

                    // Start the Transport to make the Loop run
                    Tone.Transport.start();
                }); 
            }, 6000);

            return () => clearTimeout(playBreath);

        } else {
            // When pausing the timer, also stop the Transport to pause the loop.
            Tone.Transport.stop();

            if (sampleLoopRef.current) {
                sampleLoopRef.current.stop(0); // the 0 indicates it stops immediately
            }
            
        }
    };
    
    const resetTimer = () => {
        setIsRunning(false);
        setCountdown(selectedTime * 60);
    }

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    useEffect(() => {
        if (minutes === 0 && seconds === 4) {
            if (sampleLoopRef.current) {
                sampleLoopRef.current.stop(0);
            }
        }
    }, [minutes, seconds]);    

    useEffect(() => {
        if (minutes === 0 && seconds === 0) {
            playSample("endGong");
            
            // Start a 10-second timeout
            const autoReset = setTimeout(() => {
                setIsRunning(false);
                setCountdown(selectedTime * 60);
            }, 10000);  // 10000ms = 10s
    
            // Clear the timeout if the component unmounts
            return () => clearTimeout(autoReset);
        }
    }, [minutes, seconds]);
    
    

    return (
        <div className="flex-1 ml-64 bg-dark flex items-center justify-center">
            <div className="text-center">
                {!audioInitialized ? (
                    // Display the "Initialize Audio" button when audio is not initialized
                    <>
                        <div className="text-9xl mb-6">
                            <h1 className='text-main'>
                                Welcome
                            </h1>
                        </div>
                        <button 
                           onClick={() => {
                                // Initialize the audio for both samples when the button is clicked
                                initializeAudio("startGong").then(() => {
                                    initializeAudio("endGong").then(() => {
                                        initializeAudio("breath-1").then(() => {
                                            initializeAudio("breath-2").then(() => {
                                                setAudioInitialized(true);
                                            });
                                        });
                                    });
                                });
                            }}
                            className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
                        >
                            Get ready to start
                        </button>
                        {!audioReady && <p>Loading audio...</p>}
                    </>
                ) : (
                    // Display the timer and control buttons once the audio is initialized
                    <>
                        <div className="text-9xl mb-4 text-main">
                            <h1 className='text-main'>
                                {`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`}
                            </h1>
                        </div>
                        <button
                            onClick={toggleTimer}
                            className="mr-4 bg-sec hover:bg-ter text-ter hover:text-sec px-4 py-2 rounded"
                        >
                            {isRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
                        >
                            Reset
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Main;
