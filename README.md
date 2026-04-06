# Zen Time

A meditation timer web app with sound-guided sessions: breath cues, stereo drums, optional ambient drone, and gongs. Built with **React**, **Webpack**, **Tailwind CSS**, and **Tone.js**.

**Live site:** [zen-time.netlify.app](https://zen-time.netlify.app/)

## Using the app

1. **Continue** — Loads and unlocks the audio engine (browser autoplay rules require a user gesture).
2. **Session** — After continuing, configure **ease-in** duration, total **meditation** length, and **ambient drone** on or off. The session panel can be **minimized** with the control in its top-right corner (chevron); it stays hidden on the first screen until you continue.
3. **Start** — Begins the session: ease-in phase with evolving sounds, then meditation countdown.

The layout is tuned for a single viewport height (no page scroll) with a dark theme and a warm accent color.

## Development

```bash
npm install
npm start
```

Opens the dev server (see `package.json` for the port).

### Production build

Set `REACT_APP_CLOUDINARY_CLOUD_NAME` in your environment — audio URLs are resolved through Cloudinary.

```bash
npm run build
```

Output is written to `dist/`.

## Features

- Configurable ease-in and meditation length (sliders), optional drone layer
- Collapsible **Session** card on the timer screen
- **Tone.js** transport, samples, and shared effects graph (initialized after **Continue**)
- Screen wake lock during sessions via `nosleep.js`

## Audio engine

The app uses [Tone.js](https://tonejs.github.io/) with a `latencyHint` of `playback` on the `AudioContext` for more stable output on mobile (larger buffer / lookahead tradeoff). Shared effects are wired once when you tap **Continue**.

**Mobile crackle / glitches** are usually addressed by reducing main-thread load and buffer underruns—not by dropping in WebAssembly. WASM does not replace Tone’s graph; it would only help if you rewrote heavy DSP in a custom **AudioWorklet** (or WASM inside one), which is a large separate project.

### Audio feature flags

| Flag | Default | Purpose |
|------|---------|---------|
| **WASM samples** | on | Gong / breath / drum buffers are passed through Rust `process_channel_inplace` via a scratch `Float32Array` per channel after decode (drone loop samples stay Tone-only). Phase 1 is identity in Rust; playback uses `Tone.Player` and [`buildGraph`](src/audio/graph.js). |
| `EXPERIMENTAL_WASM_SAMPLES` | `false` | Optional env mirror for tooling; call `setWasmSamplesProcessing(false)` in code if you need a pure Tone.js path. |

Run `npm run build:wasm` so `zen_samples/pkg` exists before `npm start` / `npm run build`.

**Pure Tone.js (no WASM on the sample path):** call `setWasmSamplesProcessing(false)` before loading audio (e.g. in a dev harness).

**Verification (identity path):** In `zen_samples`, run `cargo test` from [`src/audio/wasm/zen_samples`](src/audio/wasm/zen_samples). In development, `processToneBufferWithWasm` logs if Rust ever changes a sample value (identity check). For listening parity, compare sessions with `setWasmSamplesProcessing(false)` vs default — they should match for Phase 1.

### Drone (procedural vs samples)

- **Ambient drone** on: volume and ramps follow the existing session logic.
- **Synthetic drone** (optional): uses the **JavaScript** `AudioWorklet` in [`src/audio/droneWorkletProcessor.js`](src/audio/droneWorkletProcessor.js), routed through the same Tone filters/reverb as sample drones. It is not the Rust `zen_drone` crate (that crate remains for experiments / parity checks).

### WebAssembly crates

`npm run build:wasm` builds two packages under [`src/audio/wasm/`](src/audio/wasm/): `zen_drone` (bundler target) and `zen_samples` (**web** target so the app can `fetch` the `.wasm` file without Webpack’s WASM parser). Output goes to `zen_drone/pkg/` and `zen_samples/pkg/` (gitignored).

Using WASM in the browser has no runtime license fee. It is **not** the default fix for Web Audio crackling here; tune context settings and scheduling first.
