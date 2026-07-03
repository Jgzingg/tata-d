import { blockRegistry } from "./BlockRegistry.js";
import { getSuggestions } from "./BlockAutocomplete.js";

export function getAllBlocks() {
  return blockRegistry.getAllIds();
}

export function searchBlocks(query, limit = 10) {
  const normalized = (query || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const ids = blockRegistry.getAllIds();

  if (!normalized) {
    return ids.slice(0, limit);
  }

  const fullMatches = ids
    .filter((id) => id.toLowerCase().includes(normalized))
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

  if (fullMatches.length >= limit) {
    return fullMatches.slice(0, limit);
  }

  const suggestionIds = getSuggestions(normalized, blockRegistry, limit)
    .map((shortName) => blockRegistry.getByShortName(shortName)[0])
    .filter(Boolean);

  return Array.from(new Set([...fullMatches, ...suggestionIds])).slice(0, limit);
}
