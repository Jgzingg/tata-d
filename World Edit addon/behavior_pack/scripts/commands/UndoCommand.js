/**
 * Undo Command
 * Undo last action
 */

import { Command } from "./Command.js";
import { historyManager } from "../history/HistoryManager.js";
import { getMessage } from "../config.js";

export class UndoCommand extends Command {
  constructor() {
    super(
      "undo",
      "Undo last action",
      "/undo"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      const result = historyManager.undo(player.name);
      
      if (!result.success) {
        this.sendError(player, getMessage("NOTHING_TO_UNDO"));
        return;
      }

      this.sendSuccess(
        player,
        getMessage("UNDO_COMPLETE") +
          (result.actionName ? ` (${result.actionName})` : "")
      );
    } catch (error) {
      console.error("Undo command error:", error);
      this.sendError(player, "Failed to undo");
    }
  }
}
