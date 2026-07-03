/**
 * Pos1 Command
 * Set position 1 to current player location
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { Vector3 } from "../utils/Vector.js";
import { getMessage } from "../config.js";
import { previewRenderer } from "../preview/PreviewRenderer.js";

export class Pos1Command extends Command {
  constructor() {
    super(
      "pos1",
      "Set position 1 to your current location",
      "/pos1"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      const location = player.location;
      const pos = Vector3.fromLocation(location);
      
      selectionManager.setPos1(player.name, pos);
      previewRenderer.updatePlayer(player, selectionManager);
      
      this.sendSuccess(
        player,
        getMessage("POS1_SET", {
          x: pos.x,
          y: pos.y,
          z: pos.z
        })
      );
    } catch (error) {
      console.error("Pos1 command error:", error);
      this.sendError(player, "Failed to set position 1");
    }
  }
}
