//! Lightweight stereo drone: a few detuned partials + tiny noise. No heap alloc in `process_interleaved`.
//! Used for experiments / parity checks; the app’s procedural drone runs in JS (`droneWorkletProcessor.js`).

use wasm_bindgen::prelude::*;

const TWO_PI: f64 = std::f64::consts::TAU;

#[wasm_bindgen]
pub struct DroneSynth {
    sr: f64,
    phase: [f64; 3],
    freq: [f64; 3],
    noise: u32,
}

#[wasm_bindgen]
impl DroneSynth {
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32) -> DroneSynth {
        let sr = f64::from(sample_rate);
        DroneSynth {
            sr,
            phase: [0.0, 0.0, 0.0],
            freq: [55.0, 82.5, 110.0],
            noise: 0x9e3779b9,
        }
    }

    /// Fills interleaved stereo `[L0, R0, L1, R1, ...]`.
    pub fn process_interleaved(&mut self, out: &mut [f32]) {
        if out.len() < 2 || out.len() % 2 != 0 {
            return;
        }
        let frames = out.len() / 2;
        for i in 0..frames {
            let mut s = 0.0f64;
            for k in 0..3 {
                self.phase[k] += TWO_PI * self.freq[k] / self.sr;
                if self.phase[k] > TWO_PI {
                    self.phase[k] -= TWO_PI;
                }
                s += f64::sin(self.phase[k]) * (1.0 / 3.0);
            }
            // Match `droneWorkletProcessor.js`: XOR chain on u32 (`>>>` semantics); noise uses the
            // *signed* 32-bit value of `x` in `(x / 0xffffffff) * 2 - 1`, not the unsigned magnitude.
            let mut x = self.noise;
            x ^= x.wrapping_shl(13);
            x ^= x >> 17;
            x ^= x.wrapping_shl(5);
            self.noise = x;
            let n = (f64::from(x as i32) / f64::from(u32::MAX)) * 2.0 - 1.0;
            s += n * 0.02;

            let v = (s * 0.12) as f32;
            let pan = ((i as f32) * 0.008).sin() * 0.12;
            out[i * 2] = v * (1.0 - pan);
            out[i * 2 + 1] = v * (1.0 + pan);
        }
    }
}
