/**
 * Copy Command
 * Copy selection to clipboard
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { getMessage, CONFIG } from "../config.js";

export class CopyCommand extends Command {
  constructor() {
    super(
      "copy",
      "Copy selection to clipboard",
      "/copy"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      // Check selection
      if (!selectionManager.hasSelection(player.name)) {
        this.sendError(player, getMessage("NO_SELECTION"));
        return;
      }

      this.sendMessage(player, getMessage("PREFIX") + getMessage("OPERATION_STARTING"));

      const bounds = selectionManager.getBounds(player.name);
      const blocks = [];
      let blockCount = 0;

      // Collect all blocks in selection
      for (let x = bounds.min.x; x <= bounds.max.x; x++) {
        for (let y = bounds.min.y; y <= bounds.max.y; y++) {
          for (let z = bounds.min.z; z <= bounds.max.z; z++) {
            try {
              const dimension = world.getDimension(player.dimension.id);
              const block = dimension.getBlock({ x, y, z });
              blocks.push({
                pos: { x, y, z },
                blockType: block.typeId,
                blockData: block
              });
              blockCount++;
            } catch (error) {
              // Skip blocks that can't be accessed
            }
          }
        }
      }

      // Copy to clipboard
      clipboardManager.copyBlocks(player.name, blocks);

      this.sendSuccess(
        player,
        getMessage("CLIPBOARD_COPIED", { count: blockCount })
      );
    } catch (error) {
      console.error("Copy command error:", error);
      this.sendError(player, "Failed to copy selection");
    }
  }
}
