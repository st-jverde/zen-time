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

  const toggleTimer = async () => {
    if (Tone && Tone.context && Tone.context.state !== 'running') {
      try {
        await Tone.context.resume();
      } catch (error) {
        console.error("Failed to resume the Tone audio context:", error);
        return;
      }
    }

    setIsRunning(!isRunning);

    if (!isRunning) {
      playSample("startGong");  // Ensure playback rate is acceptable
      const delayStart = setTimeout(() => initiateLoops(), 6000);
      Tone.Transport.start();

      return () => clearTimeout(delayStart);
    } else {
      // Cleaning up any active loops/intervals if pausing
      cleanupLoops();
    }
  };

  const initiateLoops = () => {
    const breathInterval = setInterval(() => {
        playSample(currentBreathSample, 1);
        setCurrentBreathSample(
          prev => (prev === "breath-1" ? "breath-2" : "breath-1")
        );
    }, 8000);  // 8000ms = 8s
    const drumInterval = setInterval(() => {
        playSample(currentDrumSample, 1);
        setCurrentDrumSample(
          prev => (prev === "ZT-sha-L" ? "ZT-sha-R" : "ZT-sha-L")
        );
    }, 2000);  // 2000ms = 2s
    // Store the intervals in a ref for later cleanup
    sampleLoopRef.current = {
        breathInterval,
        drumInterval
    };
  };

  const cleanupLoops = () => {
    clearInterval(sampleLoopRef.current?.breathInterval);
    clearInterval(sampleLoopRef.current?.drumInterval);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCountdown(selectedTime * 60);
  };

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

  useEffect(() => {
    if (countdown === 4) stopAndDisposeLoops();
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      playSample("endGong", 1);
      stopAndDisposeLoops();

      const autoReset = setTimeout(() => {
        setIsRunning(false);
        setCountdown(selectedTime * 60);
      }, 10000);

      return () => clearTimeout(autoReset);
    }
  }, [countdown]);

  return (
    <div className="flex-1 ml-64 bg-dark flex items-center justify-center">
      <div className="text-center">
        {!audioInitialized ? (
          <>
            {/* Initialize Audio UI */}
            <div className="text-9xl mb-6">
              <h1 className='text-main'>Welcome</h1>
            </div>
            <button
              onClick={() => {
                Promise.all([
                  initializeAudio("startGong"),
                  initializeAudio("endGong"),
                  initializeAudio("breath-1"),
                  initializeAudio("breath-2"),
                  initializeAudio("ZT-sha-L"),
                  initializeAudio("ZT-sha-R")
                ])
                .then(() => setAudioInitialized(true))
                .catch(error => console.error("Failed to initialize audio:", error));
              }}
              className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
            >
              Get ready to start
            </button>
            {!audioReady && <p>Loading audio...</p>}
          </>
        ) : (
          <>
            {/* Timer UI */}
            <div className="text-9xl mb-4 text-main">
              <h1>{`${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? '0' : ''}${countdown % 60}`}</h1>
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
