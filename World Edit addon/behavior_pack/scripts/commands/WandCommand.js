/**
 * Wand Command
 * Give player the WorldEdit wand (selection tool)
 */

import { Command } from "./Command.js";
import { CONFIG, getMessage } from "../config.js";

export class WandCommand extends Command {
  constructor() {
    super(
      "wand",
      "Get the WorldEdit wand (left-click = pos1, right-click = pos2)",
      "/wand"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    try {
      // Create wand item
      const wandItem = new world.ItemStack(CONFIG.WAND_ITEM, 1);
      
      // Set custom name for wand
      wandItem.nameTag = "§6WorldEdit Wand";

      // Give wand to player
      player.getComponent("minecraft:inventory").container.addItem(wandItem);
      
      this.sendSuccess(player, getMessage("WAND_RECEIVED"));
    } catch (error) {
      console.error("Wand command error:", error);
      this.sendError(player, "Failed to give wand");
    }
  }
}
