/**
 * Copy Command
 * Copy selection to clipboard using batch processing
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { getMessage, CONFIG } from "../config.js";
import { batchProcessor } from "../utils/BatchProcessor.js";

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

      const bounds = selectionManager.getBounds(player.name);
      const blocks = [];

      this.sendMessage(player, getMessage("OPERATION_STARTING"));

      // Define block collection function for batch processor
      let collectedBlocks = 0;
      const processBlock = (position, worldRef) => {
        try {
          const dimension = worldRef.getDimension(player.dimension.id);
          const block = dimension.getBlock(position);
          if (block) {
            blocks.push({
              pos: position.clone(),
              blockType: block.typeId,
              blockData: null // Block data handled separately if needed
            });
            collectedBlocks++;
          }
        } catch (error) {
          // Skip blocks that can't be accessed
        }
      };

      const onComplete = () => {
        // Copy to clipboard after all blocks are collected
        clipboardManager.copyBlocks(player.name, blocks);
        this.sendSuccess(
          player,
          getMessage("CLIPBOARD_COPIED", { count: blocks.length })
        );
      };

      // Start batch operation
      const operationId = batchProcessor.startOperation(
        "copy",
        bounds.min,
        bounds.max,
        world,
        processBlock,
        null, // No progress callback needed for copy
        onComplete
      );

      if (!operationId) {
        this.sendError(player, "Failed to start copy operation");
      }
    } catch (error) {
      console.error("Copy command error:", error);
      this.sendError(player, "Failed to copy selection");
    }
  }
}
