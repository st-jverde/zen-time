import React, { useState } from 'react';

import './tailwind.css';

import Navbar from './components/Navbar';
import Main from './components/Main';

const App = () => {
  const [selectedTime, setSelectedTime] = useState(0.4);

  // A function that the Navbar can call to set the time
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  return (
    <div className="flex h-screen">
      <Navbar onTimeSelect={handleTimeSelect} selectedTime={selectedTime} />
      <Main selectedTime={selectedTime} />
    </div>
  );
}

export default App;
