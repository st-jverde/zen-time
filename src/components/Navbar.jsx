import React, { useState } from 'react';

const Navbar = ({ onTimeSelect, selectedTime }) => {
  return (
    <div className="h-screen w-64 fixed top-0 left-0 bg-ter">
      <div className="py-4 px-3">
          <h1 className="text-2xl font-bold text-main">Zen Time</h1>
      </div>
      <div className='py-2 px-3'>
        <h2 className='text-2xl font-bold text-sec'>Time</h2>
      </div>
      <>
        <ul className="space-y-2 pl-1">
          { [0.2, 5, 15, 30, 45].map(time => (
            <li key={time}>
              <button
                className={`ml-2 pr-6 pl-2 py-1 rounded bg-ter text-sec border-2
                            ${selectedTime === time ? 'outline-none border-sec' : 'border-transparent'}
                            hover:border-sec`}
                onClick={() => onTimeSelect(time)}>
                {time} min
              </button>
            </li>
          )) }
        </ul>
      </>
      <div className='py-2 px-3 mt-1'>
        <h2 className='text-2xl font-bold text-sec'>Sounds</h2>
      </div>
      <>
      <ul className="space-y-2 pl-1">
        <li>
          <button className="ml-2 pr-6 pl-2 py-1 rounded bg-ter text-sec">Rhythm</button>
        </li>
        <li>
          <button className="ml-2 pr-6 pl-2 py-1 rounded bg-ter text-sec">Breath</button>
        </li>
      </ul>
      </>
    </div>
  );
};


export default Navbar;
