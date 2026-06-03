export function cosine(a, b) {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}

export function buildEdges(nodes, k = 3, threshold = 0.15) {
  const edges = [];
  const seen = new Set();
  for (let i = 0; i < nodes.length; i++) {
    const sims = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const s = cosine(nodes[i].embedding, nodes[j].embedding);
      sims.push({ j, s });
    }
    sims.sort((a, b) => b.s - a.s);
    for (let m = 0; m < Math.min(k, sims.length); m++) {
      const { j, s } = sims[m];
      if (s < threshold) continue;
      const lo = i < j ? i : j;
      const hi = i < j ? j : i;
      const key = `${lo}-${hi}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source: lo, target: hi, weight: s });
    }
  }
  return edges;
}
