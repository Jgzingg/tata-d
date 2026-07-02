/**
 * Faces Command - Create outer faces only (no interior)
 * Uses modern batch processing API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { isValidBlock, normalizeBlockName } from "../utils/BlockValidator.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";

export class FacesCommand extends Command {
  constructor() {
    super(
      "faces",
      "Create outer faces only (no interior)",
      "/faces <block>"
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
      const { min, max } = bounds;
      let processed = 0;

      // Use system.run to execute faces operation
      system.run(() => {
        try {
          const dimension = world.getDimension(player.dimension.id);

          // Top face (y = max)
          for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
              try {
                dimension.getBlock({ x, y: max.y, z }).setType(blockType);
                processed++;
              } catch (e) {
                // Skip invalid positions
              }
            }
          }

          // Bottom face (y = min)
          for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
              try {
                dimension.getBlock({ x, y: min.y, z }).setType(blockType);
                processed++;
              } catch (e) {
                // Skip invalid positions
              }
            }
          }

          // Front face (z = min)
          for (let x = min.x; x <= max.x; x++) {
            for (let y = min.y + 1; y < max.y; y++) {
              try {
                dimension.getBlock({ x, y, z: min.z }).setType(blockType);
                processed++;
              } catch (e) {
                // Skip invalid positions
              }
            }
          }

          // Back face (z = max)
          for (let x = min.x; x <= max.x; x++) {
            for (let y = min.y + 1; y < max.y; y++) {
              try {
                dimension.getBlock({ x, y, z: max.z }).setType(blockType);
                processed++;
              } catch (e) {
                // Skip invalid positions
              }
            }
          }

          // Left face (x = min)
          for (let z = min.z + 1; z < max.z; z++) {
            for (let y = min.y + 1; y < max.y; y++) {
              try {
                dimension.getBlock({ x: min.x, y, z }).setType(blockType);
                processed++;
              } catch (e) {
                // Skip invalid positions
              }
            }
          }

          // Right face (x = max)
          for (let z = min.z + 1; z < max.z; z++) {
            for (let y = min.y + 1; y < max.y; y++) {
              try {
                dimension.getBlock({ x: max.x, y, z }).setType(blockType);
                processed++;
              } catch (e) {
                // Skip invalid positions
              }
            }
          }

          this.sendSuccess(
            player,
            getMessage("OPERATION_COMPLETE", { count: processed })
          );
        } catch (error) {
          console.error("Faces processing error:", error);
          this.sendError(player, "Failed to create faces");
        }
      });
    } catch (error) {
      console.error("Faces command error:", error);
      this.sendError(player, "Failed to create faces");
    }
  }
}
