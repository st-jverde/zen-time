import React, { useState, useEffect } from 'react';

import './tailwind.css';

import Main from './components/Main';

const App = () => {
  const [selectedTime, setSelectedTime] = useState(6);
  const [selectSettlingTime, setSelectSettlingTime] = useState(2);
  const [isDroneOn, setIsDroneOn] = useState(false);
  const [useSyntheticDrone, setUseSyntheticDrone] = useState(false);

  useEffect(() => {
    if (!isDroneOn) {
      setUseSyntheticDrone(false);
    }
  }, [isDroneOn]);

  useEffect(() => {
    const maxSettle = Math.max(1, selectedTime - 2);
    setSelectSettlingTime((s) => Math.min(s, maxSettle));
  }, [selectedTime]);

  useEffect(() => {
    const minMed = selectSettlingTime + 2;
    setSelectedTime((t) => Math.max(t, minMed));
  }, [selectSettlingTime]);

  const handleTimeSelect = (event) => {
    setSelectedTime(Number(event.target.value));
  };

  const handleSettlingTime = (event) => {
    setSelectSettlingTime(Number(event.target.value));
  };

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-dark">
      <Main
        selectedTime={selectedTime}
        selectSettlingTime={selectSettlingTime}
        isDroneOn={isDroneOn}
        useSyntheticDrone={useSyntheticDrone}
        setUseSyntheticDrone={setUseSyntheticDrone}
        onTimeSelect={handleTimeSelect}
        onSettlingTimeSelect={handleSettlingTime}
        setIsDroneOn={setIsDroneOn}
      />
    </div>
  );
};

export default App;
