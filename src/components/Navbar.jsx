import React from 'react';
import '../tailwind.css';

const Navbar = ({ onTimeSelect }) => {

  return (
      <div className="h-screen w-64 fixed top-0 left-0 bg-nav">
          <div className="p-4">
              <h1 className="text-2xl font-bold text-main-1">Zen Time</h1>
          </div>
          <div className='p-4'>
            <h2 className='text-2xl font-bold text-secondary-1'>Time</h2>
          </div>
          <div>
              <ul className="space-y-2 pl-1">
                  <li className="hover:bg-gray-700 px-3 py-1 rounded bg-nav hover:bg-dark">
                    <button className='text-secondary-1' onClick={() => onTimeSelect(5)}>5 min</button>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-1 rounded bg-nav hover:bg-dark">
                    <button className='text-secondary-1' onClick={() => onTimeSelect(15)}>15 min</button>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-1 rounded bg-nav hover:bg-dark">
                    <button className='text-secondary-1' onClick={() => onTimeSelect(30)}>30 min</button>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-1 rounded bg-nav hover:bg-dark">
                    <button className='text-secondary-1' onClick={() => onTimeSelect(45)}>45 min</button>
                  </li>
              </ul>
          </div>
      </div>
  );
};

export default Navbar;
