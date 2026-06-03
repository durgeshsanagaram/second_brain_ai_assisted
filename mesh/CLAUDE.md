# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install deps + runs postinstall (fetch-model.mjs downloads MiniLM + copies ORT wasm)
npm run dev        # start Vite dev server at http://localhost:5174
npm run build      # production build → dist/ (also runs prune-dist.mjs to remove unused wasm variants)
npm run preview    # serve the dist/ build locally
npm run check      # svelte-check type/lint pass (uses jsconfig.json)
npm run check:seed # embed all seed notes offline and report edge graph stats (requires model in public/)
npm run setup      # re-run model/wasm download without reinstalling packages
```

`check:seed` accepts an optional threshold argument (`node scripts/check-seed.mjs 0.18`) and `--sweep` to print a full threshold table.

## Architecture

**Stack:** Svelte 5 (runes API: `$state`, `$derived`, `$effect`, `$props`) + Vite + d3-force + `@huggingface/transformers` running ONNX in-browser via `onnxruntime-web`.

**Key source files:**

- `src/App.svelte` — root component. Owns all application state: `nodes`, `edges`, `selectedId`, `modelReady`, and all search state (`searchOpen`, `searchQ`, `queryEmbed`, `searchInput`, `searchResults`, `highlightIds`). `SIM_THRESHOLD` and `SEARCH_THRESHOLD` are both `0.15` — they must stay in sync (both calibrated against MiniLM-L6-v2 on the seed corpus).
- `src/lib/Graph.svelte` — canvas renderer + d3-force simulation. Simulation nodes live in a `Map<id, simNode>` (`simNodes`) that persists across re-renders. Accepts `highlightIds: Set<string>` and `dimNonHighlight: boolean` for search-driven visual emphasis (lime halos on hits, alpha-down on non-hits). Note: the canvas colors are hardcoded RGBA — they don't pick up CSS token changes automatically.
- `src/lib/SearchPanel.svelte` — semantic search UI. Receives `open`, `searchQ` (bindable), `searchInput` (bindable element ref), `searchResults`, `selectedId`, `onClose`, `onSelect`. Renders suggestion chips when query is empty; ranked results with score bars when non-empty. All reactive logic (embed effect, keyboard handler, derived results) lives in App, not here.
- `src/lib/NodeCard.svelte` — detail card for the selected node, purely presentational.
- `src/lib/embed.js` — transformers.js wrapper. `loadEmbedder()` is a singleton promise. `embed(text)` and `embedBatch(texts)` return L2-normalized `Float32Array`s (384-dim). Re-exports `cosine` and `buildEdges` from `graph-math.js`.
- `src/lib/graph-math.js` — pure math with no browser/ONNX dependency: `cosine(a, b)` (dot product of pre-normalized vectors) and `buildEdges(nodes, k, threshold)` (O(n²) k-NN edge builder). Imported by both `embed.js` and `scripts/check-seed.mjs`.
- `src/lib/seed.js` — array of demo note strings (`SEED_NOTES`) used on first load.

**Model & WASM setup:**

`scripts/fetch-model.mjs` (runs as `postinstall`) downloads `Xenova/all-MiniLM-L6-v2` (q8 ONNX) from Hugging Face into `public/models/` and copies `ort-wasm-simd-threaded.{wasm,mjs}` + the jsep (WebGPU) variants from `node_modules/onnxruntime-web/dist/` into `public/wasm/`. Both directories are `.gitignore`d.

In `embed.js`, `env.backends.onnx.wasm.wasmPaths` is set to the object form (not a URL prefix string) — required by transformers.js v4. `@huggingface/transformers` is excluded from Vite's dep pre-bundling (`optimizeDeps.exclude`) so its dynamic WASM loading isn't broken by bundling.

**Accent palette (v0.2 — canonical):**

Two accent roles, neutral palette (greys, `--text`, `--line`, panel backgrounds) unchanged:

| Token | Value | Role |
|---|---|---|
| `--accent` | `oklch(0.62 0.18 295)` | violet — focus rings, brand glyph, search input border-focus, connection-bar gradient, score numerals in node card |
| `--accent-dim` | `oklch(0.42 0.10 295)` | muted violet — secondary accent surfaces |
| `--accent-2` | `oklch(0.78 0.16 130)` | lime — score bars, active search result row, score/weight numerals |
| `--accent-2-dim` | `oklch(0.55 0.10 130)` | muted lime — score bar gradient start |

Never use `--cyan*` or `--amber*` — those tokens were removed in v0.2 (Maya Chen, 2026-04-27). All hardcoded `oklch(... 200 ...)` values in the codebase are violet (hue 295); `oklch(... 75 ...)` values are lime (hue 130). Graph node canvas colors (selected-node cyan halos, neutral grey rings) are a separate spike and have not been migrated yet.

**Edge graph and search mechanics:**

`buildEdges` (from `graph-math.js`) is called as a `$derived` in `App.svelte` on every nodes change — O(n²), fine for dozens of notes. `SIM_THRESHOLD = 0.15` was chosen because MiniLM cosines run hotter than the original toy embedding. Use `npm run check:seed --sweep` to re-calibrate if the seed notes change significantly.

Search embeds the query via a cancellable `$effect` (stale results from in-flight embeds are discarded via a `cancelled` flag). `searchResults` and `highlightIds` are `$derived` from `queryEmbed`. `SEARCH_THRESHOLD` must match `SIM_THRESHOLD` — don't change either in isolation. The keyboard handler (`$effect` in App) owns both `Cmd/Ctrl+K` (open panel) and `Escape` (close panel → deselect node, in that priority order). `searchInput` is declared as `$state(null)` in App so the `bind:searchInput` prop binding across the component boundary works correctly in Svelte 5.

**Build troubleshooting:** If `npm run build` fails with `Cannot find module @rollup/rollup-darwin-arm64` or a code-signing error on the `.node` binary, do a clean reinstall: `rm -rf node_modules package-lock.json && npm install`.

**Design reference:** `design/` contains the original prototype (React HTML + custom verlet physics + toy embeddings). It is read-only reference material — do not modify it.
