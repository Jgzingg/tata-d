/**
 * Flip Command
 * Flip clipboard (mirror)
 */

import { Command } from "./Command.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { getMessage } from "../config.js";

export class FlipCommand extends Command {
  constructor() {
    super(
      "flip",
      "Flip clipboard (north/east/up)",
      "/flip <direction>"
    );
  }

  validateArgs(args) {
    return args.length >= 1 && ["north", "east", "up", "x", "z", "y"].includes(args[0].toLowerCase());
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

      const direction = args[0].toLowerCase();
      clipboardManager.flip(player.name, direction);

      this.sendSuccess(
        player,
        `§aClipboard flipped §6${direction.toUpperCase()}`
      );
    } catch (error) {
      console.error("Flip command error:", error);
      this.sendError(player, "Failed to flip clipboard");
    }
  }
}
