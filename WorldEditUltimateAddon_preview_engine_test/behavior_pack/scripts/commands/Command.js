/**
 * Command Base Class
 * Abstract base for all commands
 */

import { isCreativeMode } from "../utils/GameMode.js";
import { getMessage } from "../config.js";

/**
 * Base class for all commands
 */
export class Command {
  /**
   * @param {string} name - Command name (without /)
   * @param {string} description - Command description
   * @param {string} usage - Command usage example
   */
  constructor(name, description, usage = "") {
    this.name = name;
    this.description = description;
    this.usage = usage;
  }

  /**
   * Check if command can be executed
   * @param {Player} player
   * @returns {{canExecute: boolean, errorMessage: string | null}}
   */
  canExecute(player) {
    if (!isCreativeMode(player)) {
      return {
        canExecute: false,
        errorMessage: getMessage("ONLY_CREATIVE")
      };
    }
    return { canExecute: true, errorMessage: null };
  }

  /**
   * Execute command
   * @abstract
   * @param {Player} player
   * @param {string[]} args - Command arguments
   * @param {any} world - World reference
   */
  execute(player, args, world) {
    throw new Error("execute() must be implemented");
  }

  /**
   * Validate arguments
   * @param {string[]} args
   * @returns {boolean}
   */
  validateArgs(args) {
    return true;
  }

  /**
   * Send message to player
   * @param {Player} player
   * @param {string} message
   */
  sendMessage(player, message) {
    player.sendMessage(message);
  }

  /**
   * Send error to player
   * @param {Player} player
   * @param {string} message
   */
  sendError(player, message) {
    this.sendMessage(player, `§c${message}`);
  }

  /**
   * Send success message to player
   * @param {Player} player
   * @param {string} message
   */
  sendSuccess(player, message) {
    this.sendMessage(player, `§a${message}`);
  }

  /**
   * Get help text
   * @returns {string}
   */
  getHelp() {
    return `§6/${this.name}§r - ${this.description}`;
  }
}
