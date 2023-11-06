import React from 'react';

const NavbarInfo = ({ onTimeSelect, selectedTime, onSettlingTimeSelect, selectSettlingTime }) => {
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
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li class="nav-item">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Settle Down Time: {selectSettlingTime} min
                  </a>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    { [1, 2, 3, 4].map((time, index) => {
                        return <li><a 
                            key={index}
                            className={`dropdown-item pr-6 pl-2 py-1 rounded text-sec border-2
                            ${selectSettlingTime === time ? 'outline-none border-sec' : 'border-transparent'}
                            hover:border-sec`}
                            onClick={() => onSettlingTimeSelect(time)}>
                            {time} min</a>
                        </li>
                    })}
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Meditation Time: {selectedTime} min
                  </a>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    { [5, 10, 15, 30, 45, 60].map((time, index) => {
                        return <li><a 
                            key={index}
                            className={`dropdown-item pr-6 pl-2 py-1 rounded text-sec border-2
                            ${selectedTime === time ? 'outline-none border-sec' : 'border-transparent'}
                            hover:border-sec`}
                            onClick={() => onTimeSelect(time)}>
                            {time} min</a>
                        </li>
                    })}
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    );
}

export default NavbarInfo;
  