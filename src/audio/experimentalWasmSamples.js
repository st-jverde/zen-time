/**
 * Default load-time path for non-drone samples (gongs, breath, drums). See README “Audio feature flags”.
 * Drone loop buffers (`ZT-drone-*`) are never passed through WASM here. Disable via `setWasmSamplesProcessing(false)`.
 */

import { WASM_SAMPLE_NAMES } from './graph';

export const EXPERIMENTAL_WASM_SAMPLES = process.env.EXPERIMENTAL_WASM_SAMPLES === 'true';

const WASM_SAMPLE_SET = new Set(WASM_SAMPLE_NAMES);

let zenSamplesModulePromise = null;

/**
 * Loads wasm-pack `web` target bundle (`default` calls `fetch` for the .wasm asset). Cached after first success.
 */
export async function loadZenSamplesWasm() {
  if (!zenSamplesModulePromise) {
    zenSamplesModulePromise = import(
      /* webpackChunkName: "zen-samples-wasm" */
      './wasm/zen_samples/pkg/zen_samples.js'
    ).then(async (m) => {
      await m.default();
      return m;
    });
  }
  return zenSamplesModulePromise;
}

function f32Equal(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  return Number.isNaN(a) && Number.isNaN(b);
}

/**
 * Dev-only: identity DSP must not change scratch samples (handles NaN).
 * @param {Float32Array} before
 * @param {Float32Array} after
 */
function devAssertIdentityInPlace(before, after) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  if (before.length !== after.length) {
    console.warn('zen_samples dev: length mismatch');
    return;
  }
  for (let i = 0; i < before.length; i += 1) {
    if (!f32Equal(before[i], after[i])) {
      console.warn('zen_samples dev: identity mismatch at', i, before[i], after[i]);
      return;
    }
  }
}

/**
 * Runs load-time Rust `process_channel_inplace` on each channel when the WASM sample path is on.
 * Uses a scratch `Float32Array` per channel (not raw AudioBuffer views) so wasm-bindgen glue stays safe.
 *
 * On failure, logs and leaves the buffer unchanged (no partial writes).
 *
 * @param {import('tone').ToneAudioBuffer} toneBuffer
 * @param {string} sampleName
 */
export async function processToneBufferWithWasm(toneBuffer, sampleName) {
  if (!WASM_SAMPLE_SET.has(sampleName)) {
    return;
  }
  try {
    const mod = await loadZenSamplesWasm();
    const { process_channel_inplace: processChannelInplace } = mod;
    const channels = toneBuffer.numberOfChannels;
    for (let c = 0; c < channels; c += 1) {
      const data = toneBuffer.getChannelData(c);
      const scratch = new Float32Array(data.length);
      scratch.set(data);
      const before = new Float32Array(scratch);
      processChannelInplace(scratch);
      devAssertIdentityInPlace(before, scratch);
      data.set(scratch);
    }
  } catch (err) {
    console.warn('zen_samples: processToneBufferWithWasm failed, leaving buffer unchanged:', err);
  }
}
