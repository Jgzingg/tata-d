/**
 * Move Command
 * Move selection in direction
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";
import { historyManager, HistoryAction } from "../history/HistoryManager.js";
import { ArrayIterator } from "../utils/ArrayIterator.js";
import { batchProcessor } from "../utils/BatchProcessor.js";

export class MoveCommand extends Command {
  constructor() {
    super(
      "move",
      "Move selection in direction",
      "/move <distance> [direction]"
    );
  }

  validateArgs(args) {
    return args.length >= 1 && !isNaN(parseInt(args[0]));
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
      if (!selectionManager.hasSelection(player.name)) {
        this.sendError(player, getMessage("NO_SELECTION"));
        return;
      }

      const distance = parseInt(args[0]);
      const direction = (args[1] || "up").toLowerCase();

      const directions = {
        up: { x: 0, y: distance, z: 0 },
        down: { x: 0, y: -distance, z: 0 },
        north: { x: -distance, y: 0, z: 0 },
        south: { x: distance, y: 0, z: 0 },
        east: { x: 0, y: 0, z: distance },
        west: { x: 0, y: 0, z: -distance }
      };

      const offset = directions[direction] || directions.up;

      this.sendMessage(player, getMessage("PREFIX") + getMessage("OPERATION_STARTING"));

      const bounds = selectionManager.getBounds(player.name);
      let processed = 0;
      const historyChanges = [];

      const moveProcess = () => {
        // Move blocks
        for (let x = bounds.min.x; x <= bounds.max.x; x++) {
          for (let y = bounds.min.y; y <= bounds.max.y; y++) {
            for (let z = bounds.min.z; z <= bounds.max.z; z++) {
              try {
                const dimension = world.getDimension(player.dimension.id);
                const fromBlock = dimension.getBlock({ x, y, z });
                const toBlock = dimension.getBlock({
                  x: x + offset.x,
                  y: y + offset.y,
                  z: z + offset.z
                });
                
                if (fromBlock) historyChanges.push({ x: fromBlock.x, y: fromBlock.y, z: fromBlock.z, typeId: fromBlock.typeId });
                if (toBlock) historyChanges.push({ x: toBlock.x, y: toBlock.y, z: toBlock.z, typeId: toBlock.typeId });

                toBlock.setType(fromBlock.typeId);
                fromBlock.setType("minecraft:air");
                processed++;
              } catch (error) {
                // Skip
              }
            }
          }
        }

        // Update selection
        selectionManager.setPos1(
          player.name,
          selectionManager.getSelection(player.name).pos1.add({
            x: offset.x,
            y: offset.y,
            z: offset.z
          })
        );
        selectionManager.setPos2(
          player.name,
          selectionManager.getSelection(player.name).pos2.add({
            x: offset.x,
            y: offset.y,
            z: offset.z
          })
        );

        if (historyChanges.length > 0) {
          const action = new HistoryAction(
            "move",
            historyChanges,
            () => {},
            () => {
              const iterator = new ArrayIterator(historyChanges.reverse());
              batchProcessor.startOperationWithIterator(
                "undo move",
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
          getMessage("MOVE_COMPLETE", { count: processed })
        );
      };

      system.run(moveProcess);
    } catch (error) {
      console.error("Move command error:", error);
      this.sendError(player, "Failed to move selection");
    }
  }
}
