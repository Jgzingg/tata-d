/**
 * Block Validator
 *
 * Thin facade over BlockRegistry + BlockAliasResolver + BlockAutocomplete
 * that resolves whatever a player types into a real, engine-valid block id.
 *
 * IMPORTANT: this file intentionally contains NO block lists. Every block
 * comes from BlockTypes.getAll() (see blocks/BlockRegistry.js), discovered
 * and cached once when the addon starts. New blocks added by Mojang in
 * future versions work automatically - nothing here needs updating.
 */
import { BlockPermutation } from "@minecraft/server";
import { blockRegistry } from "../blocks/BlockRegistry.js";
import { resolveAlias } from "../blocks/BlockAliasResolver.js";
import { searchBlocks } from "../blocks/BlockIntelligence.js";

/**
 * Final source of truth: confirm the engine itself accepts this id.
 * Being "in the registry" isn't quite enough on its own - this is the
 * same check the game performs when actually placing the block.
 * @param {string} id
 */
function isPermutationValid(id) {
  try {
    BlockPermutation.resolve(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve arbitrary player input ("diamond", "oak_log", "minecraft:stone",
 * a typo like "diamnd"...) into a canonical, engine-valid block id.
 *
 * This is the function all commands should use going forward.
 *
 * @param {string} input raw text typed by the player
 * @returns {{success: true, id: string} | {success: false, suggestions: string[]}}
 */
export function resolveBlockInput(input) {
  const raw = (input || "").trim().toLowerCase();
  if (!raw) return { success: false, suggestions: [] };

  if (raw.includes(":")) {
    // Full namespaced id, e.g. "minecraft:diamond_block" or a 3rd-party "modname:custom_block"
    if (blockRegistry.hasId(raw) && isPermutationValid(raw)) {
      return { success: true, id: raw };
    }
  } else {
    // Alias / short-name resolution ("diamond", "log", "stone"...)
    const aliasResolved = resolveAlias(raw, blockRegistry);
    if (aliasResolved && isPermutationValid(aliasResolved)) {
      return { success: true, id: aliasResolved };
    }

    // Direct "minecraft:<input>" fallback for real vanilla ids the
    // alias/short-name resolver didn't need to touch (e.g. "obsidian").
    const direct = "minecraft:" + raw;
    if (blockRegistry.hasId(direct) && isPermutationValid(direct)) {
      return { success: true, id: direct };
    }
  }

  // Nothing matched - offer suggestions instead of a bare error
  const bare = raw.includes(":") ? raw.split(":")[1] : raw;
  return { success: false, suggestions: searchBlocks(bare, 5) };
}

/**
 * @deprecated prefer resolveBlockInput() - this only returns a boolean
 * and loses the suggestion list. Kept for any external/legacy callers.
 */
export function isValidBlock(blockType) {
  return resolveBlockInput(blockType).success;
}

/**
 * @deprecated prefer resolveBlockInput() - this only prefixes with
 * "minecraft:" and does NOT resolve aliases. Kept for backward
 * compatibility with code that just needs a display-safe id shape.
 */
export function normalizeBlockName(blockType) {
  if (!blockType) return "";
  let normalized = blockType.toLowerCase().trim();
  if (!normalized.includes(":")) {
    normalized = "minecraft:" + normalized;
  }
  return normalized;
}

/** @returns {string[]} every known block id - for tooling/debug only */
export function getValidBlocks() {
  return blockRegistry.getAllIds();
}

/** @returns {string} short display name without namespace */
export function getBlockDisplayName(blockType) {
  const normalized = normalizeBlockName(blockType);
  return normalized.split(":")[1] || normalized;
}
