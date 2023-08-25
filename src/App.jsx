import React, { useState } from 'react';

import './tailwind.css';

import Navbar from './components/Navbar';
import Main from './components/Main';

const App = () => {
  const [selectedTime, setSelectedTime] = useState(15);

  // A function that the Navbar can call to set the time
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  return (
    <div className="flex h-screen">
      <Navbar onTimeSelect={handleTimeSelect} />
      <Main selectedTime={selectedTime} />
    </div>
  );
}

export default App;
