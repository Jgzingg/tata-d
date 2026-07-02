/**
 * Sel Command
 * Show current selection info
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { getMessage } from "../config.js";

export class SelCommand extends Command {
  constructor() {
    super(
      "sel",
      "Show current selection information",
      "/sel"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      if (!selectionManager.hasSelection(player.name)) {
        this.sendError(player, getMessage("NO_SELECTION"));
        return;
      }

      const bounds = selectionManager.getBounds(player.name);
      const dims = selectionManager.getBlockCount(player.name);
      const blockCount = selectionManager.getBlockCount(player.name);

      const selection = selectionManager.getSelection(player.name);
      const pos1 = selection.pos1;
      const pos2 = selection.pos2;
      const dimensions = selection.getDimensions();

      const message = 
        `§6=== Selection Info ===\n` +
        `§6Position 1:§r ${pos1.x}, ${pos1.y}, ${pos1.z}\n` +
        `§6Position 2:§r ${pos2.x}, ${pos2.y}, ${pos2.z}\n` +
        `§6Dimensions:§r ${dimensions.x}×${dimensions.y}×${dimensions.z}\n` +
        `§6Blocks:§r ${blockCount}`;

      this.sendMessage(player, getMessage("PREFIX") + message);
    } catch (error) {
      console.error("Sel command error:", error);
      this.sendError(player, "Failed to get selection info");
    }
  }
}
