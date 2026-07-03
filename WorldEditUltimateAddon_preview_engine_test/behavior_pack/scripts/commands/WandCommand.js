/**
 * Wand Command
 * Give player the WorldEdit wand (selection tool)
 */

import { ItemStack } from "@minecraft/server";
import { Command } from "./Command.js";
import { CONFIG, getMessage } from "../config.js";

export class WandCommand extends Command {
  constructor() {
    super(
      "wand",
      "Get the WorldEdit wand (left-click/break toggles pos1/pos2)",
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

      // Verifica se já está segurando a wand (checa a mão principal de verdade,
      // não só o último slot do inventário)
      const equippable = player.getComponent("minecraft:equippable");
      const heldItem = equippable?.getEquipment("Mainhand");
      if (heldItem && heldItem.typeId === CONFIG.WAND_ITEM && heldItem.nameTag === CONFIG.WAND_NAME_TAG) {
        this.sendMessage(player, "§6You already have a wand in your hand!");
        return;
      }

      // Cria a wand (item vanilla renomeado, sempre existe)
      const wand = new ItemStack(CONFIG.WAND_ITEM, 1);
      wand.nameTag = CONFIG.WAND_NAME_TAG;

      try {
        inventory.container.addItem(wand);
        this.sendSuccess(player, getMessage("WAND_RECEIVED"));
      } catch (invErr) {
        this.sendError(player, "Inventory full! Clear space and try again.");
      }
    } catch (error) {
      console.error("Wand command error:", error);
      this.sendError(player, "Failed to give wand");
    }
  }
}
