/**
 * Stack Command
 * Duplicate selection in direction
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { getMessage, CONFIG } from "../config.js";
import { system } from "@minecraft/server";
import { historyManager, HistoryAction } from "../history/HistoryManager.js";
import { ArrayIterator } from "../utils/ArrayIterator.js";
import { batchProcessor } from "../utils/BatchProcessor.js";

export class StackCommand extends Command {
  constructor() {
    super(
      "stack",
      "Duplicate selection (times) (direction)",
      "/stack <times> [direction]"
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

      const times = parseInt(args[0]);
      const direction = (args[1] || "up").toLowerCase();

      if (times <= 0 || times > 100) {
        this.sendError(player, "§cTimes must be between 1 and 100");
        return;
      }

      this.sendMessage(player, getMessage("PREFIX") + getMessage("OPERATION_STARTING"));

      const bounds = selectionManager.getBounds(player.name);
      const sizeX = bounds.max.x - bounds.min.x + 1;
      const sizeY = bounds.max.y - bounds.min.y + 1;
      const sizeZ = bounds.max.z - bounds.min.z + 1;

      let processed = 0;
      const historyChanges = [];

      const directions = {
        up: { x: 0, y: sizeY, z: 0 },
        down: { x: 0, y: -sizeY, z: 0 },
        north: { x: -sizeX, y: 0, z: 0 },
        south: { x: sizeX, y: 0, z: 0 },
        east: { x: 0, y: 0, z: sizeZ },
        west: { x: 0, y: 0, z: -sizeZ }
      };

      const offset = directions[direction] || directions.up;

      const stackProcess = () => {
        for (let i = 0; i < times; i++) {
          for (let x = bounds.min.x; x <= bounds.max.x; x++) {
            for (let y = bounds.min.y; y <= bounds.max.y; y++) {
              for (let z = bounds.min.z; z <= bounds.max.z; z++) {
                try {
                  const dimension = world.getDimension(player.dimension.id);
                  const fromBlock = dimension.getBlock({ x, y, z });
                  const toX = x + offset.x * (i + 1);
                  const toY = y + offset.y * (i + 1);
                  const toZ = z + offset.z * (i + 1);
                  const toBlock = dimension.getBlock({ x: toX, y: toY, z: toZ });
                  
                  if (toBlock) {
                    historyChanges.push({ x: toX, y: toY, z: toZ, typeId: toBlock.typeId });
                    toBlock.setType(fromBlock.typeId);
                    processed++;
                  }
                } catch (error) {
                  // Skip
                }
              }
            }
          }
        }

        if (historyChanges.length > 0) {
          const action = new HistoryAction(
            "stack",
            historyChanges,
            () => {},
            () => {
              const iterator = new ArrayIterator(historyChanges);
              batchProcessor.startOperationWithIterator(
                "undo stack",
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
          getMessage("STACK_COMPLETE", { count: processed })
        );
      };

      system.run(stackProcess);
    } catch (error) {
      console.error("Stack command error:", error);
      this.sendError(player, "Failed to stack selection");
    }
  }
}
