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
      <div>
        <ul className="space-y-2 pl-1">
          { [5, 15, 30, 45].map(time => (
            <li key={time}>
              <button
                className={`outline-none ml-2 pr-6 pl-2 py-1 rounded bg-ter text-sec border-2
                            ${selectedTime === time ? 'outline-none border-main' : 'border-transparent'}
                            hover:border-main`}
                onClick={() => onTimeSelect(time)}>
                {time} min
              </button>
            </li>
          )) }
        </ul>
      </div>
    </div>
  );
};


export default Navbar;
