

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
      adjustEffects(); // start BPM/FX adjustment
      setIsActive(true); // Set the countdown active
      setIsActiveST(true);
      setDroneActive(true);
      noSleep.enable();
      Tone.Transport.bpm.setValueAtTime(BPM, 0); // Setting BPM
      playSample("startGong");
      if (countdownSettlingTime > 4) {
        delayStart = setTimeout(() => {
          initiateLoops()
        }, 2000);
      }
      if (droneVolumeDownActive) {
        volumeDown();
      }
      if (droneActive) {
        droneLoops();
      }
      Tone.Transport.start();
      return () => clearTimeout(delayStart);
    } else {
      if (isActiveST) {
        setIsActiveST(false);
      }
      if (droneActive) {
        cleanupDroneLoops();
      }
      if (droneVolumeDownActive) {
        clearInterval(secondPhaseInterval.current);
      }
      setIsActive(false); // Set the countdown inactive
      clearInterval(intervalId.current);
      cleanupLoops();
      Tone.Transport.stop();
      noSleep.disable();
    }
  };