/**
 * Redo Command
 * Redo last undone action
 */

import { Command } from "./Command.js";
import { historyManager } from "../history/HistoryManager.js";
import { getMessage } from "../config.js";

export class RedoCommand extends Command {
  constructor() {
    super(
      "redo",
      "Redo last undone action",
      "/redo"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      const result = historyManager.redo(player.name);
      
      if (!result.success) {
        this.sendError(player, getMessage("NOTHING_TO_REDO"));
        return;
      }

      this.sendSuccess(
        player,
        getMessage("REDO_COMPLETE") +
          (result.actionName ? ` (${result.actionName})` : "")
      );
    } catch (error) {
      console.error("Redo command error:", error);
      this.sendError(player, "Failed to redo");
    }
  }
}
