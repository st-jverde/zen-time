import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { loadAudio, initializeAudio, playSample } from '../audio';
import '../tailwind.css';

const Main = ({ selectedTime }) => {
    const [countdown, setCountdown] = useState(selectedTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [audioReady, setAudioReady] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);
    const [currentBreathSample, setCurrentBreathSample] = useState("breath-1");
    const [currentDrumSample, setCurrentDrumSample] = useState("ZT-sha-L");

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
                await loadAudio("ZT-sha-L", "/samples/ZT-sha-L.mp3");
                await loadAudio("ZT-sha-R", "/samples/ZT-sha-R.mp3");
                setAudioReady(true);
            } catch (error) {
                console.error('Failed to load audio:', error);
            }
        };
    
        loadAllAudios();
    }, []);

    const initiateLoops = () => {
      // Ensure all previous loops are stopped and disposed of
      sampleLoopRef.current?.breathLoop?.stop(0)?.dispose();
      sampleLoopRef.current?.drumLoop?.stop(0)?.dispose();

      // Initialize and start your breathLoop
      const breathLoop = new Tone.Loop(time => {
        playSample(currentBreathSample);
        setCurrentBreathSample(
          prev => (prev === "breath-1" ? "breath-2" : "breath-1")
        );
      }, "1n");  // Loop every quarter-note

      // Initialize and start your drumLoop with a different timing
      const drumLoop = new Tone.Loop(time => {
        playSample(currentDrumSample);
        setCurrentDrumSample(
          prev => (prev === "ZT-sha-L" ? "ZT-sha-R" : "ZT-sha-L")
        );
      }, "0.5n");  // Loop every measure

      // Start the loops
      breathLoop.start(0);
      drumLoop.start(0);

      // Store the loops in a ref for later management/cleanup
      sampleLoopRef.current = {
        breathLoop,
        drumLoop
      };
    };

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

        if (!isRunning) {
            playSample("startGong");
        
            const delayStart = setTimeout(() => {
              initiateLoops();
            }, 6000);

            // Ensure loops are set before starting the transport
            Tone.Transport.start();

            // Clean up timeouts if component unmounts or other conditions apply
            return () => clearTimeout(delayStart);

        } else {
            // When pausing the timer, also stop the Transport to pause the loop.
            Tone.Transport.stop();

            // Directly stop and dispose of loops here
            sampleLoopRef.current?.breathLoop?.stop(0)?.dispose();
            sampleLoopRef.current?.drumLoop?.stop(0)?.dispose();
        }
    };
    
    const resetTimer = () => {
        setIsRunning(false);
        setCountdown(selectedTime * 60);
    }

    const stopAndDisposeLoops = () => {
      if (sampleLoopRef.current?.breathLoop) {
        sampleLoopRef.current.breathLoop.stop(0);
        sampleLoopRef.current.breathLoop.dispose();
      }
      if (sampleLoopRef.current?.drumLoop) {
        sampleLoopRef.current.drumLoop.stop(0);
        sampleLoopRef.current.drumLoop.dispose();
      }
    };

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    useEffect(() => {
        if (minutes === 0 && seconds === 4) {
          stopAndDisposeLoops();
        }
      }, [minutes, seconds]);    

      useEffect(() => {
        if (minutes === 0 && seconds === 0) {
          playSample("endGong");
          stopAndDisposeLoops();
          
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
                                                initializeAudio("ZT-sha-L").then(() => {
                                                    initializeAudio("ZT-sha-R").then(() => {
                                                        setAudioInitialized(true);
                                                    });
                                                });
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
