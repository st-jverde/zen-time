import { useRef, useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import NoSleep from 'nosleep.js';
import {
  playSample,
  stopAllSamples,
  handleDroneVolume,
  increaseFilterBreathFrequency,
  increaseFilterDrumFrequency,
  setReverbWetLevel,
  resetEffectsToDefaults,
} from '../audio';

const noSleep = new NoSleep();

const breathSamples = ['breath-1', 'breath-2', 'breath-3', 'breath-4'];
const drumSamples = ['ZT-sha-L', 'ZT-sha-R'];
const droneSamples = ['ZT-drone-1', 'ZT-drone-2'];

function getPlaybackRate(currentBPM) {
  return currentBPM / 30;
}

export function useMeditationSession({ selectedTime, selectSettlingTime, isDroneOn }) {
  const [countdown, setCountdown] = useState(() => selectedTime * 60);
  const [countdownSettlingTime, setCountdownSettlingTime] = useState(() => selectSettlingTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState('Press Start');

  const [droneVolumeDownActive, setDroneVolumeDownActive] = useState(false);

  const breathSampleIndex = useRef(0);
  const drumSampleIndex = useRef(0);
  const breathLoopRef = useRef(null);
  const drumLoopRef = useRef(null);
  const droneLoopRef = useRef(null);
  const droneLoopRef60 = useRef(null);

  const settlingRepeatIdRef = useRef(null);
  const secondPhaseIntervalRef = useRef(null);
  const lastPhaseIntervalRef = useRef(null);
  const breathDelayTimeoutRef = useRef(null);
  const endSessionTimeoutRef = useRef(null);
  const playedEndGongRef = useRef(false);
  const settlingZeroHandledRef = useRef(false);
  const countdown60HandledRef = useRef(false);
  const countdown2HandledRef = useRef(false);

  const bpmRef = useRef(30);
  const wetRef = useRef(0);
  const breathFRef = useRef(200);
  const drumFRef = useRef(60);
  const droneVolRef = useRef(-30);
  const isDroneOnRef = useRef(isDroneOn);

  useEffect(() => {
    isDroneOnRef.current = isDroneOn;
  }, [isDroneOn]);

  const clearSettlingRepeat = useCallback(() => {
    if (settlingRepeatIdRef.current != null) {
      Tone.Transport.clear(settlingRepeatIdRef.current);
      settlingRepeatIdRef.current = null;
    }
  }, []);

  const cleanupDroneLoops = useCallback(() => {
    droneLoopRef.current?.stop(0);
    droneLoopRef60.current?.stop(0);
  }, []);

  const stopAndDisposeDroneLoops = useCallback(() => {
    if (droneLoopRef.current) {
      droneLoopRef.current.stop(0);
      droneLoopRef.current.dispose();
      droneLoopRef.current = null;
    }
    if (droneLoopRef60.current) {
      droneLoopRef60.current.stop(0);
      droneLoopRef60.current.dispose();
      droneLoopRef60.current = null;
    }
  }, []);

  const stopAndDisposeLoops = useCallback(() => {
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
  }, []);

  const droneLoops = useCallback(() => {
    droneLoopRef.current = new Tone.Loop(() => {
      playSample(droneSamples[0], 0.67);
    }, '1n').start('+1');

    droneLoopRef60.current = new Tone.Loop(() => {
      playSample(droneSamples[1], 0.67);
    }, '4n').start();
  }, []);

  const initiateLoops = useCallback(() => {
    breathLoopRef.current = new Tone.Loop(() => {
      const rate = getPlaybackRate(30);
      playSample(breathSamples[breathSampleIndex.current], rate);
      breathSampleIndex.current = (breathSampleIndex.current + 1) % breathSamples.length;
    }, '2n').start();

    drumLoopRef.current = new Tone.Loop(() => {
      const rate = getPlaybackRate(30);
      playSample(drumSamples[drumSampleIndex.current], rate);
      drumSampleIndex.current = (drumSampleIndex.current + 1) % drumSamples.length;
    }, '8n').start();
  }, []);

  const applyDroneVolume = useCallback((db) => {
    if (isDroneOnRef.current) {
      handleDroneVolume(db);
    } else {
      handleDroneVolume(-100);
    }
  }, []);

  const startSettlingAutomation = useCallback(() => {
    clearSettlingRepeat();

    const durationSec = selectSettlingTime * 60;
    if (durationSec <= 0) {
      return;
    }

    const decreaseRate = 10 / durationSec;
    const breathInc = (8000 - 200) / durationSec;
    const drumInc = (1000 - 60) / durationSec;
    const endVolumeFirstPhase = -9;
    const volPerSec = (endVolumeFirstPhase - -30) / durationSec;

    bpmRef.current = 30;
    wetRef.current = 0;
    breathFRef.current = 200;
    drumFRef.current = 60;
    droneVolRef.current = -30;

    let tick = 0;
    const id = Tone.Transport.scheduleRepeat(() => {
      tick += 1;
      if (tick > durationSec) {
        clearSettlingRepeat();
        return;
      }

      droneVolRef.current = Math.min(droneVolRef.current + volPerSec, endVolumeFirstPhase);
      applyDroneVolume(droneVolRef.current);

      wetRef.current = Math.min(wetRef.current + 1 / durationSec, 1);
      setReverbWetLevel(wetRef.current);

      breathFRef.current = Math.min(breathFRef.current + breathInc, 8000);
      increaseFilterBreathFrequency(breathFRef.current);

      drumFRef.current = Math.min(drumFRef.current + drumInc, 1000);
      increaseFilterDrumFrequency(drumFRef.current);

      bpmRef.current = Math.max(bpmRef.current - decreaseRate, 10);
      Tone.Transport.bpm.setValueAtTime(bpmRef.current, Tone.Transport.seconds);
    }, '1s', '1s');

    settlingRepeatIdRef.current = id;
  }, [applyDroneVolume, clearSettlingRepeat, selectSettlingTime]);

  const clearPhaseIntervals = useCallback(() => {
    if (secondPhaseIntervalRef.current != null) {
      clearInterval(secondPhaseIntervalRef.current);
      secondPhaseIntervalRef.current = null;
    }
    if (lastPhaseIntervalRef.current != null) {
      clearInterval(lastPhaseIntervalRef.current);
      lastPhaseIntervalRef.current = null;
    }
  }, []);

  const volumeDownSecondPhase = useCallback(() => {
    clearPhaseIntervals();
    const remainingTime = selectedTime * 60 - selectSettlingTime * 60;
    if (remainingTime <= 0) {
      return;
    }

    const endVolumeSecondPhase = -80;
    const rate = (endVolumeSecondPhase - droneVolRef.current) / remainingTime;

    secondPhaseIntervalRef.current = setInterval(() => {
      droneVolRef.current = Math.max(droneVolRef.current + rate, endVolumeSecondPhase);
      applyDroneVolume(droneVolRef.current);

      if (droneVolRef.current <= endVolumeSecondPhase + 0.01) {
        if (secondPhaseIntervalRef.current != null) {
          clearInterval(secondPhaseIntervalRef.current);
          secondPhaseIntervalRef.current = null;
        }
        droneVolRef.current = -35;
      }
    }, 1000);
  }, [applyDroneVolume, selectedTime, selectSettlingTime, clearPhaseIntervals]);

  const volumeUpEnd = useCallback(() => {
    droneVolRef.current = -35;
    clearPhaseIntervals();

    const endVolumeLastPhase = -12;
    const rate = (endVolumeLastPhase - droneVolRef.current) / 60;

    lastPhaseIntervalRef.current = setInterval(() => {
      droneVolRef.current = Math.min(droneVolRef.current + rate, endVolumeLastPhase);
      applyDroneVolume(droneVolRef.current);

      if (droneVolRef.current >= endVolumeLastPhase - 0.01) {
        if (lastPhaseIntervalRef.current != null) {
          clearInterval(lastPhaseIntervalRef.current);
          lastPhaseIntervalRef.current = null;
        }
      }
    }, 1000);
  }, [applyDroneVolume, clearPhaseIntervals]);

  const performSoftReset = useCallback(() => {
    clearSettlingRepeat();
    clearPhaseIntervals();
    clearTimeout(breathDelayTimeoutRef.current);
    breathDelayTimeoutRef.current = null;
    clearTimeout(endSessionTimeoutRef.current);
    endSessionTimeoutRef.current = null;

    stopAndDisposeLoops();
    stopAndDisposeDroneLoops();
    cleanupDroneLoops();

    stopAllSamples();
    Tone.Transport.stop();
    Tone.Transport.cancel(0);

    resetEffectsToDefaults();
    Tone.Transport.bpm.value = 30;

    bpmRef.current = 30;
    wetRef.current = 0;
    breathFRef.current = 200;
    drumFRef.current = 60;
    droneVolRef.current = -30;
    if (isDroneOnRef.current) {
      handleDroneVolume(-30);
    } else {
      handleDroneVolume(-100);
    }

    setDroneVolumeDownActive(false);
    setIsActive(false);

    setCountdown(selectedTime * 60);
    setCountdownSettlingTime(selectSettlingTime * 60);
    setText('Press Start');
    noSleep.disable();

    playedEndGongRef.current = false;
    settlingZeroHandledRef.current = false;
    countdown60HandledRef.current = false;
    countdown2HandledRef.current = false;
  }, [
    selectedTime,
    selectSettlingTime,
    clearSettlingRepeat,
    clearPhaseIntervals,
    stopAndDisposeLoops,
    stopAndDisposeDroneLoops,
    cleanupDroneLoops,
  ]);

  const startSession = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.context.resume();
      } catch (e) {
        console.error('Failed to resume the Tone audio context:', e);
        return;
      }
    }

    startSettlingAutomation();

    setIsActive(true);
    noSleep.enable();

    Tone.Transport.bpm.setValueAtTime(30, 0);
    playSample('startGong');

    const settlingSecs = selectSettlingTime * 60;
    if (settlingSecs > 4) {
      breathDelayTimeoutRef.current = setTimeout(() => {
        initiateLoops();
        breathDelayTimeoutRef.current = null;
      }, 2000);
    }

    if (droneVolumeDownActive) {
      volumeDownSecondPhase();
    }

    Tone.Transport.start();
  }, [
    startSettlingAutomation,
    initiateLoops,
    selectSettlingTime,
    droneVolumeDownActive,
    volumeDownSecondPhase,
  ]);

  const toggleTimer = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.context.resume();
      } catch (error) {
        console.error('Failed to resume the Tone audio context:', error);
        return;
      }
    }

    if (!isActive) {
      await startSession();
    } else {
      performSoftReset();
    }
  }, [isActive, startSession, performSoftReset]);

  useEffect(() => {
    if (isDroneOn) {
      handleDroneVolume(droneVolRef.current);
    } else {
      handleDroneVolume(-100);
    }
  }, [isDroneOn]);

  useEffect(() => {
    setCountdown(selectedTime * 60);
  }, [selectedTime]);

  useEffect(() => {
    setCountdownSettlingTime(selectSettlingTime * 60);
  }, [selectSettlingTime]);

  useEffect(() => {
    let timer;
    if (isActive && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, isActive]);

  useEffect(() => {
    let settlingTimer;
    if (isActive && countdownSettlingTime > 0) {
      settlingTimer = setTimeout(() => setCountdownSettlingTime((c) => c - 1), 1000);
    }
    return () => clearTimeout(settlingTimer);
  }, [countdownSettlingTime, isActive]);

  useEffect(() => {
    if (!isActive) {
      setText(
        `Press Start to begin.\nSettling Down: ${Math.floor(countdownSettlingTime / 60)}:${
          countdownSettlingTime % 60 < 10 ? '0' : ''
        }${countdownSettlingTime % 60}`,
      );
    } else if (countdown && countdownSettlingTime > 0) {
      setText(
        `Settling Down: ${Math.floor(countdownSettlingTime / 60)}:${
          countdownSettlingTime % 60 < 10 ? '0' : ''
        }${countdownSettlingTime % 60}`,
      );
    } else if (countdown > 0 && countdownSettlingTime === 0) {
      setText('🧘');
    }
  }, [countdown, countdownSettlingTime, isActive]);

  useEffect(() => {
    if (countdownSettlingTime === 1) {
      stopAndDisposeLoops();
    }
    if (countdownSettlingTime > 0) {
      settlingZeroHandledRef.current = false;
    }
    if (countdownSettlingTime === 0 && isActive) {
      if (settlingZeroHandledRef.current) {
        return;
      }
      settlingZeroHandledRef.current = true;
      playSample('startGong');
      volumeDownSecondPhase();
      setDroneVolumeDownActive(true);
    }
  }, [countdownSettlingTime, isActive, stopAndDisposeLoops, volumeDownSecondPhase]);

  useEffect(() => {
    if (isActive) {
      cleanupDroneLoops();
      droneLoops();
    } else {
      cleanupDroneLoops();
    }
  }, [isActive, droneLoops, cleanupDroneLoops]);

  useEffect(() => {
    if (!isActive || countdown !== 4) {
      return;
    }
    stopAndDisposeDroneLoops();
  }, [countdown, isActive, stopAndDisposeDroneLoops]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    if (countdown > 60) {
      countdown60HandledRef.current = false;
    }
    if (countdown > 2) {
      countdown2HandledRef.current = false;
    }

    if (countdown === 60 && !countdown60HandledRef.current) {
      countdown60HandledRef.current = true;
      setDroneVolumeDownActive(false);
      volumeUpEnd();
    }
    if (countdown === 2 && !countdown2HandledRef.current) {
      countdown2HandledRef.current = true;
      if (lastPhaseIntervalRef.current != null) {
        clearInterval(lastPhaseIntervalRef.current);
        lastPhaseIntervalRef.current = null;
      }
    }
    if (countdown === 0 && !playedEndGongRef.current) {
      playedEndGongRef.current = true;
      playSample('endGong', 1);
      clearSettlingRepeat();
      clearPhaseIntervals();
      setText('🙏');
      Tone.Transport.stop();

      endSessionTimeoutRef.current = setTimeout(() => {
        performSoftReset();
        endSessionTimeoutRef.current = null;
      }, 10000);
    }
  }, [
    countdown,
    isActive,
    volumeUpEnd,
    clearSettlingRepeat,
    clearPhaseIntervals,
    performSoftReset,
  ]);

  useEffect(
    () => () => {
      clearSettlingRepeat();
      clearPhaseIntervals();
      clearTimeout(breathDelayTimeoutRef.current);
      clearTimeout(endSessionTimeoutRef.current);
    },
    [clearSettlingRepeat, clearPhaseIntervals],
  );

  return {
    countdown,
    text,
    isActive,
    toggleTimer,
  };
}
