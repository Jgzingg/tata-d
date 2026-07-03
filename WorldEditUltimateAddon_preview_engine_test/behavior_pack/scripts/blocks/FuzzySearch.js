/**
 * Fuzzy Search
 *
 * Generic string-similarity ranking used to power "did you mean" style
 * suggestions and autocomplete ordering. No knowledge of blocks here -
 * this module just ranks strings against a query.
 */

/**
 * Classic Levenshtein edit distance (single-row DP, O(n) memory).
 * @param {string} a
 * @param {string} b
 * @returns {number} number of single-character edits to turn a into b
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[n];
}

/**
 * Compound block names ("diamond_block") shouldn't be penalized against
 * a typo'd query just because the whole string is long - what matters
 * is how close the query is to the MOST similar underscore-separated
 * segment. Without this, "diamnd" (typo of "diamond") would rank a
 * short unrelated word like "sand" above "diamond_block", since raw
 * Levenshtein distance favors short strings.
 * @param {string} query
 * @param {string} candidate
 */
function bestSegmentDistance(query, candidate) {
  let best = levenshtein(query, candidate);
  for (const part of candidate.split("_")) {
    const d = levenshtein(query, part);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Lower score = better match. Prefix/word-boundary matches are ranked
 * far above pure edit-distance matches, so typing "log" surfaces
 * "oak_log" before some unrelated block that happens to be 3 edits away.
 * @param {string} query
 * @param {string} candidate
 */
function score(query, candidate) {
  if (candidate === query) return 0;
  if (candidate.startsWith(query)) return 1 + (candidate.length - query.length) * 0.05;
  if (candidate.includes("_" + query)) return 2 + (candidate.length - query.length) * 0.05;
  if (candidate.includes(query)) return 3 + (candidate.length - query.length) * 0.05;
  return 4 + bestSegmentDistance(query, candidate);
}

/**
 * Rank candidates against a query, best match first.
 * @param {string} query
 * @param {string[]} candidates
 * @param {number} limit
 * @returns {string[]}
 */
export function fuzzyRank(query, candidates, limit = 5) {
  if (!query) return candidates.slice(0, limit);

  return candidates
    .map((c) => ({ c, s: score(query, c) }))
    .sort((a, b) => a.s - b.s || a.c.length - b.c.length || a.c.localeCompare(b.c))
    .slice(0, limit)
    .map((r) => r.c);
}

export { levenshtein };
