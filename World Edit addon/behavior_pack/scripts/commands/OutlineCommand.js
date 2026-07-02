/**
 * Outline Command - Create outline of selection
 * Uses modern API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { isValidBlock, normalizeBlockName } from "../utils/BlockValidator.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";

export class OutlineCommand extends Command {
  constructor() {
    super(
      "outline",
      "Create outline of selection",
      "/outline <block>"
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
      const { min, max } = bounds;

      // Use system.run to execute outline operation
      system.run(() => {
        try {
          const dimension = world.getDimension(player.dimension.id);

          // Bottom edges (y = min)
          for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
              if (x === min.x || x === max.x || z === min.z || z === max.z) {
                try {
                  dimension.getBlock({ x, y: min.y, z }).setType(blockType);
                  processed++;
                } catch (e) {}
              }
            }
          }

          // Top edges (y = max)
          for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
              if (x === min.x || x === max.x || z === min.z || z === max.z) {
                try {
                  dimension.getBlock({ x, y: max.y, z }).setType(blockType);
                  processed++;
                } catch (e) {}
              }
            }
          }

          // Vertical edges
          for (let y = min.y; y <= max.y; y++) {
            try {
              dimension.getBlock({ x: min.x, y, z: min.z }).setType(blockType);
              dimension.getBlock({ x: max.x, y, z: min.z }).setType(blockType);
              dimension.getBlock({ x: min.x, y, z: max.z }).setType(blockType);
              dimension.getBlock({ x: max.x, y, z: max.z }).setType(blockType);
              processed += 4;
            } catch (e) {}
          }

          this.sendSuccess(
            player,
            getMessage("OPERATION_COMPLETE", { count: processed })
          );
        } catch (error) {
          console.error("Outline processing error:", error);
          this.sendError(player, "Failed to create outline");
        }
      });
    } catch (error) {
      console.error("Outline command error:", error);
      this.sendError(player, "Failed to create outline");
    }
  }
}
