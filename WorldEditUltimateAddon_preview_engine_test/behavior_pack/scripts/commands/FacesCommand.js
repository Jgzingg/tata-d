/**
 * Faces Command - Create outer faces only (no interior)
 * Uses modern batch processing API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { resolveBlockInput } from "../utils/BlockValidator.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";
import { historyManager, HistoryAction } from "../history/HistoryManager.js";
import { ArrayIterator } from "../utils/ArrayIterator.js";
import { batchProcessor } from "../utils/BatchProcessor.js";

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
      const resolved = resolveBlockInput(args[0]);
      if (!resolved.success) {
        if (resolved.suggestions.length > 0) {
          this.sendError(
            player,
            getMessage("BLOCK_NOT_FOUND", {
              block: args[0],
              suggestions: resolved.suggestions.join(", ")
            })
          );
        } else {
          this.sendError(player, getMessage("INVALID_BLOCK", { block: args[0] }));
        }
        return;
      }
      const blockType = resolved.id;

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
      const historyChanges = [];

      // Use system.run to execute faces operation
      system.run(() => {
        try {
          const dimension = world.getDimension(player.dimension.id);
          
          const setBlock = (x, y, z) => {
            try {
              const block = dimension.getBlock({ x, y, z });
              if (block) {
                historyChanges.push({ x, y, z, typeId: block.typeId });
                block.setType(blockType);
                processed++;
              }
            } catch (e) {}
          };

          // Top face (y = max)
          for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
              setBlock(x, max.y, z);
            }
          }

          // Bottom face (y = min)
          for (let x = min.x; x <= max.x; x++) {
            for (let z = min.z; z <= max.z; z++) {
              setBlock(x, min.y, z);
            }
          }

          // Front face (z = min)
          for (let x = min.x; x <= max.x; x++) {
            for (let y = min.y + 1; y < max.y; y++) {
              setBlock(x, y, min.z);
            }
          }

          // Back face (z = max)
          for (let x = min.x; x <= max.x; x++) {
            for (let y = min.y + 1; y < max.y; y++) {
              setBlock(x, y, max.z);
            }
          }

          // Left face (x = min)
          for (let z = min.z + 1; z < max.z; z++) {
            for (let y = min.y + 1; y < max.y; y++) {
              setBlock(min.x, y, z);
            }
          }

          // Right face (x = max)
          for (let z = min.z + 1; z < max.z; z++) {
            for (let y = min.y + 1; y < max.y; y++) {
              setBlock(max.x, y, z);
            }
          }

          if (historyChanges.length > 0) {
            const action = new HistoryAction(
              "faces",
              historyChanges,
              () => {},
              () => {
                const iterator = new ArrayIterator(historyChanges);
                batchProcessor.startOperationWithIterator(
                  "undo faces",
                  iterator,
                  world,
                  (change, worldRef) => {
                    try {
                      const dim = worldRef.getDimension(player.dimension.id);
                      const b = dim.getBlock({ x: change.x, y: change.y, z: change.z });
                      if (b) b.setType(change.typeId);
                    } catch (e) {}
                  },
                  null, null
                );
              }
            );
            historyManager.addAction(player.name, action);
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
