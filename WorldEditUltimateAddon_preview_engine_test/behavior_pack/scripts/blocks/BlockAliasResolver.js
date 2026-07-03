/**
 * Block Alias Resolver
 *
 * Resolves short/common names ("diamond", "log", "grass") to a canonical
 * full block id, WITHOUT relying on a manually maintained block list.
 *
 * Two layers:
 *   1) A small curated alias table - only for genuinely ambiguous cases
 *      where there's no algorithmic way to know a player typing "diamond"
 *      means "diamond_block" and not "diamond_ore". This table maps
 *      names to disambiguate, it does NOT enumerate blocks.
 *   2) A generic fallback that searches the live BlockRegistry for exact
 *      short-name matches or unambiguous word/suffix matches, so any
 *      block that already has an unambiguous vanilla id (e.g. "gravel",
 *      "sand", "obsidian") resolves automatically with zero maintenance.
 */

const ALIASES = {
  // Ore/resource blocks -> their storage block (most common intent)
  diamond: "diamond_block",
  emerald: "emerald_block",
  gold: "gold_block",
  iron: "iron_block",
  coal: "coal_block",
  redstone: "redstone_block",
  lapis: "lapis_block",
  netherite: "netherite_block",
  copper: "copper_block",
  quartz: "quartz_block",

  // Generic wood/plant family names -> oak (Java's convention default)
  grass: "grass_block",
  log: "oak_log",
  wood: "oak_wood",
  plank: "oak_planks",
  planks: "oak_planks",
  leaves: "oak_leaves",
  door: "oak_door",
  fence: "oak_fence",
  stairs: "oak_stairs",
  slab: "oak_slab",
  trapdoor: "oak_trapdoor",
  button: "oak_button",
  sign: "oak_sign",
  boat: "oak_boat",

  // Color-family defaults -> white
  wool: "white_wool",
  concrete: "white_concrete",
  concretepowder: "white_concrete_powder",
  stainedglass: "white_stained_glass",
  bed: "red_bed",

  brick: "bricks",
};

/**
 * @param {string} rawInput lowercase, trimmed player input (no "minecraft:")
 * @param {import("./BlockRegistry.js").blockRegistry} registry
 * @returns {string|null} full block id ("minecraft:...") or null if unresolved
 */
export function resolveAlias(rawInput, registry) {
  const input = rawInput.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!input) return null;

  // 1) Curated alias table
  if (ALIASES[input]) {
    const target = "minecraft:" + ALIASES[input];
    if (registry.hasId(target)) return target;
  }

  // 2) Exact short-name match in the registry, e.g. "stone" -> "minecraft:stone"
  const exact = registry.getByShortName(input);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return pickCanonical(exact);

  // 3) Unambiguous suffix match, e.g. singular words that only ever
  //    appear as one real block ("sapling" style names not covered above).
  const suffixMatches = registry
    .getShortNames()
    .filter((name) => name === input || name.endsWith("_" + input));

  if (suffixMatches.length === 1) {
    return registry.getByShortName(suffixMatches[0])[0];
  }
  if (suffixMatches.length > 1) {
    const ids = suffixMatches.flatMap((n) => registry.getByShortName(n));
    return pickCanonical(ids);
  }

  return null;
}

/**
 * When multiple real blocks could match, heuristically pick the most
 * "vanilla common" one: penalize variant prefixes (deepslate_, waxed_,
 * exposed_, etc.) and prefer shorter/simpler ids on ties.
 * @param {string[]} ids
 */
function pickCanonical(ids) {
  const deprioritized = [
    "deepslate_",
    "waxed_",
    "exposed_",
    "weathered_",
    "oxidized_",
    "infested_",
    "cracked_",
    "chiseled_",
    "polished_",
    "smooth_",
  ];

  const scored = ids.map((id) => {
    const short = id.split(":")[1] || id;
    let penalty = 0;
    for (const prefix of deprioritized) {
      if (short.startsWith(prefix)) penalty += 10;
    }
    penalty += short.length; // shorter/simpler names win ties
    return { id, penalty };
  });

  scored.sort((a, b) => a.penalty - b.penalty);
  return scored[0].id;
}

export { ALIASES };
