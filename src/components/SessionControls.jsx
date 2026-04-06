import React from 'react';

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
    </svg>
  );
}

/**
 * Duration + ambient controls — collapsible panel on the main timer screen.
 */
const SessionControls = ({
  onTimeSelect,
  selectedTime,
  onSettlingTimeSelect,
  selectSettlingTime,
  isDroneOn,
  setIsDroneOn,
  useSyntheticDrone,
  setUseSyntheticDrone,
  minimized = false,
  onToggleMinimized,
  compact = false,
}) => {
  const settlingMax = Math.max(1, selectedTime - 2);
  const meditationMin = selectSettlingTime + 2;

  const pad = compact ? 'px-4 py-3' : 'px-5 py-6';
  const gap = compact ? 'space-y-3' : 'space-y-6';

  const headerOnlyPad = compact ? 'px-4 py-2.5' : 'px-5 py-3';

  return (
    <section
      className={`mx-auto w-full max-w-md rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-color)] text-left shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:rounded-2xl ${minimized ? headerOnlyPad : pad}`}
      aria-label="Session settings"
    >
      <div
        className={`relative flex items-center justify-center ${minimized ? '' : `border-b border-[color:var(--border-color)] ${compact ? 'pb-3' : 'pb-4'}`}`}
      >
        <h2 className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sec sm:text-xs">
          Session
        </h2>
        <button
          type="button"
          onClick={onToggleMinimized}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-sec transition-colors hover:bg-[color:var(--surface-elevated-color)] hover:text-main"
          aria-expanded={!minimized}
          aria-label={minimized ? 'Expand session settings' : 'Minimize session settings'}
        >
          {minimized ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      {!minimized && (
        <div className={`${compact ? 'pt-3' : 'pt-4'} ${gap}`}>
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label
                className={`text-sec ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}
                htmlFor="settlingDown"
              >
                Ease in
              </label>
              <span className={`tabular-nums font-medium text-main ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>
                {selectSettlingTime} min
              </span>
            </div>
            <input
              type="range"
              id="settlingDown"
              className="form-range w-full"
              min="1"
              max={settlingMax}
              step="1"
              value={selectSettlingTime}
              onChange={onSettlingTimeSelect}
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label
                className={`text-sec ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}
                htmlFor="meditationTime"
              >
                Meditation
              </label>
              <span className={`tabular-nums font-medium text-main ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>
                {selectedTime} min
              </span>
            </div>
            <input
              type="range"
              id="meditationTime"
              className="form-range w-full"
              min={meditationMin}
              max="60"
              step="1"
              value={selectedTime}
              onChange={onTimeSelect}
            />
          </div>

          <div
            className={`flex items-center justify-between gap-4 border-t border-[color:var(--border-color)] ${compact ? 'pt-3' : 'pt-5'}`}
          >
            <span className={`text-sec ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>Ambient drone</span>
            <label className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isDroneOn}
                onChange={() => setIsDroneOn(!isDroneOn)}
              />
              <span
                className="absolute inset-0 rounded-full bg-[color:var(--surface-elevated-color)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--main-color)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--surface-color)] peer-checked:bg-[color:var(--main-color)]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-[color:var(--text-primary-color)] shadow transition-transform peer-checked:translate-x-5"
                aria-hidden
              />
            </label>
          </div>

          {isDroneOn && (
            <div className={`flex flex-col gap-1 border-t border-[color:var(--border-color)] ${compact ? 'pt-3' : 'pt-4'}`}>
              <div className="flex items-center justify-between gap-4">
                <span className={`text-sec ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>Synthetic drone</span>
                <label className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={useSyntheticDrone}
                    onChange={() => setUseSyntheticDrone(!useSyntheticDrone)}
                  />
                  <span
                    className="absolute inset-0 rounded-full bg-[color:var(--surface-elevated-color)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--main-color)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--surface-color)] peer-checked:bg-[color:var(--main-color)]"
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-[color:var(--text-primary-color)] shadow transition-transform peer-checked:translate-x-5"
                    aria-hidden
                  />
                </label>
              </div>
              <p className={`text-muted ${compact ? 'text-[0.65rem] leading-snug sm:text-xs' : 'text-xs'}`}>
                Procedural ambient layer (replaces sample loops when on)
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SessionControls;
