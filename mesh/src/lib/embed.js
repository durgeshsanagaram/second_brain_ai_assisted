// Real sentence embeddings via transformers.js, running entirely in-browser
// against the bundled all-MiniLM-L6-v2 (q8) under /models/.
//
// `loadEmbedder()` warms the pipeline once. `embed()`/`embedBatch()` return
// L2-normalized 384-dim Float32Arrays so cosine collapses to a dot product.

import { pipeline, env } from '@huggingface/transformers';
export { cosine, buildEdges } from './graph-math.js';

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = '/models/';
// transformers.js v4 requires the object form (not a string prefix).
// We ship the non-asyncify simd-threaded variant — works on all browsers.
env.backends.onnx.wasm.wasmPaths = {
  wasm: '/wasm/ort-wasm-simd-threaded.wasm',
  mjs: '/wasm/ort-wasm-simd-threaded.mjs'
};

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

let _extractorPromise = null;

export function loadEmbedder() {
  if (!_extractorPromise) {
    _extractorPromise = pipeline('feature-extraction', MODEL_ID, {
      dtype: 'q8'
    });
  }
  return _extractorPromise;
}

export async function embed(text) {
  const extractor = await loadEmbedder();
  const out = await extractor(text || '', { pooling: 'mean', normalize: true });
  return new Float32Array(out.data);
}

export async function embedBatch(texts) {
  if (!texts.length) return [];
  const extractor = await loadEmbedder();
  const out = await extractor(texts, { pooling: 'mean', normalize: true });
  // Flat tensor of shape [N, dim]; split per row.
  const dim = out.dims[out.dims.length - 1];
  const flat = out.data;
  const vecs = [];
  for (let i = 0; i < texts.length; i++) {
    vecs.push(new Float32Array(flat.buffer, flat.byteOffset + i * dim * 4, dim).slice());
  }
  return vecs;
}

