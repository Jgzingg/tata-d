/**
 * Block Validator
 * Validate and convert block names
 */

/**
 * Valid Minecraft block types (common ones)
 * This is a subset - Bedrock has many more blocks
 */
const VALID_BLOCKS = new Set([
  "minecraft:stone",
  "minecraft:dirt",
  "minecraft:grass",
  "minecraft:cobblestone",
  "minecraft:oak_log",
  "minecraft:oak_leaves",
  "minecraft:sand",
  "minecraft:gravel",
  "minecraft:gold_ore",
  "minecraft:iron_ore",
  "minecraft:coal_ore",
  "minecraft:bookshelf",
  "minecraft:mossy_cobblestone",
  "minecraft:obsidian",
  "minecraft:end_stone",
  "minecraft:netherrack",
  "minecraft:soul_sand",
  "minecraft:oak_planks",
  "minecraft:spruce_planks",
  "minecraft:birch_planks",
  "minecraft:jungle_planks",
  "minecraft:acacia_planks",
  "minecraft:dark_oak_planks",
  "minecraft:glass",
  "minecraft:glass_pane",
  "minecraft:oak_fence",
  "minecraft:oak_door",
  "minecraft:birch_door",
  "minecraft:spruce_door",
  "minecraft:jungle_door",
  "minecraft:acacia_door",
  "minecraft:dark_oak_door",
  "minecraft:oak_stairs",
  "minecraft:birch_stairs",
  "minecraft:spruce_stairs",
  "minecraft:jungle_stairs",
  "minecraft:acacia_stairs",
  "minecraft:dark_oak_stairs",
  "minecraft:cobblestone_stairs",
  "minecraft:brick",
  "minecraft:bricks",
  "minecraft:sandstone",
  "minecraft:sandstone_stairs",
  "minecraft:nether_brick",
  "minecraft:nether_bricks",
  "minecraft:nether_brick_stairs",
  "minecraft:emerald_ore",
  "minecraft:diamond_ore",
  "minecraft:diamond_block",
  "minecraft:gold_block",
  "minecraft:iron_block",
  "minecraft:lapis_ore",
  "minecraft:lapis_block",
  "minecraft:redstone_ore",
  "minecraft:emerald_block",
  "minecraft:spruce_log",
  "minecraft:birch_log",
  "minecraft:jungle_log",
  "minecraft:acacia_log",
  "minecraft:dark_oak_log",
  "minecraft:waxed_copper_block",
  "minecraft:purpur_block",
  "minecraft:purpur_stairs",
  "minecraft:tinted_glass",
  "minecraft:amethyst_block",
  "minecraft:budding_amethyst",
  "minecraft:copper_ore",
  "minecraft:copper_block",
  "minecraft:deepslate",
  "minecraft:deepslate_copper_ore",
  "minecraft:deepslate_iron_ore",
  "minecraft:deepslate_gold_ore",
  "minecraft:deepslate_diamond_ore",
  "minecraft:deepslate_emerald_ore",
  "minecraft:tuff",
  "minecraft:calcite",
  "minecraft:dripstone_block",
  "minecraft:raw_copper_block",
  "minecraft:raw_iron_block",
  "minecraft:raw_gold_block",
  "minecraft:moss_block",
  "minecraft:sculk",
  "minecraft:sculk_vein",
  "minecraft:sculk_catalyst",
  "minecraft:sculk_shrieker",
  "minecraft:mangrove_log",
  "minecraft:mangrove_wood",
  "minecraft:mangrove_planks",
  "minecraft:mangrove_stairs",
  "minecraft:waxed_copper_stairs",
  "minecraft:oak_wood",
  "minecraft:spruce_wood",
  "minecraft:birch_wood",
  "minecraft:jungle_wood",
  "minecraft:acacia_wood",
  "minecraft:dark_oak_wood",
  "minecraft:air"
]);

/**
 * Validate if block type is valid
 * @param {string} blockType - Block name (with or without minecraft: prefix)
 * @returns {boolean}
 */
export function isValidBlock(blockType) {
  const normalized = normalizeBlockName(blockType);
  return VALID_BLOCKS.has(normalized);
}

/**
 * Normalize block name to minecraft:name format
 * @param {string} blockType
 * @returns {string}
 */
export function normalizeBlockName(blockType) {
  if (!blockType) return "";
  blockType = blockType.toLowerCase().trim();
  if (!blockType.includes(":")) {
    blockType = "minecraft:" + blockType;
  }
  return blockType;
}

/**
 * Get all valid block names
 * @returns {string[]}
 */
export function getValidBlocks() {
  return Array.from(VALID_BLOCKS);
}

/**
 * Get block name without namespace
 * @param {string} blockType
 * @returns {string}
 */
export function getBlockDisplayName(blockType) {
  const normalized = normalizeBlockName(blockType);
  return normalized.split(":")[1] || normalized;
}
