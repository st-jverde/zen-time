# Zen Time: Meditation Timer 🧘‍♂️

Zen Time is a simple meditation timer application designed to offer an audio guided meditation experience. It is built using React, Tailwind CSS and the audio capabilities of Tone.js.

## WELCOME

Zen Time integrates sound with your meditation. Begin by selecting your desired meditation duration. Once you press "Start", the timer initiates its countdown. As it progresses, you'll be enveloped by calming sounds specifically designed to guide you into a deep state of meditation. These auditory cues not only help you relax and drift off, but they also evolve as your session continues. Over time, the sounds slow down and resonate as if they're gradually becoming distant, fostering a peaceful ambiance.

We sincerely hope Zen Time enhances tranquility and peace during your meditation sessions. 🙏

## Features

- **Timer Selection**: Specify your desired meditation duration.
- **Calming Sounds**: Delivers a guiding audio experience.

## Audio engine

The app uses [Tone.js](https://tonejs.github.io/) with a `latencyHint` of `playback` on the `AudioContext` for more stable output on mobile (larger buffer / lookahead tradeoff). Shared effects are wired once when you tap **Continue**.

**Mobile crackle / glitches** are usually addressed by reducing main-thread load and buffer underruns—not by dropping in WebAssembly. WASM does not replace Tone’s graph; it would only help if you rewrote heavy DSP in a custom **AudioWorklet** (or WASM inside one), which is a large separate project.

## WebAssembly note

Using WASM in the browser has no runtime license fee. It is **not** the default fix for Web Audio crackling here; tune context settings and scheduling first.
