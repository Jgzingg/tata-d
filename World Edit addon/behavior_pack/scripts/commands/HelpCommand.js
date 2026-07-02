/**
 * Help Command
 * Show available commands
 */

import { Command } from "./Command.js";
import { getMessage } from "../config.js";

export class HelpCommand extends Command {
  constructor() {
    super(
      "whelp",
      "Show all available commands",
      "/whelp"
    );
  }

  execute(player, args, world) {
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    const commands = [
      { cmd: "/wand", desc: "Get WorldEdit wand" },
      { cmd: "/pos1", desc: "Set position 1 to your location" },
      { cmd: "/pos2", desc: "Set position 2 to your location" },
      { cmd: "/sel", desc: "Show selection info" },
      { cmd: "/set <block>", desc: "Fill selection with block" },
      { cmd: "/replace <from> <to>", desc: "Replace blocks" },
      { cmd: "/walls <block>", desc: "Create walls only" },
      { cmd: "/faces <block>", desc: "Create outer faces only" },
      { cmd: "/hollow", desc: "Hollow out selection" },
      { cmd: "/outline <block>", desc: "Create outline" },
      { cmd: "/copy", desc: "Copy selection" },
      { cmd: "/paste", desc: "Paste clipboard" },
      { cmd: "/cut", desc: "Cut selection" },
      { cmd: "/rotate <90|180|270>", desc: "Rotate clipboard" },
      { cmd: "/flip <north|east|up>", desc: "Flip clipboard" },
      { cmd: "/stack <times> [direction]", desc: "Duplicate selection" },
      { cmd: "/move <distance> [direction]", desc: "Move selection" },
      { cmd: "/shift <distance> [direction]", desc: "Shift selection (no copy)" },
      { cmd: "/undo", desc: "Undo last action" },
      { cmd: "/redo", desc: "Redo last action" }
    ];

    let message = getMessage("PREFIX") + getMessage("WHELP_HEADER") + "\n";
    commands.forEach(cmd => {
      message += `§6${cmd.cmd}§r - ${cmd.desc}\n`;
    });

    this.sendMessage(player, message);
  }
}
