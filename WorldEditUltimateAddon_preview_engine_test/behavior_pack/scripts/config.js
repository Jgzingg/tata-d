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

  // Preview engine limits. The preview never edits real blocks; these values
  // only throttle entity scanning/spawning so large selections stay playable.
  PREVIEW_MAX_BLOCKS: 8192,
  PREVIEW_UPDATE_INTERVAL: 4,
  PREVIEW_SCAN_BATCH_SIZE: 256,
  PREVIEW_SPAWNS_PER_TICK: 96,
  PREVIEW_REMOVES_PER_TICK: 160,

  // Command prefix (appears before command names in help)
  COMMAND_PREFIX: "/",

  // Wand item (used for selection) - item customizado de verdade.
  // A causa de ele não carregar antes era o schema do items/wand.json:
  // estava usando "category" direto em "description" (formato antigo).
  // A engine atual exige "menu_category": { "category": ... }. Corrigido.
  WAND_ITEM: "worldedit:wand",
  WAND_NAME_TAG: "§6WorldEdit Wand",

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
    BLOCK_NOT_FOUND: "§cBlock \"§6%block%§c\" not found.\n§eDid you mean:§r %suggestions%",
    SUGGESTIONS_HEADER: "§6Suggestions for \"§r%partial%§6\":§r %suggestions%",
    NO_SUGGESTIONS: "§cNo blocks found matching \"§6%partial%§c\".",
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
  let currentGameMode;
  try {
    currentGameMode = player.getGameMode();
  } catch {
    return false;
  }
  if (!CONFIG.ALLOWED_GAME_MODES.includes(currentGameMode)) {
    return false;
  }

  // Check permission list (if empty, allow all)
  if (CONFIG.ALLOWED_PLAYERS.length === 0) {
    return true;
  }

  return CONFIG.ALLOWED_PLAYERS.includes(player.name);
}
