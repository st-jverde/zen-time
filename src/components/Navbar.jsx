import React from 'react';
// import VolumeSliders from './VolumeSliders';
// import { setGlobalVolume } from '../audio';

const Navbar = ({ onTimeSelect, selectedTime, onSettlingTimeSelect, selectSettlingTime }) => {

  // const handleVolumeChange = (volumeValue) => {
  //   console.log('Received in Navbar:', volumeValue);
  //   setGlobalVolume(volumeValue); 
  // };

  return (
      <nav className="navbar navbar-dark bg-ter fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand text-2xl font-bold text-main" href="/">Zen Time</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="offcanvas offcanvas-end text-bg-dark" tabIndex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title text-sec" id="offcanvasDarkNavbarLabel">Meditation with sound guidance</h5>
            <button type="button" className="btn-close text-sec hover:text-main font-black" data-bs-dismiss="offcanvas" aria-label="Close">X</button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li className="nav-item">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Settle Down Time: {selectSettlingTime} min
                </a>
                <div className="dropdown-menu bg-dark">
                  <label htmlFor="settlingDown" className="form-label">🎧</label>
                  <input type="range" className="form-range" min="1" max={selectedTime - 2} step="1" onChange={onSettlingTimeSelect} id="settlingDown" />
                </div>                  
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Meditation Time: {selectedTime} min
                </a>
                <div className="dropdown-menu bg-dark">
                  <label htmlFor="meditationTime" className="form-label">🧘</label>
                  <input type="range" className="form-range" min={selectSettlingTime + 2} max="60" step="1" onChange={onTimeSelect} id="meditationTime" />
                </div>
              </li>
              
              {/* New Checkbox Section */}
              {/* <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Sounds
                </a>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" value="" id="checkboxBreath"/>
                  <label className="form-check-label text-sec" htmlFor="checkboxBreath">
                    Breath
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" value="" id="checkboxDrums"/>
                  <label className="form-check-label text-sec" htmlFor="checkboxDrums">
                    Bileteral Drums
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" value="" id="checkboxDrone"/>
                  <label className="form-check-label text-sec" htmlFor="checkboxDrone">
                    Drone
                  </label>
                </div>
              </li> */}
            </ul>
          </div>
          {/* <VolumeSliders onchanhe={handleVolumeChange(e)} /> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
  