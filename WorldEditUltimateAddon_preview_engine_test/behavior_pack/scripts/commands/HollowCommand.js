/**
 * Hollow Command - Remove inside blocks, keep walls
 * Uses modern batch processing API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { batchProcessor } from "../utils/BatchProcessor.js";
import { Vector3 } from "../utils/Vector.js";
import { getMessage, CONFIG } from "../config.js";

export class HollowCommand extends Command {
  constructor() {
    super(
      "hollow",
      "Hollow out selection (remove inside)",
      "/hollow"
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

      const bounds = selectionManager.getBounds(player.name);

      // Shrink bounds to exclude the outer layer
      const innerMin = new Vector3(
        bounds.min.x + 1,
        bounds.min.y + 1,
        bounds.min.z + 1
      );
      const innerMax = new Vector3(
        bounds.max.x - 1,
        bounds.max.y - 1,
        bounds.max.z - 1
      );

      // Verify there's space to hollow
      if (innerMin.x > innerMax.x || innerMin.y > innerMax.y || innerMin.z > innerMax.z) {
        this.sendError(player, "Selection too small to hollow");
        return;
      }

      this.sendMessage(player, getMessage("OPERATION_STARTING"));

      // Define block processing function
      const processBlock = (position, worldRef) => {
        try {
          const dimension = worldRef.getDimension(player.dimension.id);
          const block = dimension.getBlock(position);
          if (block) {
            block.setType("minecraft:air");
          }
        } catch (error) {
          console.warn(`Error hollowing block at ${position.toString()}:`, error);
        }
      };

      // Define progress callback
      const onProgress = (current, total, percentage) => {
        player.sendMessage(
          getMessage("PREFIX") + `§6Progress: ${percentage}%`
        );
      };

      // Calculate inner block count
      const innerBlockCount =
        (innerMax.x - innerMin.x + 1) *
        (innerMax.y - innerMin.y + 1) *
        (innerMax.z - innerMin.z + 1);

      // Define completion callback
      const onComplete = () => {
        this.sendSuccess(
          player,
          getMessage("OPERATION_COMPLETE", { count: innerBlockCount })
        );
      };

      // Start batch operation
      const operationId = batchProcessor.startOperation(
        "hollow",
        innerMin,
        innerMax,
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
      console.error("Hollow command error:", error);
      this.sendError(player, "Failed to hollow selection");
    }
  }
}
