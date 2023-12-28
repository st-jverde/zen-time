const resetTimer = () => {
    // setIsResetting(true);

    stopAndDisposeLoops();
    stopAndDisposeDroneLoops();

    // playSample("endGong");
    clearInterval(secondPhaseInterval.current);
    clearInterval(lastPhaseInterval.current);
    clearTimeout(timeoutIdForBreath);
    clearTimeout(timeoutIdForDrum);
    clearInterval(intervalId.current);

    setIsActive(false);
    // setIsActiveST(false);
    setDroneActive(false);
    setDroneVolumeDownActive(false);

    calculateDurationInSeconds(selectSettlingTime);
    setCountdown(selectedTime * 60);
    setCountdownSettlingTime(selectSettlingTime * 60);

    // Reset audio effect states
    setWetLevel(0); 
    setFilterLevelBreath(200); 
    setFilterLevelDrum(80); 
    setDroneVolume(-30); 

    // Apply the reset states to the audio system
    setReverbWetLevel(0);
    increaseFilterBreathFrequency(200);
    increaseFilterDrumFrequency(80);
    handleDroneVolume(-30);

    Tone.Transport.stop();
    stopAllSamples();

    return (
        <button
        onClick={resetTimer}
        className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
        >
            Reset
      </button>
    )
  };

    //     const resetTimerOld = () => {
    //     const newBPM = 30;
    //     setIsActive(false);
    //     setIsActiveST(false);
    //     setDroneVolumeDownActive(false);
    //     setCountdown(selectedTime * 60);
    //     setCountdownSettlingTime(selectSettlingTime * 60);
    //     clearInterval(intervalId.current);
    //     clearInterval(secondPhaseInterval.current);
    //     stopAndDisposeLoops(); // stop the audio loops
    //     stopAndDisposeDroneLoops();
    //     Tone.Transport.stop();
    //     setBPM(newBPM);
    //     Tone.Transport.bpm.setValueAtTime(newBPM, Tone.now());
    //     setFilterLevelDrum(80);
    //     setFilterLevelBreath(200);
    //     setWetLevel(0);
    // };