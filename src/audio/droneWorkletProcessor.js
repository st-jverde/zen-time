/**
 * Procedural stereo drone — DSP mirrors `src/audio/wasm/src/lib.rs`.
 * Implemented in JS here so the file is one self-contained script for `audioWorklet.addModule`:
 * webpack’s async worklet chunk cannot load wasm-bindgen split chunks (no `import` / `require` runtime).
 */
const TWO_PI = Math.PI * 2;

class DroneSynth {
  constructor(sampleRate) {
    this.sr = sampleRate;
    this.phase = [0, 0, 0];
    this.freq = [55, 82.5, 110];
    this.noise = 0x9e3779b9;
  }

  processInterleaved(out) {
    const n = out.length;
    if (n < 2 || n % 2 !== 0) {
      return;
    }
    const frames = n / 2;
    for (let i = 0; i < frames; i += 1) {
      let s = 0;
      for (let k = 0; k < 3; k += 1) {
        this.phase[k] += (TWO_PI * this.freq[k]) / this.sr;
        if (this.phase[k] > TWO_PI) {
          this.phase[k] -= TWO_PI;
        }
        s += Math.sin(this.phase[k]) * (1 / 3);
      }
      let x = this.noise >>> 0;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      this.noise = x >>> 0;
      const noise = (x / 0xffffffff) * 2 - 1;
      s += noise * 0.02;

      const v = s * 0.12;
      const pan = Math.sin(i * 0.008) * 0.12;
      out[i * 2] = v * (1 - pan);
      out[i * 2 + 1] = v * (1 + pan);
    }
  }
}

class ZenDroneProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const po = options.processorOptions;
    const sr = (po && po.sampleRate) || sampleRate;
    this._synth = new DroneSynth(sr);
    this._active = false;
    this._scratch = new Float32Array(128 * 2);

    this.port.onmessage = (e) => {
      const d = e.data;
      if (d && d.type === 'active') {
        this._active = !!d.value;
      }
    };
  }

  process(inputs, outputs) {
    const out = outputs[0];
    if (!out || out.length < 2) {
      return true;
    }
    const ch0 = out[0];
    const ch1 = out[1];
    const frames = ch0.length;

    if (!this._active) {
      ch0.fill(0);
      ch1.fill(0);
      return true;
    }

    const need = frames * 2;
    if (this._scratch.length < need) {
      this._scratch = new Float32Array(need);
    }
    const slice = this._scratch.subarray(0, need);
    this._synth.processInterleaved(slice);
    for (let i = 0; i < frames; i += 1) {
      ch0[i] = slice[i * 2];
      ch1[i] = slice[i * 2 + 1];
    }
    return true;
  }
}

registerProcessor('zen-drone', ZenDroneProcessor);
