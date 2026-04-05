import React, { useState, useEffect } from 'react';
import { loadAudio, initializeAllAudio } from '../audio';
import { useMeditationSession } from '../hooks/useMeditationSession';
import '../tailwind.css';
import '../../public/styles/style.css';

import cl from '../../cloudinaryConfig';

const Main = ({ selectedTime, selectSettlingTime, isDroneOn }) => {
  const [audioReady, setAudioReady] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const {
    countdown,
    text,
    isActive,
    toggleTimer,
  } = useMeditationSession({ selectedTime, selectSettlingTime, isDroneOn });

  useEffect(() => {
    const loadAllAudios = async () => {
      try {
        await loadAudio('startGong', cl.url('startGong', { resource_type: 'video' }));
        await loadAudio('endGong', cl.url('endGong', { resource_type: 'video' }));
        await loadAudio('breath-1', cl.url('breath-1', { resource_type: 'video' }));
        await loadAudio('breath-2', cl.url('breath-2', { resource_type: 'video' }));
        await loadAudio('breath-3', cl.url('breath-3', { resource_type: 'video' }));
        await loadAudio('breath-4', cl.url('breath-4', { resource_type: 'video' }));
        await loadAudio('ZT-sha-L', cl.url('ZT-sha-L', { resource_type: 'video' }));
        await loadAudio('ZT-sha-R', cl.url('ZT-sha-R', { resource_type: 'video' }));
        await loadAudio('ZT-drone-1', cl.url('ZT-drone-1', { resource_type: 'video' }));
        await loadAudio('ZT-drone-2', cl.url('ZT-drone-2', { resource_type: 'video' }));
        setAudioReady(true);
      } catch (error) {
        console.error('Failed to load audio:', error);
      }
    };
    loadAllAudios();
  }, []);

  const handleInitAudio = async () => {
    try {
      await initializeAllAudio();
      setAudioInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  return (
    <div className="flex-1 bg-dark flex items-center justify-center">
      <div className="text-center">
        {!audioInitialized ? (
          <>
            <div className="md:text-6xl sm:text-2xl mb-6">
              <h1 className="text-main font-bold">Zen Time</h1>
              <div className="text-sec text-base">
                <p>
                  <br />
                  meditation timer with sound guidance
                  <br />
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInitAudio}
              className="bg-ter hover:bg-sec text-sec hover:text-ter px-4 py-2 rounded"
            >
              Continue
            </button>
            {!audioReady && <p className="text-sec">Loading audio...</p>}
          </>
        ) : (
          <>
            <div className="text-2xl mb-4 text-main">
              <p className="multiline-text">{text}</p>
            </div>
            <div className="text-9xl mb-4 text-main">
              <h1>{`${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? '0' : ''}${countdown % 60}`}</h1>
            </div>
            <button
              type="button"
              onClick={toggleTimer}
              className="mr-4 bg-sec hover:bg-ter text-ter hover:text-sec px-4 py-2 rounded"
            >
              {isActive ? 'Reset' : 'Start'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
