import React from 'react';
import '../tailwind.css';

const Navbar = () => {
  return (
      <div className="h-screen w-64 fixed top-0 left-0 bg-nav">
          <div className="p-6">
              <h1 className="text-2xl font-bold text-main">Zen Time</h1>
          </div>
          <div className='p-6'>
            <h2 className='text-2xl font-bold text-secondary'>Time (min)</h2>
          </div>
          <div>
              <ul className="space-y-2 pl-2 text-secondary">
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                    <a href="#">5</a>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="#">15</a>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="#">30</a>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="#">45</a>
                  </li>
              </ul>
          </div>
      </div>
  );
};

export default Navbar;
