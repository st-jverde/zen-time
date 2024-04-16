import React, { useState, useEffect } from 'react';
import {
    openMic, 
    closeMic,
    setMicVolume,
    getMicVolumeLevel 
} from '../audio';

const Mic = () => {
    const [micVolume, setMicVolumeState] = useState(0);
    const [isMicOpen, setIsMicOpen] = useState(false);
    const [micVolumeLevel, setMicVolumeLevel] = useState(0);
    
    const handleMicToggle = async () => {
        if (isMicOpen) {
            closeMic();
            setIsMicOpen(false);
        } else {
            await openMic();
            setIsMicOpen(true);
        }
    };
    
    const handleVolumeChange = (event) => {
      const volume = event.target.value;
      setMicVolumeState(volume);
      setMicVolume(volume); // Call the imported function
    };
    
    useEffect(() => {
      // Start the Tone.js audio context
      if (isActive) {
        Tone.start().then(() => {
          console.log("Audio context started");
      }).catch(e => console.error(e));
      }
    }, [isActive]);
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            const level = getMicVolumeLevel();
            setMicVolumeLevel(level);
        }, 1000); // Update every 100 milliseconds
    
        return () => clearInterval(intervalId);
    }, []);
    
    return (
        <div>
            <button onClick={handleMicToggle}>{isMicOpen ? 'Close Microphone' : 'Open Microphone'}</button>
            <input type="range" min="0" max="60" value={micVolume} onChange={handleVolumeChange} />
        </div>
    );
}

export default Mic;
