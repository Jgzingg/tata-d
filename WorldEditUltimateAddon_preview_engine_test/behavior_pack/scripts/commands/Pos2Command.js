/**
 * Pos2 Command
 * Set position 2 to current player location
 */

import { Command } from "./Command.js";
import { selectionManager } from "../selection/SelectionManager.js";
import { Vector3 } from "../utils/Vector.js";
import { getMessage } from "../config.js";
import { previewRenderer } from "../preview/PreviewRenderer.js";

export class Pos2Command extends Command {
  constructor() {
    super(
      "pos2",
      "Set position 2 to your current location",
      "/pos2"
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
      
      selectionManager.setPos2(player.name, pos);
      previewRenderer.updatePlayer(player, selectionManager);
      
      this.sendSuccess(
        player,
        getMessage("POS2_SET", {
          x: pos.x,
          y: pos.y,
          z: pos.z
        })
      );
    } catch (error) {
      console.error("Pos2 command error:", error);
      this.sendError(player, "Failed to set position 2");
    }
  }
}
