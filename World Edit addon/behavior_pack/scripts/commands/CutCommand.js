/**
 * Cut Command
 * Cut selection to clipboard (copy + delete) using batch processing
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { getMessage, CONFIG } from "../config.js";
import { batchProcessor } from "../utils/BatchProcessor.js";

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

      const blockCount = selectionManager.getBlockCount(player.name);
      if (blockCount > CONFIG.MAX_BLOCK_LIMIT) {
        this.sendError(
          player,
          getMessage("BLOCK_LIMIT_EXCEEDED", {
            max: CONFIG.MAX_BLOCK_LIMIT,
            actual: blockCount
          })
        );
        return;
      }

      this.sendMessage(player, getMessage("OPERATION_STARTING"));

      const bounds = selectionManager.getBounds(player.name);
      const blocks = [];

      // Define block collection and removal function for batch processor
      const processBlock = (position, worldRef) => {
        try {
          const dimension = worldRef.getDimension(player.dimension.id);
          const block = dimension.getBlock(position);
          if (block) {
            blocks.push({
              pos: position.clone(),
              blockType: block.typeId,
              blockData: null
            });
            // Set to air immediately during cut
            block.setType("minecraft:air");
          }
        } catch (error) {
          // Skip blocks that can't be accessed
        }
      };

      const onComplete = () => {
        // Copy to clipboard after all blocks are processed
        clipboardManager.copyBlocks(player.name, blocks);
        this.sendSuccess(
          player,
          getMessage("CLIPBOARD_CUT", { count: blocks.length })
        );
      };

      // Start batch operation
      const operationId = batchProcessor.startOperation(
        "cut",
        bounds.min,
        bounds.max,
        world,
        processBlock,
        null, // No progress callback needed for cut
        onComplete
      );

      if (!operationId) {
        this.sendError(player, "Failed to start cut operation");
      }
    } catch (error) {
      console.error("Cut command error:", error);
      this.sendError(player, "Failed to cut selection");
    }
  }
}
