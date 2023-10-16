import React, { useState } from 'react';

import './tailwind.css';

import Navbar from './components/Navbar';
import Main from './components/Main';

const App = () => {
  const [selectedTime, setSelectedTime] = useState(1);
  const [globalVolume, setGlobalVolume] = useState(-12); // -12 dB as default

  // A function that the Navbar can call to set the time
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Handler for when the global volume slider changes
  const handleGlobalVolumeChange = (event) => {
    const volumeValue = event.target.value;
    setGlobalVolume(volumeValue);
  };

  return (
    <div className="flex h-screen">
      <Navbar onTimeSelect={handleTimeSelect} selectedTime={selectedTime} globalVolume={globalVolume} handleGlobalVolumeChange={handleGlobalVolumeChange} />
      <Main selectedTime={selectedTime} />
    </div>
  );
}

export default App;
