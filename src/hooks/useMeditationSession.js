import { useRef, useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import NoSleep from 'nosleep.js';
import {
  playSample,
  stopAllSamples,
  handleDroneVolume,
  setProceduralDroneActive,
  scheduleSettlingAudioRamps,
  cancelSettlingAudioRamps,
  resetEffectsToDefaults,
} from '../audio';

const noSleep = new NoSleep();

const breathSamples = ['breath-1', 'breath-2', 'breath-3', 'breath-4'];
const drumSamples = ['ZT-sha-L', 'ZT-sha-R'];
const droneSamples = ['ZT-drone-1', 'ZT-drone-2'];

function getPlaybackRate(currentBPM) {
  return currentBPM / 30;
}

function formatMmSs(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function idleStatusText(selectedTime, selectSettlingTime) {
  return `Ease in: ${formatMmSs(selectSettlingTime * 60)}\nMeditation: ${formatMmSs(selectedTime * 60)}`;
}

export function useMeditationSession({
  selectedTime,
  selectSettlingTime,
  isDroneOn,
  useSyntheticDrone = false,
}) {
  const [countdown, setCountdown] = useState(() => selectedTime * 60);
  const [countdownSettlingTime, setCountdownSettlingTime] = useState(() => selectSettlingTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState(() => idleStatusText(selectedTime, selectSettlingTime));

  const [droneVolumeDownActive, setDroneVolumeDownActive] = useState(false);

  const breathSampleIndex = useRef(0);
  const drumSampleIndex = useRef(0);
  const breathLoopRef = useRef(null);
  const drumLoopRef = useRef(null);
  const droneLoopRef = useRef(null);
  const droneLoopRef60 = useRef(null);

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
    droneLoopRef.current = new Tone.Loop((time) => {
      playSample(droneSamples[0], 0.67, undefined, time);
    }, '1n').start('+1');

    droneLoopRef60.current = new Tone.Loop((time) => {
      playSample(droneSamples[1], 0.67, undefined, time);
    }, '4n').start();
  }, []);

  const initiateLoops = useCallback(() => {
    breathLoopRef.current = new Tone.Loop((time) => {
      const rate = getPlaybackRate(30);
      playSample(breathSamples[breathSampleIndex.current], rate, undefined, time);
      breathSampleIndex.current = (breathSampleIndex.current + 1) % breathSamples.length;
    }, '2n').start();

    drumLoopRef.current = new Tone.Loop((time) => {
      const rate = getPlaybackRate(30);
      playSample(drumSamples[drumSampleIndex.current], rate, undefined, time);
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
    cancelSettlingAudioRamps();
    clearPhaseIntervals();
    clearTimeout(breathDelayTimeoutRef.current);
    breathDelayTimeoutRef.current = null;
    clearTimeout(endSessionTimeoutRef.current);
    endSessionTimeoutRef.current = null;

    stopAndDisposeLoops();
    stopAndDisposeDroneLoops();
    cleanupDroneLoops();

    stopAllSamples();
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel(0);

    resetEffectsToDefaults();
    transport.bpm.value = 30;

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
    setText(idleStatusText(selectedTime, selectSettlingTime));
    noSleep.disable();

    playedEndGongRef.current = false;
    settlingZeroHandledRef.current = false;
    countdown60HandledRef.current = false;
    countdown2HandledRef.current = false;
  }, [
    selectedTime,
    selectSettlingTime,
    clearPhaseIntervals,
    stopAndDisposeLoops,
    stopAndDisposeDroneLoops,
    cleanupDroneLoops,
  ]);

  const startSession = useCallback(async () => {
    const ctx = Tone.getContext();
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
      } catch (e) {
        console.error('Failed to resume the Tone audio context:', e);
        return;
      }
    }

    setIsActive(true);
    noSleep.enable();

    bpmRef.current = 30;
    wetRef.current = 0;
    breathFRef.current = 200;
    drumFRef.current = 60;
    droneVolRef.current = -30;

    const transport = Tone.getTransport();
    transport.bpm.setValueAtTime(30, 0);
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

    transport.start();
    if (settlingSecs > 0) {
      scheduleSettlingAudioRamps(settlingSecs, isDroneOn);
    }
  }, [
    initiateLoops,
    selectSettlingTime,
    droneVolumeDownActive,
    volumeDownSecondPhase,
    isDroneOn,
  ]);

  const toggleTimer = useCallback(async () => {
    const ctx = Tone.getContext();
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
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
    if (!isActive || !useSyntheticDrone || !isDroneOn) {
      setProceduralDroneActive(false);
      return;
    }
    const run = countdown > 4;
    setProceduralDroneActive(run);
  }, [isActive, useSyntheticDrone, isDroneOn, countdown]);

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
      setText(idleStatusText(selectedTime, selectSettlingTime));
    } else if (countdown && countdownSettlingTime > 0) {
      setText(`Ease in: ${formatMmSs(countdownSettlingTime)}`);
    } else if (countdown > 0 && countdownSettlingTime === 0) {
      setText('🧘');
    }
  }, [countdown, countdownSettlingTime, isActive, selectedTime, selectSettlingTime]);

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
      wetRef.current = 1;
      breathFRef.current = 8000;
      drumFRef.current = 1000;
      bpmRef.current = 10;
      droneVolRef.current = -9;
      playSample('startGong');
      volumeDownSecondPhase();
      setDroneVolumeDownActive(true);
    }
  }, [countdownSettlingTime, isActive, stopAndDisposeLoops, volumeDownSecondPhase]);

  useEffect(() => {
    if (!isActive) {
      cleanupDroneLoops();
      return;
    }
    if (useSyntheticDrone) {
      cleanupDroneLoops();
      return;
    }
    cleanupDroneLoops();
    droneLoops();
  }, [isActive, useSyntheticDrone, droneLoops, cleanupDroneLoops]);

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
      clearPhaseIntervals();
      setText('🙏');
      Tone.getTransport().stop();

      endSessionTimeoutRef.current = setTimeout(() => {
        performSoftReset();
        endSessionTimeoutRef.current = null;
      }, 10000);
    }
  }, [
    countdown,
    isActive,
    volumeUpEnd,
    clearPhaseIntervals,
    performSoftReset,
  ]);

  useEffect(
    () => () => {
      cancelSettlingAudioRamps();
      clearPhaseIntervals();
      clearTimeout(breathDelayTimeoutRef.current);
      clearTimeout(endSessionTimeoutRef.current);
    },
    [clearPhaseIntervals],
  );

  return {
    countdown,
    text,
    isActive,
    toggleTimer,
  };
}
