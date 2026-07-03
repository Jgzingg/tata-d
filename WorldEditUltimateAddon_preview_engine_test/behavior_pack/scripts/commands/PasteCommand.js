/**
 * Paste Command - Paste clipboard to world
 * Uses modern batch processing API (Bedrock 1.20.0+)
 */

import { Command } from "./Command.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { Vector3 } from "../utils/Vector.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";
import { historyManager, HistoryAction } from "../history/HistoryManager.js";
import { ArrayIterator } from "../utils/ArrayIterator.js";
import { batchProcessor } from "../utils/BatchProcessor.js";

export class PasteCommand extends Command {
  constructor() {
    super(
      "paste",
      "Paste clipboard at your position",
      "/paste"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      // Check clipboard
      if (!clipboardManager.hasData(player.name)) {
        this.sendError(player, getMessage("CLIPBOARD_EMPTY"));
        return;
      }

      this.sendMessage(player, getMessage("OPERATION_STARTING"));

      const playerPos = Vector3.fromLocation(player.location);
      const clipboardBlocks = clipboardManager.getBlocks(player.name);
      const clipboard = clipboardManager.getClipboard(player.name);
      const totalBlocks = clipboardBlocks.length;

      // Check block limit
      if (totalBlocks > CONFIG.MAX_BLOCK_LIMIT) {
        this.sendError(
          player,
          getMessage("BLOCK_LIMIT_EXCEEDED", {
            max: CONFIG.MAX_BLOCK_LIMIT,
            actual: totalBlocks
          })
        );
        return;
      }

      let pasted = 0;
      let processedBlocks = 0;
      let runHandle = null;
      const historyChanges = [];

      // Calculate offset
      let offset = playerPos;
      if (clipboard.origin) {
        offset = playerPos.subtract(clipboard.origin);
      }

      // Process clipboard blocks in batches using system.runInterval
      runHandle = system.runInterval(() => {
        if (processedBlocks >= totalBlocks) {
          // Operation complete
          system.clearRun(runHandle);
          
          if (historyChanges.length > 0) {
            const action = new HistoryAction(
              "paste",
              historyChanges,
              () => {},
              () => {
                const iterator = new ArrayIterator(historyChanges);
                batchProcessor.startOperationWithIterator(
                  "undo paste",
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
            getMessage("PASTE_COMPLETE", { count: pasted })
          );
          return;
        }

        // Process batch
        const batchEnd = Math.min(
          processedBlocks + CONFIG.BLOCKS_PER_TICK,
          totalBlocks
        );

        for (let i = processedBlocks; i < batchEnd; i++) {
          const block = clipboardBlocks[i];
          try {
            const newPos = new Vector3(
              block.pos.x + offset.x,
              block.pos.y + offset.y,
              block.pos.z + offset.z
            );

            const dimension = world.getDimension(player.dimension.id);
            const targetBlock = dimension.getBlock(newPos);

            if (targetBlock) {
              historyChanges.push({
                x: newPos.x,
                y: newPos.y,
                z: newPos.z,
                typeId: targetBlock.typeId
              });

              targetBlock.setType(block.blockType);
              
              // Apply block data if available
              if (block.blockData) {
                try {
                  targetBlock.setPermutation(targetBlock.permutation.withProperty(block.blockData));
                } catch (e) {
                  // Block data may not apply to all blocks, silently ignore
                }
              }

              pasted++;
            }
          } catch (error) {
            console.warn(`Error pasting block at index ${i}:`, error);
          }
        }

        processedBlocks = batchEnd;

        // Show progress at intervals
        if (processedBlocks % CONFIG.PROGRESS_UPDATE_INTERVAL === 0) {
          const progress = Math.round((processedBlocks / totalBlocks) * 100);
          player.sendMessage(
            getMessage("PREFIX") + `§6Progress: ${progress}%`
          );
        }
      }, 1);

    } catch (error) {
      console.error("Paste command error:", error);
      this.sendError(player, "Failed to paste clipboard");
    }
  }
}
