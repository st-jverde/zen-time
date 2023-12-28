  // const cleanupLoops = () => {
  //   breathLoopRef.current?.stop(0);
  //   drumLoopRef.current?.stop(0);
  //   breathSampleIndex.current = 0;
  //   drumSampleIndex.current = 0;
  // };

    // useEffect Hooks
  // useEffect(() => {
  //   const initialBPM = 30;
  //   const initialWetLevel = 0;
  //   const initialFilterLevelBreath = 200;
  //   const initialFilterLevelDrum = 80;

  // ----------------------------------------

  //   if (isResetting) { 
  //     stopAndDisposeLoops();
  //     stopAndDisposeDroneLoops();

  //     // playSample("endGong");
  //     clearInterval(intervalId.current);
  //     clearInterval(secondPhaseInterval.current);
  //     clearInterval(lastPhaseInterval.current);
  //     clearTimeout(timeoutIdForBreath);
  //     clearTimeout(timeoutIdForDrum);

  //     Tone.Transport.stop();
  //     setDroneVolumeDownActive(false);
  //     setIsActive(false);
  //     setIsActiveST(false);
  //     setDroneActive(false);

  //     calculateDurationInSeconds(selectSettlingTime);
  //     setCountdown(selectedTime * 60);
  //     setCountdownSettlingTime(selectSettlingTime * 60);
      
  //     setBPM(initialBPM);
  //     Tone.Transport.bpm.setValueAtTime(initialBPM, Tone.now());
  //     setFilterLevelDrum(initialFilterLevelDrum);
  //     setFilterLevelBreath(initialFilterLevelBreath);
  //     setWetLevel(initialWetLevel);

  //     setIsResetting(false);
  //   }
  // }, [isResetting]);