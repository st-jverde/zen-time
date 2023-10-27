import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { 
  loadAudio, 
  initializeAudio, 
  playSample,
  increaseFilterFrequency,
  setReverbWetLevel 
} from '../audio';
import '../tailwind.css';

const Main = ({ selectedTime }) => {
  const [countdown, setCountdown] = useState(selectedTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [BPM, setBPM] = useState(30);
  const [wetLevel, setWetLevel] = useState(0);
  const [filterLevel, setFilterLevel] = useState(60);


  const breathSamples = ["breath-1", "breath-2", "breath-3", "breath-4"];
  const drumSamples = ["ZT-sha-L", "ZT-sha-R"];

  const breathSampleIndex = useRef(0);
  const drumSampleIndex = useRef(0);
  const breathLoopRef = useRef(null);
  const drumLoopRef = useRef(null);

  let intervalId = useRef(null); // ID of the interval to clear it later

  const adjustEffects = () => {
    //BPM
    let currentBPM = BPM;
    // totalBPMChange = 20; // Change BPM from start 30 to 10
    const durationInSeconds = selectedTime * 60;
    const decreaseRate = 10 / durationInSeconds; // How much to decrease the BPM each second

    // Filter
    let currentFilter = filterLevel;

    // Update filter frequency based on the remaining time
    const filterIncrease = (1000 - 60) / durationInSeconds; // Going from 60hz to 20kHz

    //Reverb
    let currentWetLevel = wetLevel;
    // Calculate the increase per second based on the selected time
    const increasePerSecond = 1 / durationInSeconds
    // Calculate the current wet level based on the elapsed time

    intervalId.current = setInterval(() => {

      setFilterLevel((prevFilterLevel) => {
        currentFilter = prevFilterLevel + filterIncrease;
        if (currentFilter >= 20000) {
          clearInterval(intervalId.current);
          return 20000;
        }
        return currentFilter;
      })

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

      console.log("filterIncrease: ", filterIncrease);
      console.log("currentFilter: ", currentFilter);
      increaseFilterFrequency(currentFilter);

      // console.log("countdown: ", countdown);
      // console.log("durationInSeconds: ", durationInSeconds);
      // console.log("increasePerSecond: ", increasePerSecond);
      // console.log("elapsedTime: ", elapsedTime);
      console.log("wetLevel: ", currentWetLevel);
      setReverbWetLevel(currentWetLevel);

      // Update Tone.Transport's BPM
      Tone.Transport.bpm.setValueAtTime(currentBPM, Tone.Transport.seconds);
    }, 1000);
  };  

  const getPlaybackRate = (currentBPM) => {
    return currentBPM / 30; // Assuming 30 BPM is the original BPM for your samples
  };
  

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
          await loadAudio("breath-3", "/samples/breath-3.mp3");
          await loadAudio("breath-4", "/samples/breath-4.mp3");
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
    adjustEffects(); // start BPM adjustment

    Tone.Transport.bpm.setValueAtTime(BPM, 0); // Setting BPM
    playSample("startGong");
    const delayStart = setTimeout(() => initiateLoops(), 2000);
    Tone.Transport.start();
    return () => clearTimeout(delayStart);
  } else {
    clearInterval(intervalId.current);
    cleanupLoops();
    Tone.Transport.stop();
  }
};
const resetTimer = () => {
  setIsRunning(false);
  setCountdown(selectedTime * 60);
  cleanupLoops();
  clearInterval(intervalId.current);
  setBPM(30);
  setFilterLevel(60);
  setWetLevel(0);
  Tone.Transport.stop();
};
// cleanup on component unmount
useEffect(() => {
  return () => {
      clearInterval(intervalId.current);
  };
}, []);

  useEffect(() => {
    if (countdown === 4) stopAndDisposeLoops();
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      playSample("endGong", 1);
      stopAndDisposeLoops();
      clearInterval(intervalId.current);

      const autoReset = setTimeout(() => {
        setIsRunning(false);
        setCountdown(selectedTime * 60);
        setBPM(30);
        setFilterLevel(60);
        setWetLevel(0);
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
            <p className='px-4 text-sec'>{BPM}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
