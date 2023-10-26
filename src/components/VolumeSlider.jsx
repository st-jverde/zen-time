// VolumeSlider.jsx
import React, { useState } from 'react';

const VolumeSlider = ({ onChange }) => {
    const [volume, setVolume] = useState(-12);

    const handleSliderChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        console.log('Slider Value:', e.target.value, 'Parsed Value:', newVolume); // Log values
        setVolume(newVolume);
        onChange(newVolume);
      };
    
    return (
        <>
          <div className='py-2 px-3 mt-1'>
              <label className="text-2xl font-bold text-sec">Volume:</label>
          </div>
          <div className="text-sec py-1">
              <input 
                type="range" 
                min="-60" 
                max="-1" 
                step="0.1" 
                value={volume}
                onChange={handleSliderChange}
                className="ml-3 pr-6 pl-2"
              />
          </div>
        </>
    );
};

export default VolumeSlider;
