import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import NoSleep from 'nosleep.js';
import { 
  loadAudio, 
  initializeAudio, 
  playSample,
  increaseFilterBreathFrequency,
  increaseFilterDrumFrequency,
  setReverbWetLevel,
} from '../audio';
import '../tailwind.css';
import '../../public/styles/style.css';

import cl from '../../cloudinaryConfig';

const noSleep = new NoSleep();

const Main = ({selectedTime, selectSettlingTime }) => {
  // Initial State & Refs
  const [countdown, setCountdown] = useState(selectedTime * 60);
  const [countdownSettlingTime, setCountdownSettlingTime] = useState(selectSettlingTime * 60);
  const [isActiveST, setIsActiveST] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState('Press Start');

  const [audioReady, setAudioReady] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [BPM, setBPM] = useState(28);
  const [wetLevel, setWetLevel] = useState(0);
  const [filterLevelBreath, setFilterLevelBreath] = useState(250);
  const [filterLevelDrum, setFilterLevelDrum] = useState(125);

  const breathSamples = ["breath-1", "breath-2", "breath-3", "breath-4"];
  const drumSamples = ["ZT-sha-L", "ZT-sha-R"];

  const breathSampleIndex = useRef(0);
  const drumSampleIndex = useRef(0);
  const breathLoopRef = useRef(null);
  const drumLoopRef = useRef(null);

  let intervalId = useRef(null);
  let timeoutIdForBreath = useRef(null);
  let timeoutIdForDrum = useRef(null);
  
  // Utility & Helper Functions
  const getPlaybackRate = (currentBPM) => {
    return currentBPM / 30; // Assuming 30 BPM is the original BPM for your samples
  };

  function calculateDurationInSeconds(value) {
    const durationInSeconds = value * 60;
    return durationInSeconds;
}

  const adjustEffects = () => {
    const duration = calculateDurationInSeconds(selectSettlingTime);
    const decreaseRate = 10 / duration; // How much to decrease the BPM each second
    const quarterTime = (duration / 4);
    // * 1000; <- delay that can be added to quesrter time

    // Filter
    // Update filter frequency based on the remaining time
    const filterIncreaseBreath = (5000 - filterLevelBreath) / duration; // Going from 250hz to 5000hz
    const filterIncreaseDrum = (1000 - filterLevelDrum) / duration; // Going from 125hz to 6000hz

    intervalId.current = setInterval(() => {
      const elapsedTime = Tone.Transport.seconds;

      // Update Filters and Reverb based on quarterTime
      timeoutIdForBreath.current = setTimeout(() => {
          // Update Breath Filter
        setFilterLevelBreath(prevFilterBreath => {
          let newFilterBreath = filterLevelBreath;
          newFilterBreath = Math.min(prevFilterBreath + filterIncreaseBreath, 8000);
          increaseFilterBreathFrequency(newFilterBreath);
          return newFilterBreath;
        });
      }, quarterTime);  
  
      // Update Drum Filter
      timeoutIdForDrum.current = setTimeout(() => {
        setFilterLevelDrum(prevFilterDrum => {
          let newFilterDrum = filterLevelDrum;
          newFilterDrum = Math.min(prevFilterDrum + filterIncreaseDrum, 1000);
          increaseFilterDrumFrequency(newFilterDrum);
          return newFilterDrum;
        });
      }, quarterTime);

      const increasePerSecond = 1 / duration
      setWetLevel(prevWetLevel => {
        let currentWetLevel = wetLevel;
        currentWetLevel = Math.min(prevWetLevel + increasePerSecond, 1);
        setReverbWetLevel(currentWetLevel);
        return currentWetLevel;
      })
  
      // Update BPM
      setBPM(prevBPM => {
        let newBPM = BPM;
        newBPM = Math.max(prevBPM - decreaseRate, 10);
        Tone.Transport.bpm.setValueAtTime(newBPM, Tone.Transport.seconds);
        console.log("BPM: ", newBPM);
        return newBPM;
      });
      
  
      // Stop interval after duration
      if (elapsedTime >= duration) {
        clearInterval(intervalId.current);
      }
    }, 1000);
  };
  
  // SETTLING DOWN LOOPS
  const initiateLoops = () => {
    breathLoopRef.current = new Tone.Loop((time) => {
      const rate = getPlaybackRate(30);

      playSample(breathSamples[breathSampleIndex.current], rate);

      breathSampleIndex.current = (breathSampleIndex.current + 1) % breathSamples.length;
    }, "2n").start();

    drumLoopRef.current = new Tone.Loop((time) => {
      const rate = getPlaybackRate(30);
      playSample(drumSamples[drumSampleIndex.current], rate);

      drumSampleIndex.current = (drumSampleIndex.current + 1) % drumSamples.length;
    }, "8n").start();
  };

  const stopAndDisposeLoops = () => {
    if (breathLoopRef.current) {
      breathLoopRef.current.stop(0);
      breathLoopRef.current.dispose();
      breathLoopRef.current = null;
    }
    if (drumLoopRef.current) {
      drumLoopRef.current.stop(0);
      drumLoopRef.current.dispose();
      drumLoopRef.current = null;
    }
    breathSampleIndex.current = 0;
    drumSampleIndex.current = 0;
  };

  let delayStart;

  const toggleTimer = async () => {
    if (Tone && Tone.context && Tone.context.state !== 'running') {
      try {
        await Tone.context.resume();
      } catch (error) {
        console.error("Failed to resume the Tone audio context:", error);
        return;
      }
    }
    // Start
    if (!isActive) {
      noSleep.enable();
      adjustEffects();
      setIsActive(true); // Set the countdown active
      setIsActiveST(true);
      if (countdownSettlingTime > 4) {
        delayStart = setTimeout(() => {
          initiateLoops()
        }, 2000);
      }
      Tone.Transport.bpm.setValueAtTime(BPM, 0); // Setting BPM
      playSample("startGong");
      Tone.Transport.start();
      return () => clearTimeout(delayStart);
    } else {
      window.location.reload();
    }
  };

  // Countdown overall timer
  useEffect(() => {
    setCountdown(selectedTime * 60);
  }, [selectedTime]);

  // Countdown settling down timer
  useEffect(() => {
    setCountdownSettlingTime(selectSettlingTime * 60);
  }, [selectSettlingTime]);

  useEffect(() => {
    // This function will help us chain our promises for each audio load
    const loadAllAudios = async () => {
      try {
          await loadAudio("startGong", cl.url('startGong', { resource_type: 'video' }));
          await loadAudio("endGong", cl.url('endGong', { resource_type: 'video' }));
          await loadAudio("breath-1", cl.url('breath-1', { resource_type: 'video' }));
          await loadAudio("breath-2", cl.url('breath-2', { resource_type: 'video' }));
          await loadAudio("breath-3", cl.url('breath-3', { resource_type: 'video' }));
          await loadAudio("breath-4", cl.url('breath-4', { resource_type: 'video' }));
          await loadAudio("ZT-sha-L", cl.url('ZT-sha-L', { resource_type: 'video' }));
          await loadAudio("ZT-sha-R", cl.url('ZT-sha-R', { resource_type: 'video' }));
          setAudioReady(true);
      } catch (error) {
          console.error('Failed to load audio:', error);
      }
    };  
    loadAllAudios();
  }, []);

  useEffect(() => {
    let timer;
    if (isActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, isActive]);

  useEffect(() => {
    let settlingTimer;
    if (isActive && countdownSettlingTime > 0) {
      settlingTimer = setTimeout(() => setCountdownSettlingTime(countdownSettlingTime - 1), 1000);
    }
    return () => clearTimeout(settlingTimer);
  }, [countdownSettlingTime, isActive]);


  // Clears the interval (identified by intervalId.current) to prevent memory leaks upon component unmount.
  useEffect(() => {
    return () => {
        clearInterval(intervalId.current);
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setText(
        `Press Start to begin.\nSettling Down: ${Math.floor(countdownSettlingTime / 60)}:${countdownSettlingTime % 60 < 10 ? '0' : ''}${countdownSettlingTime % 60}`
      );      
    } else {
      if (countdown && countdownSettlingTime > 0) {
        setText(
          `Settling Down: ${Math.floor(countdownSettlingTime / 60)}:${countdownSettlingTime % 60 < 10 ? '0' : ''}${countdownSettlingTime % 60}`
        );
      } else if (countdown > 0 && countdownSettlingTime === 0) {
        setText('🧘');
      } 
    }
  }, [countdown, countdownSettlingTime, isActive])

  useEffect(() => {
    if (countdownSettlingTime === 0) {
      stopAndDisposeLoops();
      setIsActiveST(false);
      playSample("startGong");
      clearInterval(intervalId.current);
    }
  }, [countdownSettlingTime]);

  useEffect(() => { 
    const initialBPM = 30;
    if (isActive) {
      if (countdown === countdownSettlingTime) {
        setBPM(initialBPM);
        adjustEffects();
        Tone.Transport.bpm.setValueAtTime(BPM, 0); // Setting BPM
        playSample("startGong");
      }
      if (countdown === 0) {
        playSample("endGong", 1);
        clearInterval(intervalId.current);
        setText('🙏');
        Tone.Transport.stop();
        
        const autoReset = setTimeout(() => {
          noSleep.disable();
          window.location.reload();
        }, 10000);
  
        return () => clearTimeout(autoReset);

      }
    } 
  }, [countdown, countdownSettlingTime, isActive]); 

  return (
    <div className="flex-1 bg-dark flex items-center justify-center">
      <div className="text-center">
        {!audioInitialized ? (
          <>
            {/* Initialize Audio UI */}
            <div className="md:text-6xl sm:text-2xl mb-6">
              <h1 className='text-main font-bold'>Zen Time</h1>
              <div className='text-sec text-base'>
                  <p>
                    <br />
                    meditation timer with sound guidance
                    <br />
                  </p>
              </div>
            </div>
            <button
              onClick={() => {
                Promise.all([
                  initializeAudio("startGong"),
                  initializeAudio("endGong"),
                  initializeAudio("breath-1"),
                  initializeAudio("breath-2"),
                  initializeAudio("breath-3"),
                  initializeAudio("breath-4"),
                  initializeAudio("ZT-sha-L"),
                  initializeAudio("ZT-sha-R")
                ])
                .then(() => setAudioInitialized(true))
                .catch(error => console.error("Failed to initialize audio:", error));
              }}
              className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
            >
              Continue
            </button>
            {!audioReady && <p className='text-sec'>Loading audio...</p>}
          </>
        ) : (
          <>
            <div className="text-2xl mb-4 text-main">
              <p className="multiline-text">
                {text}
              </p>
            </div>
            {/* Timer UI */}
            <div className="text-9xl mb-4 text-main">
              <h1>{`${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? '0' : ''}${countdown % 60}`}</h1>
            </div>
            <button
              onClick={toggleTimer}
              className="mr-4 bg-sec hover:bg-ter text-ter hover:text-sec px-4 py-2 rounded"
            >
              {isActive ? 'Reset' : 'Start'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
