/**
 * Walls Command - Fill only the walls of selection
 * Uses modern API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { isValidBlock, normalizeBlockName } from "../utils/BlockValidator.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";

export class WallsCommand extends Command {
  constructor() {
    super(
      "walls",
      "Create walls (no top/bottom)",
      "/walls <block>"
    );
  }

  validateArgs(args) {
    return args.length >= 1;
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
      const blockType = normalizeBlockName(args[0]);

      if (!isValidBlock(blockType)) {
        this.sendError(
          player,
          getMessage("INVALID_BLOCK", { block: args[0] })
        );
        return;
      }

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
      let processed = 0;

      // Use system.run to execute walls operation
      system.run(() => {
        try {
          const dimension = world.getDimension(player.dimension.id);

          // Process all walls (only perimeter, excluding top and bottom)
          for (let x = bounds.min.x; x <= bounds.max.x; x++) {
            for (let y = bounds.min.y + 1; y < bounds.max.y; y++) {
              for (let z = bounds.min.z; z <= bounds.max.z; z++) {
                // Check if on edge (wall)
                const isEdge =
                  x === bounds.min.x ||
                  x === bounds.max.x ||
                  z === bounds.min.z ||
                  z === bounds.max.z;

                if (isEdge) {
                  try {
                    dimension.getBlock({ x, y, z }).setType(blockType);
                    processed++;
                  } catch (e) {
                    // Skip invalid positions
                  }
                }
              }
            }
          }

          this.sendSuccess(
            player,
            getMessage("OPERATION_COMPLETE", { count: processed })
          );
        } catch (error) {
          console.error("Walls processing error:", error);
          this.sendError(player, "Failed to create walls");
        }
      });
    } catch (error) {
      console.error("Walls command error:", error);
      this.sendError(player, "Failed to create walls");
    }
  }
}
