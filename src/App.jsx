import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './tailwind.css';

import Navbar from './components/Navbar';
import Main from './components/Main';

const App = () => {
  const [selectedTime, setSelectedTime] = useState(15);
  const [selectSettlingTime, setSelectSettlingTime] = useState(2)
  const [isDroneOn, setIsDroneOn] = useState(true);
  // const [globalVolume, setGlobalVolume] = useState(-12); // -12 dB as default

    // Total meditation time
    const handleTimeSelect = (event) => {
      setSelectedTime(Number(event.target.value));
    };
  
    // Sounds to settle down time
    const handleSettlingTime = (event) => {
      setSelectSettlingTime(Number(event.target.value));
    };

  // Handler for when the global volume slider changes
  // const handleGlobalVolumeChange = (event) => {
    // const volumeValue = event.target.value;
  //   setGlobalVolume(volumeValue);
  // };

  return (
    <div className="flex h-screen flex-col">
      <Navbar 
        onTimeSelect={handleTimeSelect} 
        selectedTime={selectedTime}
        onSettlingTimeSelect={handleSettlingTime}
        selectSettlingTime={selectSettlingTime}
        isDroneOn={isDroneOn} 
        setIsDroneOn={setIsDroneOn} 
        // globalVolume={globalVolume} 
      />
        {/* {handleGlobalVolumeChange={handleGlobalVolumeChange} />} */}
      <Main 
        selectedTime={selectedTime}
        selectSettlingTime={selectSettlingTime}
        isDroneOn={isDroneOn}
      />
    </div>
  );
}

export default App;
