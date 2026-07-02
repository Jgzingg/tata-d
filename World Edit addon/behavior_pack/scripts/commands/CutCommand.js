/**
 * Cut Command
 * Cut selection to clipboard (copy + delete)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { getMessage, CONFIG } from "../config.js";

export class CutCommand extends Command {
  constructor() {
    super(
      "cut",
      "Cut selection to clipboard (copy + delete)",
      "/cut"
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

      this.sendMessage(player, getMessage("PREFIX") + getMessage("OPERATION_STARTING"));

      const bounds = selectionManager.getBounds(player.name);
      const blocks = [];
      let blockCount = 0;

      // Collect and remove all blocks in selection
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
              block.setType("minecraft:air");
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
        getMessage("CLIPBOARD_CUT", { count: blockCount })
      );
    } catch (error) {
      console.error("Cut command error:", error);
      this.sendError(player, "Failed to cut selection");
    }
  }
}
