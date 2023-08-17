import React from 'react';

const Navbar = () => {
  return (
      <div className="h-screen w-64 fixed top-0 left-0 bg-gray-800 text-white">
          <div className="p-6">
              <h1 className="text-2xl font-bold">Zen Timer</h1>
          </div>
          <nav>
              <ul className="space-y-2 pl-6">
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="/">Home</a>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="/about">About</a>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="/services">Services</a>
                  </li>
                  <li className="hover:bg-gray-700 px-3 py-2 rounded">
                      <a href="/contact">Contact</a>
                  </li>
              </ul>
          </nav>
      </div>
  );
};

export default Navbar;
