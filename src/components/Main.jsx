import React, { useState, useEffect } from 'react';
import { loadAudio, initializeAllAudio, setDronePathProcedural } from '../audio';
import { useMeditationSession } from '../hooks/useMeditationSession';
import '../tailwind.css';
import '../../public/styles/style.css';

import cl from '../../cloudinaryConfig';
import SessionControls from './SessionControls';

const Main = ({
  selectedTime,
  selectSettlingTime,
  isDroneOn,
  useSyntheticDrone,
  setUseSyntheticDrone,
  onTimeSelect,
  onSettlingTimeSelect,
  setIsDroneOn,
}) => {
  const [audioReady, setAudioReady] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [sessionMinimized, setSessionMinimized] = useState(false);

  const {
    countdown,
    text,
    isActive,
    toggleTimer,
  } = useMeditationSession({ selectedTime, selectSettlingTime, isDroneOn, useSyntheticDrone });

  useEffect(() => {
    if (!audioInitialized) {
      return;
    }
    setDronePathProcedural(useSyntheticDrone);
  }, [audioInitialized, useSyntheticDrone]);

  useEffect(() => {
    let cancelled = false;
    const loadAllAudios = async () => {
      try {
        setAudioReady(false);
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
        if (!cancelled) {
          setAudioReady(true);
        }
      } catch (error) {
        console.error('Failed to load audio:', error);
        if (!cancelled) {
          setAudioReady(false);
        }
      }
    };
    loadAllAudios();
    return () => {
      cancelled = true;
    };
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
    <main className="flex h-full min-h-0 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] text-center sm:px-6">
      <header className="shrink-0 pb-2">
        <p className="text-[1.5rem] font-bold uppercase tracking-[0.4em] text-main sm:text-xs">
          Zen Time
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!audioInitialized ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
              <div className="max-w-md">
                <h1 className="mb-2 text-2xl font-semibold tracking-tight text-sec sm:text-3xl">
                  Meditation timer
                </h1>
                <p className="text-sm leading-snug text-muted sm:text-base">
                  Sound-guided sessions with calm ambience
                </p>
              </div>
              <button
                type="button"
                onClick={handleInitAudio}
                className="shrink-0 rounded-full bg-main px-8 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
              >
                Continue
              </button>
              {!audioReady && (
                <p className="text-xs text-muted sm:text-sm">Loading audio…</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 sm:gap-2">
              <p className="max-w-md shrink text-sm leading-snug text-sec sm:text-base">
                <span className="multiline-text">{text}</span>
              </p>

              <div
                className="shrink-0 font-light tabular-nums tracking-tight text-main"
                style={{
                  fontSize: 'clamp(2.25rem, 12vmin, 4.25rem)',
                  lineHeight: 1.05,
                }}
              >
                {`${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? '0' : ''}${countdown % 60}`}
              </div>

              <button
                type="button"
                onClick={toggleTimer}
                className="shrink-0 rounded-full border border-border bg-surface px-8 py-2 text-sm font-medium text-main transition-colors hover:bg-surface-elevated sm:px-10 sm:py-2.5"
              >
                {isActive ? 'Reset' : 'Start'}
              </button>
            </div>

            <div className="shrink-0 pt-1">
              <SessionControls
                onTimeSelect={onTimeSelect}
                selectedTime={selectedTime}
                onSettlingTimeSelect={onSettlingTimeSelect}
                selectSettlingTime={selectSettlingTime}
                isDroneOn={isDroneOn}
                setIsDroneOn={setIsDroneOn}
                useSyntheticDrone={useSyntheticDrone}
                setUseSyntheticDrone={setUseSyntheticDrone}
                minimized={sessionMinimized}
                onToggleMinimized={() => setSessionMinimized((m) => !m)}
                compact
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Main;
