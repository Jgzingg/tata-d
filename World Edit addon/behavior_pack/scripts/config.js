/**
 * WorldEdit Addon - Configuration
 * Central configuration for all addon settings
 */

export const CONFIG = {
  // Maximum number of blocks that can be selected/edited at once
  MAX_BLOCK_LIMIT: 500000,

  // Number of blocks to process per tick (for batch operations)
  BLOCKS_PER_TICK: 500,

  // Update progress bar every N blocks
  PROGRESS_UPDATE_INTERVAL: 5000,

  // Command prefix (appears before command names in help)
  COMMAND_PREFIX: "/",

  // Wand item (used for selection)
  WAND_ITEM: "minecraft:diamond_axe",

  // Game modes allowed to use the addon
  ALLOWED_GAME_MODES: ["creative"],

  // Players allowed to use addon (empty = all players in creative)
  ALLOWED_PLAYERS: [],

  // Messages
  MESSAGES: {
    PREFIX: "§6[WorldEdit]§r ",
    ONLY_CREATIVE: "§cThis addon can only be used in Creative mode.",
    NO_PERMISSION: "§cYou don't have permission to use this command.",
    NO_SELECTION: "§cYou must select an area first. Use /wand to get the wand.",
    POS1_SET: "§aPosition 1 set to §6%x%, §6%y%, §6%z%",
    POS2_SET: "§aPosition 2 set to §6%x%, §6%y%, §6%z%",
    SELECTION_INFO: "§aSelection Info:\n§6Position 1:§r %pos1%\n§6Position 2:§r %pos2%\n§6Dimensions:§r %dims%\n§6Blocks:§r %blocks%",
    INVALID_BLOCK: "§cInvalid block: §6%block%",
    BLOCK_LIMIT_EXCEEDED: "§cSelection too large! Maximum: §6%max%§c blocks, your selection: §6%actual%§c blocks",
    OPERATION_STARTING: "§aOperation starting... This may take a moment.",
    OPERATION_COMPLETE: "§aOperation complete! §6%count%§a blocks processed.",
    CLIPBOARD_COPIED: "§aClipboard copied! §6%count%§a blocks copied.",
    CLIPBOARD_CUT: "§aClipboard cut! §6%count%§a blocks cut.",
    CLIPBOARD_EMPTY: "§cClipboard is empty. Use /copy or /cut first.",
    PASTE_COMPLETE: "§aArea pasted! §6%count%§a blocks placed.",
    UNDO_COMPLETE: "§aUndo complete!",
    REDO_COMPLETE: "§aRedo complete!",
    NOTHING_TO_UNDO: "§cNothing to undo.",
    NOTHING_TO_REDO: "§cNothing to redo.",
    WAND_RECEIVED: "§aYou received the §6WorldEdit Wand§a!",
    INVALID_ARGUMENTS: "§cInvalid arguments. Usage: §6%usage%",
    UNKNOWN_COMMAND: "§cUnknown command. Use /whelp for help.",
    STACK_COMPLETE: "§aStack complete! §6%count%§a blocks duplicated.",
    MOVE_COMPLETE: "§aMove complete! §6%count%§a blocks moved.",
    WHELP_HEADER: "§6=== WorldEdit Commands ===",
    WHELP_ENTRY: "§6%cmd% §r- %desc%"
  }
};

/**
 * Get a message with replacements
 * @param {string} key - Message key
 * @param {Object} replacements - Replace values {placeholder: value}
 * @returns {string}
 */
export function getMessage(key, replacements = {}) {
  let message = CONFIG.MESSAGES[key] || CONFIG.MESSAGES.PREFIX + "Unknown message";
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    message = message.replace(new RegExp(`%${placeholder}%`, "g"), value);
  });

  return CONFIG.MESSAGES.PREFIX + message;
}

/**
 * Check if player can use addon
 * @param {Player} player
 * @returns {boolean}
 */
export function canPlayerUseAddon(player) {
  // Check game mode
  if (!CONFIG.ALLOWED_GAME_MODES.includes(player.gameMode)) {
    return false;
  }

  // Check permission list (if empty, allow all)
  if (CONFIG.ALLOWED_PLAYERS.length === 0) {
    return true;
  }

  return CONFIG.ALLOWED_PLAYERS.includes(player.name);
}
