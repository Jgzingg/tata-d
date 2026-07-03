/**
 * Rotate Command
 * Rotate clipboard
 */

import { Command } from "./Command.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { getMessage } from "../config.js";

export class RotateCommand extends Command {
  constructor() {
    super(
      "rotate",
      "Rotate clipboard (90, 180, 270 degrees)",
      "/rotate <degrees>"
    );
  }

  validateArgs(args) {
    return args.length >= 1 && ["90", "180", "270"].includes(args[0]);
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
      if (!clipboardManager.hasData(player.name)) {
        this.sendError(player, getMessage("CLIPBOARD_EMPTY"));
        return;
      }

      const degrees = parseInt(args[0]);
      clipboardManager.rotate(player.name, degrees);

      this.sendSuccess(
        player,
        `§aClipboard rotated §6${degrees}°`
      );
    } catch (error) {
      console.error("Rotate command error:", error);
      this.sendError(player, "Failed to rotate clipboard");
    }
  }
}
