/**
 * Replace Command - Replace blocks of one type with another
 * Uses modern batch processing API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { resolveBlockInput } from "../utils/BlockValidator.js";
import { batchProcessor } from "../utils/BatchProcessor.js";
import { getMessage, CONFIG } from "../config.js";

export class ReplaceCommand extends Command {
  constructor() {
    super(
      "replace",
      "Replace all blocks of one type with another",
      "/replace <from> <to>"
    );
  }

  validateArgs(args) {
    return args.length >= 2;
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    if (!this.validateArgs(args)) {
      this.sendError(
        player,
        getMessage("INVALID_ARGUMENTS", { usage: this.usage })
      );
      return;
    }

    try {
      const fromResolved = resolveBlockInput(args[0]);
      if (!fromResolved.success) {
        if (fromResolved.suggestions.length > 0) {
          this.sendError(
            player,
            getMessage("BLOCK_NOT_FOUND", {
              block: args[0],
              suggestions: fromResolved.suggestions.join(", ")
            })
          );
        } else {
          this.sendError(player, getMessage("INVALID_BLOCK", { block: args[0] }));
        }
        return;
      }

      const toResolved = resolveBlockInput(args[1]);
      if (!toResolved.success) {
        if (toResolved.suggestions.length > 0) {
          this.sendError(
            player,
            getMessage("BLOCK_NOT_FOUND", {
              block: args[1],
              suggestions: toResolved.suggestions.join(", ")
            })
          );
        } else {
          this.sendError(player, getMessage("INVALID_BLOCK", { block: args[1] }));
        }
        return;
      }

      const fromBlock = fromResolved.id;
      const toBlock = toResolved.id;

      // Check selection
      if (!selectionManager.hasSelection(player.name)) {
        this.sendError(player, getMessage("NO_SELECTION"));
        return;
      }

      // Check block limit
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

      // Send start message
      this.sendMessage(player, getMessage("OPERATION_STARTING"));

      // Track replaced blocks
      let replacedCount = 0;

      // Define block processing function
      const processBlock = (position, worldRef) => {
        try {
          const dimension = worldRef.getDimension(player.dimension.id);
          const block = dimension.getBlock(position);
          if (block && block.typeId === fromBlock) {
            block.setType(toBlock);
            replacedCount++;
          }
        } catch (error) {
          console.warn(`Error replacing block at ${position.toString()}:`, error);
        }
      };

      // Define progress callback
      const onProgress = (current, total, percentage) => {
        player.sendMessage(
          getMessage("PREFIX") + `§6Progress: ${percentage}%`
        );
      };

      // Define completion callback
      const onComplete = () => {
        this.sendSuccess(
          player,
          getMessage("OPERATION_COMPLETE", { count: replacedCount })
        );
      };

      // Start batch operation
      const operationId = batchProcessor.startOperation(
        "replace",
        bounds.min,
        bounds.max,
        world,
        processBlock,
        onProgress,
        onComplete,
        { playerName: player.name, dimensionId: player.dimension.id }
      );

      if (!operationId) {
        this.sendError(player, "Failed to start operation");
      }
    } catch (error) {
      console.error("Replace command error:", error);
      this.sendError(player, "Failed to replace blocks");
    }
  }
}
