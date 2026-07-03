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
      // Get player inventory
      const inventory = player.getComponent("minecraft:inventory");
      if (!inventory || !inventory.container) {
        this.sendError(player, "Failed to access inventory");
        return;
      }

      // Create wand item using correct API
      const wandItem = inventory.container.getItem(inventory.container.size - 1);
      
      // If player already has a wand in main hand, don't give another
      if (wandItem && wandItem.typeId === CONFIG.WAND_ITEM) {
        this.sendMessage(player, "§6You already have a wand in your hand!");
        return;
      }

      // Try to give the wand item
      const success = inventory.container.addItem({
        typeId: CONFIG.WAND_ITEM,
        amount: 1,
        nameTag: "§6WorldEdit Wand"
      });

      if (success) {
        this.sendSuccess(player, getMessage("WAND_RECEIVED"));
      } else {
        this.sendError(player, "Inventory full! Clear space and try again.");
      }
    } catch (error) {
      console.error("Wand command error:", error);
      this.sendError(player, "Failed to give wand");
    }
  }
}
