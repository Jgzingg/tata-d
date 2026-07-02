/**
 * WorldEdit Addon - Main Entry Point
 * Handles initialization and event listeners
 * Compatible with Minecraft Bedrock 1.20.0+
 */

import { world, system } from "@minecraft/server";
import { commandRegistry } from "./commands/CommandRegistry.js";
import { selectionManager } from "./selection/SelectionManager.js";
import { CONFIG, getMessage } from "./config.js";
import { Vector3 } from "./utils/Vector.js";
import { isCreativeMode } from "./utils/GameMode.js";

/**
 * Initialize addon on first system run
 */
function initializeAddon() {
  try {
    const logPrefix = "§6[WorldEdit]§r ";
    console.info(logPrefix + "Addon loaded successfully!");
    console.info(logPrefix + `Version: 1.1.0 | Max blocks: ${CONFIG.MAX_BLOCK_LIMIT}`);
    console.info(logPrefix + `Type /whelp for command list`);
  } catch (error) {
    console.error("Error initializing addon:", error);
  }
}

/**
 * Handle command execution
 * Subscribes to chat send events and dispatches to CommandRegistry
 */
world.beforeEvents.chatSend.subscribe((event) => {
  try {
    const message = event.message.trim();

    // Only process messages starting with /
    if (!message.startsWith("/")) {
      return;
    }

    // Parse command and arguments
    const parts = message.slice(1).split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check if it's a WorldEdit command (don't interfere with vanilla commands)
    const allCommands = commandRegistry.getCommandNames();
    if (!allCommands.includes(commandName)) {
      return; // Not a WorldEdit command
    }

    // Cancel vanilla command processing
    event.cancel = true;

    // Execute the command
    const player = event.sender;

    // Validate player is in creative mode
    if (!isCreativeMode(player)) {
      player.sendMessage(getMessage("ONLY_CREATIVE"));
      return;
    }

    // Dispatch to command registry
    commandRegistry.execute(commandName, player, args, world);
  } catch (error) {
    console.error("Error processing command:", error);
    try {
      event.sender.sendMessage("§cAn error occurred while processing your command.");
    } catch (e) {
      console.error("Failed to send error message:", e);
    }
  }
});

/**
 * Handle left-click on blocks (set pos1)
 * Uses beforeEvents to detect left-click
 */
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  try {
    const { player, block } = event;

    // Only process if holding wand
    if (!isHoldingWand(player)) {
      return;
    }

    // Validate player is in creative mode
    if (!isCreativeMode(player)) {
      player.sendMessage(getMessage("ONLY_CREATIVE"));
      return;
    }

    // Cancel default behavior
    event.cancel = true;

    // Get block position
    const pos = Vector3.fromLocation(block.location);

    // Set pos1 in selection manager
    selectionManager.setPos1(player.name, pos);

    // Send confirmation message
    const msg = getMessage("POS1_SET", {
      x: pos.x,
      y: pos.y,
      z: pos.z
    });
    player.sendMessage(msg);
  } catch (error) {
    console.error("Error in left-click handler:", error);
    try {
      event.player.sendMessage("§cError setting position 1");
    } catch (e) {
      console.error("Failed to send error message:", e);
    }
  }
});

/**
 * Handle right-click on blocks (set pos2)
 * Uses afterEvents to detect right-click
 */
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  try {
    const { player, block } = event;

    // Only process if holding wand
    if (!isHoldingWand(player)) {
      return;
    }

    // Validate player is in creative mode
    if (!isCreativeMode(player)) {
      return; // Silently ignore, creative check already done on left-click
    }

    // Get block position
    const pos = Vector3.fromLocation(block.location);

    // Set pos2 in selection manager
    selectionManager.setPos2(player.name, pos);

    // Send confirmation message
    const msg = getMessage("POS2_SET", {
      x: pos.x,
      y: pos.y,
      z: pos.z
    });
    player.sendMessage(msg);
  } catch (error) {
    console.error("Error in right-click handler:", error);
  }
});

/**
 * Check if player is holding the wand (selection tool)
 * @param {Player} player
 * @returns {boolean}
 */
function isHoldingWand(player) {
  try {
    // Get inventory component
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) {
      return false;
    }

    // Get item in main hand (last slot in container)
    const mainHandSlot = inventory.container.size - 1;
    const itemStack = inventory.container.getItem(mainHandSlot);

    // Check if item matches wand type
    if (!itemStack) {
      return false;
    }

    return itemStack.typeId === CONFIG.WAND_ITEM;
  } catch (error) {
    console.warn(`Error checking wand for player ${player.name}:`, error);
    return false;
  }
}

/**
 * Get player's position as Vector3
 * @param {Player} player
 * @returns {Vector3}
 */
function getPlayerPosition(player) {
  try {
    return Vector3.fromLocation(player.location);
  } catch (error) {
    console.error("Error getting player position:", error);
    return new Vector3(0, 0, 0);
  }
}

/**
 * Handle player disconnect - cleanup resources
 */
world.afterEvents.playerLeave.subscribe((event) => {
  try {
    const playerName = event.player.name;
    // Optional: Add cleanup logic here for per-player resources
    console.info(`Player ${playerName} disconnected`);
  } catch (error) {
    console.error("Error in player leave handler:", error);
  }
});

/**
 * Run addon initialization on first system tick
 * Using system.run for modern API compatibility
 */
system.run(() => {
  try {
    initializeAddon();
  } catch (error) {
    console.error("Error in addon initialization:", error);
  }
});
