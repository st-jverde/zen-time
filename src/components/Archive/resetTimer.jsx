const resetTimer = () => {
    const newBPM = 30;
    setIsActive(false);
    setIsActiveST(false);
    setDroneVolumeDownActive(false);
    setCountdown(selectedTime * 60);
    setCountdownSettlingTime(selectSettlingTime * 60);
    clearInterval(intervalId.current);
    clearInterval(secondPhaseInterval.current);
    stopAndDisposeLoops(); // stop the audio loops
    stopAndDisposeDroneLoops();
    Tone.Transport.stop();
    setBPM(newBPM);
    Tone.Transport.bpm.setValueAtTime(newBPM, Tone.now());
    setFilterLevelDrum(80);
    setFilterLevelBreath(200);
    setWetLevel(0);

    return (
        <button
        onClick={resetTimer}
        className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
        >
            Reset
      </button>
    )
};