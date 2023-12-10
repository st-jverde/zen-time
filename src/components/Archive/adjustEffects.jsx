const adjustEffects = () => {
    //BPM
    let currentBPM = 30;
    // totalBPMChange = 20; // Change BPM from start 30 to 10
    const durationInSeconds = selectSettlingTime * 60;
    const decreaseRate = 10 / durationInSeconds; // How much to decrease the BPM each second
    const quarterTime = (durationInSeconds / 4) * 1000;

    // Filter
    let currentFilterBreath = filterLevelBreath;
    let currentFilterDrum = filterLevelDrum;

    // Update filter frequency based on the remaining time
    const filterIncreaseBreath = (5000 - currentFilterBreath) / durationInSeconds; // Going from 100hz to 5000hz
    const filterIncreaseDrum = (1000 - currentFilterDrum) / durationInSeconds; // Going from 100hz to 6000hz

    // FOR VOLUME CHANGE
    let currentVolume = droneVolume;
    const endVolumeFirstPhase = -9;
    const volumeIncreaseRateFirstPhase = (endVolumeFirstPhase - currentVolume) / durationInSeconds;

    intervalId.current = setInterval(() => {
      //VOLUME CHANGE
      const elapsedTime = Tone.Transport.seconds;
      // console.log("elapsedTime: ", elapsedTime)

      if (elapsedTime <= durationInSeconds) {
        // First Phase
        currentVolume += volumeIncreaseRateFirstPhase;
        if (currentVolume > endVolumeFirstPhase) {
          clearInterval(intervalId.current);
          currentVolume = endVolumeFirstPhase;
        }
      } 
      
      setDroneVolume(currentVolume); // Update state
      handleDroneVolume(currentVolume);

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
      // console.log("BPM: ", currentBPM);
      
      // console.log("filterIncrease breath: ", filterIncreaseBreath);
      // console.log("currentFilter breath: ", currentFilterBreath);
      increaseFilterBreathFrequency(currentFilterBreath);

      // console.log("filterIncrease Drum: ", filterIncreaseDrum);
      // console.log("currentFilter Drum: ", currentFilterDrum);
      increaseFilterDrumFrequency(currentFilterDrum);

      // console.log("wetLevel: ", currentWetLevel);
      setReverbWetLevel(currentWetLevel);

      // Update Tone.Transport's BPM
      Tone.Transport.bpm.setValueAtTime(currentBPM, Tone.Transport.seconds);
    }, 1000);
  };