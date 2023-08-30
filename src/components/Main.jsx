import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { loadAudio, initializeAudio, playSample } from '../audio';
import '../tailwind.css';

const Main = ({ selectedTime }) => {
    const [countdown, setCountdown] = useState(selectedTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [audioReady, setAudioReady] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);

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
                setAudioReady(true);
            } catch (error) {
                console.error('Failed to load audio:', error);
            }
        };
    
        loadAllAudios();
    }, []);
    

    // useEffect(() => {
    //     loadAudio()
    //         .then(() => {
    //             setAudioReady(true);
    //         })
    //         .catch(err => {
    //             console.error('Failed to load audio:', err);
    //         });
    // }, []);

    const toggleTimer = async () => {
        // Check if Tone is defined and if the audio context is not in a "running" state
        if (Tone && Tone.context && Tone.context.state !== 'running') {
            console.log("Tone.context.state:", Tone.context.state);
    
            try {
                // Attempt to resume the audio context
                await Tone.context.resume();
    
                // If successful, the context's state will now be "running"
                // You can optionally add an additional check here to ensure that it's really running, but it's typically not necessary after a successful resume
            } catch (error) {
                console.error("Failed to resume the Tone audio context:", error);
                return;  // If there's an error resuming, don't continue to play the sample or start the timer
            }
        }
        
        if (!isRunning) {
            playSample("startGong"); 
        }

        setIsRunning(!isRunning);
    };
    

    const resetTimer = () => {
        setIsRunning(false);
        setCountdown(selectedTime * 60);
    }

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    useEffect(() => {
        if (minutes === 0 && seconds === 0) {
            playSample("endGong");
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
                                    setAudioInitialized(true);
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
