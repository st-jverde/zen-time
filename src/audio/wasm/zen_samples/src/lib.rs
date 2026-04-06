//! Load-time PCM processing for gongs, breath, and drums (no drone loops).
//!
//! JS calls `process_channel_inplace` with a **scratch** `Float32Array` (copy of channel data),
//! not raw `AudioBuffer` views, to avoid wasm-bindgen glue issues with two-slice copies.

use wasm_bindgen::prelude::*;

/// Copies `min(src.len(), dst.len())` samples from `src` into `dst` (for tests / non-audio callers).
#[wasm_bindgen]
pub fn copy_f32_slice(src: &[f32], dst: &mut [f32]) {
    let n = src.len().min(dst.len());
    dst[..n].copy_from_slice(&src[..n]);
}

/// Load-time processing for one channel. Phase 1: identity (no audible change).
/// Future DSP replaces the body while keeping this signature.
pub fn process_channel_inplace_inner(data: &mut [f32]) {
    let _ = data;
}

/// Single `&mut [f32]` entry point for the browser (scratch buffer from JS).
#[wasm_bindgen]
pub fn process_channel_inplace(data: &mut [f32]) {
    process_channel_inplace_inner(data);
}

#[cfg(test)]
mod tests {
    use super::process_channel_inplace_inner;

    #[test]
    fn identity_preserves_empty() {
        let mut v: Vec<f32> = vec![];
        process_channel_inplace_inner(&mut v);
        assert!(v.is_empty());
    }

    #[test]
    fn identity_preserves_values() {
        let mut v = vec![0.0f32, -1.5, f32::INFINITY, f32::NEG_INFINITY];
        let snapshot = v.clone();
        process_channel_inplace_inner(&mut v);
        assert_eq!(v, snapshot);
    }
}
