/**
 * Block Autocomplete
 *
 * Produces ranked suggestion lists for a partial block name, entirely
 * from the live BlockRegistry (no fixed lists). Used both for:
 *   - "did you mean" error messages when a typed block doesn't resolve
 *   - the manual /wsuggest command (see commands/WSuggestCommand.js),
 *     which is the closest equivalent to real-time autocomplete that
 *     the Script API allows for free-text command arguments (see the
 *     note in main.js about the CustomCommandParamType.BlockType
 *     trade-off).
 */
import { fuzzyRank } from "./FuzzySearch.js";

/**
 * @param {string} partial what the player has typed so far (e.g. "d", "gra", "diamnd")
 * @param {import("./BlockRegistry.js").blockRegistry} registry
 * @param {number} limit max number of suggestions to return
 * @returns {string[]} short block names, best match first
 */
export function getSuggestions(partial, registry, limit = 6) {
  registry.load();
  const query = (partial || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const allShortNames = registry.getShortNames();

  if (!query) {
    return allShortNames.slice(0, limit);
  }

  // Prefix matches are the most relevant (mirrors vanilla /give suggestions)
  const prefixMatches = allShortNames
    .filter((name) => name.startsWith(query))
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

  if (prefixMatches.length >= limit) {
    return prefixMatches.slice(0, limit);
  }

  // Fill remaining slots with typo-tolerant fuzzy matches
  const remaining = limit - prefixMatches.length;
  const fuzzyPool = allShortNames.filter((name) => !prefixMatches.includes(name));
  const fuzzyMatches = fuzzyRank(query, fuzzyPool, remaining);

  return [...prefixMatches, ...fuzzyMatches];
}
