/**
 * WSuggest Command - manual block name suggestions.
 *
 * WHY THIS EXISTS:
 * The Script API's Custom Command system does not expose per-keystroke
 * autocomplete for free-text (String) arguments - only parameters typed
 * as CustomCommandParamType.BlockType get the native picker UI, and that
 * type only accepts real ids ("minecraft:diamond_block"), not aliases
 * like "diamond" or "log". Since alias support was a hard requirement,
 * this command is the closest equivalent experience: type a partial
 * name and instantly get a ranked list of real matches, the same
 * matching logic that also powers "did you mean" on invalid blocks.
 */
import { Command } from "./Command.js";
import { searchBlocks } from "../blocks/BlockIntelligence.js";
import { getMessage } from "../config.js";

export class WSuggestCommand extends Command {
  constructor() {
    super(
      "wsuggest",
      "Suggest block names matching a partial input",
      "/wsuggest <partial>"
    );
  }

  validateArgs(args) {
    return args.length >= 1;
  }

  execute(player, args) {
    if (!this.validateArgs(args)) {
      this.sendError(
        player,
        getMessage("INVALID_ARGUMENTS", { usage: this.usage })
      );
      return;
    }

    const partial = args[0];
    const suggestions = searchBlocks(partial, 10);

    if (suggestions.length === 0) {
      this.sendError(player, getMessage("NO_SUGGESTIONS", { partial }));
      return;
    }

    this.sendMessage(
      player,
        getMessage("SUGGESTIONS_HEADER", {
          partial,
          suggestions: "\n- " + suggestions.join("\n- ")
        })
    );
  }
}
