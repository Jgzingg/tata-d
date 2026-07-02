/**
 * Shift Command
 * Move selection without copying (different from /move)
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { getMessage, CONFIG } from "../config.js";

export class ShiftCommand extends Command {
  constructor() {
    super(
      "shift",
      "Shift selection in direction",
      "/shift <distance> [direction]"
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

      // Update selection positions (just shift the selection, don't move blocks)
      const selection = selectionManager.getSelection(player.name);
      const newPos1 = selection.pos1.add(offset);
      const newPos2 = selection.pos2.add(offset);

      selectionManager.setPos1(player.name, newPos1);
      selectionManager.setPos2(player.name, newPos2);

      this.sendSuccess(
        player,
        `§aSelection shifted §6${distance}§a blocks §6${direction}`
      );
    } catch (error) {
      console.error("Shift command error:", error);
      this.sendError(player, "Failed to shift selection");
    }
  }
}
