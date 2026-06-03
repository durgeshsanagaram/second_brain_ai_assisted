<script>
  const SUGGESTIONS = [
    'fast ai hardware',
    'how to think clearly',
    'craft and taste',
    'find ideas by feeling',
  ];

  let {
    open,
    searchQ = $bindable(''),
    searchInput = $bindable(null),
    searchResults,
    selectedId,
    onClose,
    onSelect,
  } = $props();
</script>

<div class="search-panel {open ? 'open' : ''}">
  <div class="search-head">
    <div class="search-head-label">SEMANTIC SEARCH</div>
    <button class="x-btn" onclick={onClose} aria-label="Close">×</button>
  </div>

  <div class="search-input-wrap">
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="8.5" cy="8.5" r="5" />
      <line x1="12.5" y1="12.5" x2="17" y2="17" />
    </svg>
    <input
      bind:this={searchInput}
      bind:value={searchQ}
      class="search-input"
      placeholder="search by meaning…"
      autocomplete="off"
      spellcheck="false"
    />
  </div>

  {#if !searchQ.trim()}
    <div class="search-suggest">
      <div class="suggest-block">
        <div class="suggest-label">TRY</div>
        {#each SUGGESTIONS as phrase}
          <button class="suggest-row" onclick={() => (searchQ = phrase)}>
            <span class="suggest-arrow">→</span>
            <span>{phrase}</span>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <div class="search-results">
      <div class="results-label">
        <span>{searchResults.length} RESULT{searchResults.length === 1 ? '' : 'S'}</span>
        <span class="rule"></span>
        <span class="dim">ranked by similarity</span>
      </div>

      {#if searchResults.length === 0}
        <div class="empty-results">
          <div class="empty-results-title">no semantic match</div>
          <div class="empty-results-sub">
            your notes don't relate to this query — try another phrasing or add a note about it.
          </div>
        </div>
      {/if}

      {#each searchResults as r, i (r.node.id)}
        <button
          class="result-row {selectedId === r.node.id ? 'active' : ''}"
          onclick={() => onSelect(r.node.id)}
        >
          <div class="result-rank">{String(i + 1).padStart(2, '0')}</div>
          <div class="result-body">
            <div class="result-text">{r.node.content}</div>
            <div class="result-meta">
              <div class="result-bar">
                <div class="result-bar-fill" style:width="{r.score * 100}%"></div>
              </div>
              <div class="result-score">{(r.score * 100).toFixed(0)}<span class="dim">%</span></div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
