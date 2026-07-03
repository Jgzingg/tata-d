/**
 * Command Registry
 * Manages all available commands
 */

import { WandCommand } from "./WandCommand.js";
import { Pos1Command } from "./Pos1Command.js";
import { Pos2Command } from "./Pos2Command.js";
import { SelCommand } from "./SelCommand.js";
import { SetCommand } from "./SetCommand.js";
import { ReplaceCommand } from "./ReplaceCommand.js";
import { WallsCommand } from "./WallsCommand.js";
import { FacesCommand } from "./FacesCommand.js";
import { HollowCommand } from "./HollowCommand.js";
import { OutlineCommand } from "./OutlineCommand.js";
import { CopyCommand } from "./CopyCommand.js";
import { PasteCommand } from "./PasteCommand.js";
import { CutCommand } from "./CutCommand.js";
import { RotateCommand } from "./RotateCommand.js";
import { FlipCommand } from "./FlipCommand.js";
import { StackCommand } from "./StackCommand.js";
import { MoveCommand } from "./MoveCommand.js";
import { ShiftCommand } from "./ShiftCommand.js";
import { UndoCommand } from "./UndoCommand.js";
import { RedoCommand } from "./RedoCommand.js";
import { HelpCommand } from "./HelpCommand.js";
import { WSuggestCommand } from "./WSuggestCommand.js";

/**
 * Command Registry - stores and executes all commands
 */
class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.registerDefaultCommands();
  }

  /**
   * Register default commands
   */
  registerDefaultCommands() {
    const defaultCommands = [
      new WandCommand(),
      new Pos1Command(),
      new Pos2Command(),
      new SelCommand(),
      new SetCommand(),
      new ReplaceCommand(),
      new WallsCommand(),
      new FacesCommand(),
      new HollowCommand(),
      new OutlineCommand(),
      new CopyCommand(),
      new PasteCommand(),
      new CutCommand(),
      new RotateCommand(),
      new FlipCommand(),
      new StackCommand(),
      new MoveCommand(),
      new ShiftCommand(),
      new UndoCommand(),
      new RedoCommand(),
      new HelpCommand(),
      new WSuggestCommand()
    ];

    defaultCommands.forEach(cmd => {
      this.register(cmd.name, cmd);
    });
  }

  /**
   * Register a command
   * @param {string} name - Command name
   * @param {Command} command - Command instance
   */
  register(name, command) {
    this.commands.set(name.toLowerCase(), command);
  }

  /**
   * Get command by name
   * @param {string} name
   * @returns {Command | null}
   */
  getCommand(name) {
    return this.commands.get(name.toLowerCase()) || null;
  }

  /**
   * Get all registered commands
   * @returns {Command[]}
   */
  getAll() {
    return Array.from(this.commands.values());
  }

  /**
   * Execute command
   * @param {string} commandName
   * @param {Player} player
   * @param {string[]} args
   * @param {any} world
   */
  execute(commandName, player, args, world) {
    const command = this.getCommand(commandName);
    
    if (!command) {
      player.sendMessage(`§6[WorldEdit]§r §cUnknown command: §6/${commandName}§c. Use §6/whelp§c for help.`);
      return;
    }

    // Check if player can execute
    const check = command.canExecute(player);
    if (!check.canExecute) {
      player.sendMessage(check.errorMessage);
      return;
    }

    try {
      command.execute(player, args, world);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      player.sendMessage(`§c[WorldEdit] Error: ${error.message}`);
    }
  }

  /**
   * Get command names
   * @returns {string[]}
   */
  getCommandNames() {
    return Array.from(this.commands.keys());
  }
}

// Export singleton instance
export const commandRegistry = new CommandRegistry();
