import React, { useState } from 'react';
// import VolumeSlider from './VolumeSlider';
// import { setGlobalVolume } from '../audio';

const Navbar = ({ onTimeSelect, selectedTime }) => {

  // const handleVolumeChange = (volumeValue) => {
  //   console.log('Received in Navbar:', volumeValue);
  //   setGlobalVolume(volumeValue); 
  // };

  return (
    <div className="w-full h-20 sm:h-20 md:h-24 bg-ter flex flex-col items-center justify-between px-4 relative">
      
      {/* Left section for the h1 tag */}
      <a href="/">
        <h1 className="text-2xl font-bold text-main mt-1">Zen Time</h1>
      </a>

      {/* Center section for the Time and Sounds buttons */}
      <div className="flex justify-center space-x-4">
      // Old slider settel time
      <li className='nav-item dropdown'>
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Settling Time: {selectSettlingTime} min
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark">
                        {/* {<label htmlFor="settlingTime" className="form-label">
                            Settling Time: {selectSettlingTime} min
                        </label>} */}
                        <input
                            type="range"
                            className="dropdown-item form-range"
                            min="1"
                            max={selectedTime}
                            step="1"
                            id="settlingTime"
                            value={selectSettlingTime} // This ensures the slider position matches the selected time
                            onChange={(e) => onSettlingTimeSelect(parseInt(e.target.value))}
                        />
                    </ul>
                </li>


        {/* Lists section */}
        <div className="flex justify-center space-x-4 mb-4">
          {/* Conditional rendering for the Time list */}
          <div className="flex space-x-4">
              { [1, 5, 15, 30, 45].map(time => (
                  <button
                      key={time}
                      className={`pr-6 pl-2 py-1 rounded bg-ter text-sec border-2
                      ${selectedTime === time ? 'outline-none border-sec' : 'border-transparent'}
                      hover:border-sec`}
                      onClick={() => onTimeSelect(time)}>
                      {time} min
                  </button>
              ))}
          </div>
          {/* {<div className="flex space-x-4">
              <button className="pr-6 pl-2 py-1 rounded bg-ter text-sec">Rhythm</button>
              <button className="pr-6 pl-2 py-1 rounded bg-ter text-sec">Breath</button>
          </div>} */}
        </div>
      </div>
    </div>
  );


};

export default Navbar;
