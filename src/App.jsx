import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './tailwind.css';

import NavbarInfo from './components/NavbarInfo';
// import Navbar from './components/Navbar';
import Main from './components/Main';

const App = () => {
  const [selectedTime, setSelectedTime] = useState(10);
  const [selectSettlingTime, setSelectSettlingTime] = useState(1)
  const [globalVolume, setGlobalVolume] = useState(-12); // -12 dB as default

  // Total meditation time
  const handleTimeSelect = (event) => {
    setSelectedTime(Number(event.target.value));
  };

  // Sounds to settle down time
  const handleSettlingTime = (event) => {
    setSelectSettlingTime(Number(event.target.value));
  };

  // Handler for when the global volume slider changes
  const handleGlobalVolumeChange = (event) => {
    const volumeValue = event.target.value;
    setGlobalVolume(volumeValue);
  };

  return (
    <div className="flex h-screen flex-col">
      <NavbarInfo 
        onTimeSelect={handleTimeSelect} 
        selectedTime={selectedTime}
        onSettlingTimeSelect={handleSettlingTime}
        selectSettlingTime={selectSettlingTime} 
        globalVolume={globalVolume} 
        handleGlobalVolumeChange={handleGlobalVolumeChange} />
      <Main 
        selectedTime={selectedTime}
        selectSettlingTime={selectSettlingTime} 
      />
    </div>
  );
}

export default App;
