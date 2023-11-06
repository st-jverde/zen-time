import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import NoSleep from 'nosleep.js';

import { 
  loadAudio, 
  initializeAudio, 
  playSample,
  increaseFilterBreathFrequency,
  increaseFilterDrumFrequency,
  setReverbWetLevel 
} from '../audio';
import '../tailwind.css';

import startGong from '../samples/ZT-start-gong.mp3';
import endGong from '../samples/ZT-end-gong.mp3';
import breath1 from '../samples/breath-1.mp3';
import breath2 from '../samples/breath-2.mp3';
import breath3 from '../samples/breath-3.mp3';
import breath4 from '../samples/breath-4.mp3';
import ZTShaL from '../samples/ZT-sha-L.mp3';
import ZTShaR from '../samples/ZT-sha-R.mp3';

const noSleep = new NoSleep();

const Main = ({ selectedTime, selectSettlingTime }) => {
  // Initial State & Refs
  const [countdown, setCountdown] = useState(selectedTime * 60);
  // const [isRunning, setIsRunning] = useState(false);
  const [countdownSettlingTime, setCountdownSettlingTime] = useState(selectSettlingTime * 60);
  const [isActiveST, setIsActiveST] = useState(false);

  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState('Press Start');

  const [audioReady, setAudioReady] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [BPM, setBPM] = useState(30);
  const [wetLevel, setWetLevel] = useState(0);
  const [filterLevelBreath, setFilterLevelBreath] = useState(200);
  const [filterLevelDrum, setFilterLevelDrum] = useState(80);

  const breathSamples = ["breath-1", "breath-2", "breath-3", "breath-4"];
  const drumSamples = ["ZT-sha-L", "ZT-sha-R"];

  const breathSampleIndex = useRef(0);
  const drumSampleIndex = useRef(0);
  const breathLoopRef = useRef(null);
  const drumLoopRef = useRef(null);

  let intervalId = useRef(null); // ID of the interval to clear it later

  // Utility & Helper Functions
  const getPlaybackRate = (currentBPM) => {
    return currentBPM / 30; // Assuming 30 BPM is the original BPM for your samples
  };

  const adjustEffects = () => {
    //BPM
    let currentBPM = 30;
    // totalBPMChange = 20; // Change BPM from start 30 to 10
    const durationInSeconds = selectSettlingTime * 60;
    const decreaseRate = 10 / durationInSeconds; // How much to decrease the BPM each second

    // Variable for when you want to start it halfway the selected time
    // const halfTime = (durationInSeconds / 2) * 1000;
    const quarterTime = (durationInSeconds / 4) * 1000;

    // Filter
    let currentFilterBreath = filterLevelBreath;
    let currentFilterDrum = filterLevelDrum;

    // Update filter frequency based on the remaining time
    const filterIncreaseBreath = (5000 - currentFilterBreath) / durationInSeconds; // Going from 100hz to 5000hz
    const filterIncreaseDrum = (1000 - currentFilterDrum) / durationInSeconds; // Going from 100hz to 6000hz

    intervalId.current = setInterval(() => {

      // Breath filter
      setTimeout(() => {
        setFilterLevelBreath((prevFilterLevel) => {
          currentFilterBreath = prevFilterLevel + filterIncreaseBreath;
          if (currentFilterBreath >= 8000) {
            clearInterval(intervalId.current);
            return 8000;
        }
        return currentFilterBreath;
        })
      }, quarterTime);

      // Drum Filter
      setTimeout(() => {
        setFilterLevelDrum((prevFilterLevel) => {
          currentFilterDrum = prevFilterLevel + filterIncreaseDrum;
          if (currentFilterDrum >= 1000) {
            clearInterval(intervalId.current);
            return 1000;
        }
        return currentFilterDrum;
        })
      }, quarterTime);

      //Reverb
      let currentWetLevel = wetLevel;
      // Calculate the increase per second based on the selected time
      const increasePerSecond = 1 / durationInSeconds
      
      setWetLevel((prevWetLevel) => {
        currentWetLevel = prevWetLevel + increasePerSecond;
        if (currentWetLevel >= 1) {
          clearInterval(intervalId.current);
          return 1;
        }
        return currentWetLevel
      })

      setBPM((prevBPM) => {
        currentBPM = prevBPM - decreaseRate;
        if (currentBPM <= 10) {
          clearInterval(intervalId.current);
          return 10;
        }
        return currentBPM;
      });
      console.log("BPM: ", currentBPM);
      
      console.log("filterIncrease breath: ", filterIncreaseBreath);
      console.log("currentFilter breath: ", currentFilterBreath);
      increaseFilterBreathFrequency(currentFilterBreath);

      console.log("filterIncrease Drum: ", filterIncreaseDrum);
      console.log("currentFilter Drum: ", currentFilterDrum);
      increaseFilterDrumFrequency(currentFilterDrum);

      console.log("wetLevel: ", currentWetLevel);
      setReverbWetLevel(currentWetLevel);

      // Update Tone.Transport's BPM
      Tone.Transport.bpm.setValueAtTime(currentBPM, Tone.Transport.seconds);
    }, 1000);
  }; 
  
  const initiateLoops = () => {
    breathLoopRef.current = new Tone.Loop((time) => {
      const rate = getPlaybackRate(BPM);

      playSample(breathSamples[breathSampleIndex.current], rate);

      breathSampleIndex.current = (breathSampleIndex.current + 1) % breathSamples.length;
    }, "2n").start();

    drumLoopRef.current = new Tone.Loop((time) => {
      const rate = getPlaybackRate(BPM);
      playSample(drumSamples[drumSampleIndex.current], rate);

      drumSampleIndex.current = (drumSampleIndex.current + 1) % drumSamples.length;
    }, "8n").start();
  };

  const cleanupLoops = () => {
    breathLoopRef.current?.stop(0);
    drumLoopRef.current?.stop(0);
    breathSampleIndex.current = 0;
    drumSampleIndex.current = 0;
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

  // const toggleTimer = async () => {
  //   if (Tone && Tone.context && Tone.context.state !== 'running') {
  //     try {
  //       await Tone.context.resume();
  //     } catch (error) {
  //       console.error("Failed to resume the Tone audio context:", error);
  //       return;
  //     }
  //   }
  //   setIsRunning(!isActive);
  //   if (!isActive) {
  //     adjustEffects(); // start BPM/FX adjustment

  //     Tone.Transport.bpm.setValueAtTime(BPM, 0); // Setting BPM
  //     playSample("startGong");
  //     const delayStart = setTimeout(() => initiateLoops(), 2000);
  //     Tone.Transport.start();
  //     return () => clearTimeout(delayStart);
  //   } else {
  //     clearInterval(intervalId.current);
  //     cleanupLoops();
  //     Tone.Transport.stop();
  //   }
  // };

  const toggleTimer = async () => {
    if (Tone && Tone.context && Tone.context.state !== 'running') {
      try {
        await Tone.context.resume();
      } catch (error) {
        console.error("Failed to resume the Tone audio context:", error);
        return;
      }
    }
    if (!isActive) {
      setIsActive(true); // Set the countdown active
      setIsActiveST(true);
      noSleep.enable();
      adjustEffects(); // start BPM/FX adjustment
      Tone.Transport.bpm.setValueAtTime(BPM, 0); // Setting BPM
      playSample("startGong");
      const delayStart = setTimeout(() => initiateLoops(), 2000);
      Tone.Transport.start();
      return () => clearTimeout(delayStart);
    } else {
      setIsActive(false); // Set the countdown inactive
      clearInterval(intervalId.current);
      cleanupLoops();
      Tone.Transport.stop();
      noSleep.disable();
    }
};


const resetTimer = () => {
  const newBPM = 30;
  setIsActive(false)
  setCountdown(selectedTime * 60);
  setCountdownSettlingTime(selectSettlingTime * 60);
  clearInterval(intervalId.current);
  stopAndDisposeLoops(); // stop the audio loops
  Tone.Transport.stop();
  setBPM(newBPM);
  Tone.Transport.bpm.setValueAtTime(newBPM, Tone.now());
  setFilterLevelDrum(80);
  setFilterLevelBreath(200);
  setWetLevel(0);
};


  // useEffect Hooks
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
          await loadAudio("startGong", startGong);
          await loadAudio("endGong", endGong);
          await loadAudio("breath-1", breath1);
          await loadAudio("breath-2", breath2);
          await loadAudio("breath-3", breath3);
          await loadAudio("breath-4", breath4);
          await loadAudio("ZT-sha-L", ZTShaL);
          await loadAudio("ZT-sha-R", ZTShaR);
          setAudioReady(true);
      } catch (error) {
          console.error('Failed to load audio:', error);
      }
    };  
    loadAllAudios();
  }, []);

  // Settling down countdown timer
  // useEffect(() => {
  //   let timerST;  
  //   if (isRunningST && countdownSettlingTime > 0) {
  //     timerST = setInterval(() => {
  //       setCountdownSettlingTime((prevCountdownST) => prevCountdownST - 1);
  //     }, 1000);
  //   } else {
  //     setIsRunningST(false);
  //   }
  //   return () => clearInterval(timerST);
  // }, [isRunningST, countdownSettlingTime]);

  // // Countdown overall time
  // useEffect(() => {
  //   let timer;
  //   if (isRunning && countdown > 0) {
  //       timer = setInterval(() => {
  //           setCountdown((prevCountdown) => prevCountdown - 1);
  //       }, 1000);
  //   } else {
  //       setIsRunning(false);
  //   }
  //   return () => clearInterval(timer);
  // }, [isRunning, countdown]);


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
      setText('Press Start to begin');
    } else {
      if (countdown && countdownSettlingTime > 0) {
        setText(`Settling time: ${selectSettlingTime} min`);
      } else if (countdown > 0 && countdownSettlingTime === 0) {
        setText('🧘');
      } 
    }
  }, [countdown, countdownSettlingTime, isActive])

  useEffect(() => {
    if (countdownSettlingTime === 0) {
      playSample("startGong");
    }
  }, [countdownSettlingTime]);


  useEffect(() => { 
    const newBPM = 30;
    if (isActive) {
      if (countdown === countdownSettlingTime) {
        setBPM(newBPM);
        playSample("startGong");
        initiateLoops();
      }
      if (countdownSettlingTime === 4) {
        stopAndDisposeLoops();
      }
      if (countdown === 0) {
        playSample("endGong", 1);
        clearInterval(intervalId.current);
        setText('🙏');
        
        const autoReset = setTimeout(() => {
          setIsActive(false);
          stopAndDisposeLoops();
          Tone.Transport.stop();
          setCountdown(selectedTime * 60);
          setCountdownSettlingTime(selectSettlingTime * 60);
          setBPM(newBPM);
          Tone.Transport.bpm.setValueAtTime(newBPM, Tone.now());
          setFilterLevelDrum(80);
          setFilterLevelBreath(200);
          setWetLevel(0);
        }, 10000);
  
        return () => clearTimeout(autoReset);

      }
    } 
  }, [countdown, countdownSettlingTime, isActive]);
  

  // useEffect(() => {
  //   if (countdownSettlingTime === 4) stopAndDisposeLoops();
  // }, [countdownSettlingTime]);

  // useEffect(() => {
  //   if (countdownSettlingTime === 0) {
  //     playSample("startGong", 1);
  //     stopAndDisposeLoops();
  //     clearInterval(intervalId.current);
  //     setIsRunningST(false);
  //   }
  // }, [countdownSettlingTime]);

  // useEffect(() => {
  //   if (countdown === 0) {
  //     playSample("endGong", 1);
  //     stopAndDisposeLoops();
  //     clearInterval(intervalId.current);
  //     setIsRunning(false);

  //     const autoReset = setTimeout(() => {
  //       setCountdown(selectedTime * 60);
  //       setBPM(30);
  //       setFilterLevelDrum(80);
  //       setFilterLevelBreath(200);
  //       setWetLevel(0);
  //     }, 10000);

  //     return () => clearTimeout(autoReset);
  //   }
  // }, [countdown]);

  return (
    <div className="flex-1 bg-dark flex items-center justify-center">
      <div className="text-center">
        {!audioInitialized ? (
          <>
            {/* Initialize Audio UI */}
            <div className="md:text-6xl sm:text-2xl mb-6">
              <h1 className='text-main'>Welcome to Zen Time</h1>
              <div className='text-sec text-base'>
                  <p>
                    <br />
                    A meditation timer with sound guidance
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
              Get ready to begin & enjoy 🙏
            </button>
            {!audioReady && <p className='text-sec'>Loading audio...</p>}
          </>
        ) : (
          <>
            <div className="text-2xl mb-4 text-main">
              <p>
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
              {isActive ? 'Pause' : 'Start'}
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
