/**
 * Selection Manager
 * Manages selections for each player
 */

import { Vector3 } from "../utils/Vector.js";

class Selection {
  constructor() {
    this.pos1 = null;
    this.pos2 = null;
  }

  /**
   * Set position 1
   * @param {Vector3} pos
   */
  setPos1(pos) {
    this.pos1 = pos.clone();
  }

  /**
   * Set position 2
   * @param {Vector3} pos
   */
  setPos2(pos) {
    this.pos2 = pos.clone();
  }

  /**
   * Check if both positions are set
   * @returns {boolean}
   */
  isComplete() {
    return this.pos1 !== null && this.pos2 !== null;
  }

  /**
   * Get selection bounds
   * @returns {{min: Vector3, max: Vector3} | null}
   */
  getBounds() {
    if (!this.isComplete()) return null;
    return this.pos1.getBounds(this.pos2);
  }

  /**
   * Get number of blocks in selection
   * @returns {number}
   */
  getBlockCount() {
    if (!this.isComplete()) return 0;
    const bounds = this.getBounds();
    const sizeX = bounds.max.x - bounds.min.x + 1;
    const sizeY = bounds.max.y - bounds.min.y + 1;
    const sizeZ = bounds.max.z - bounds.min.z + 1;
    return sizeX * sizeY * sizeZ;
  }

  /**
   * Get dimensions of selection
   * @returns {{x: number, y: number, z: number} | null}
   */
  getDimensions() {
    if (!this.isComplete()) return null;
    const bounds = this.getBounds();
    return {
      x: bounds.max.x - bounds.min.x + 1,
      y: bounds.max.y - bounds.min.y + 1,
      z: bounds.max.z - bounds.min.z + 1
    };
  }

  /**
   * Clear selection
   */
  clear() {
    this.pos1 = null;
    this.pos2 = null;
  }

  /**
   * Get selection info as string
   * @returns {string}
   */
  getInfo() {
    if (!this.isComplete()) return "No selection";
    const bounds = this.getBounds();
    const dims = this.getDimensions();
    return `Pos1: ${this.pos1.toString()}\nPos2: ${this.pos2.toString()}\nDimensions: ${dims.x}×${dims.y}×${dims.z}\nBlocks: ${this.getBlockCount()}`;
  }
}

/**
 * Selection Manager - manages all player selections
 */
class SelectionManager {
  constructor() {
    this.selections = new Map(); // playerName -> Selection
  }

  /**
   * Get or create selection for player
   * @param {string} playerName
   * @returns {Selection}
   */
  getSelection(playerName) {
    if (!this.selections.has(playerName)) {
      this.selections.set(playerName, new Selection());
    }
    return this.selections.get(playerName);
  }

  /**
   * Set position 1 for player
   * @param {string} playerName
   * @param {Vector3} pos
   */
  setPos1(playerName, pos) {
    this.getSelection(playerName).setPos1(pos);
  }

  /**
   * Set position 2 for player
   * @param {string} playerName
   * @param {Vector3} pos
   */
  setPos2(playerName, pos) {
    this.getSelection(playerName).setPos2(pos);
  }

  /**
   * Check if player has complete selection
   * @param {string} playerName
   * @returns {boolean}
   */
  hasSelection(playerName) {
    return this.getSelection(playerName).isComplete();
  }

  /**
   * Get bounds for player
   * @param {string} playerName
   * @returns {{min: Vector3, max: Vector3} | null}
   */
  getBounds(playerName) {
    return this.getSelection(playerName).getBounds();
  }

  /**
   * Get block count in player's selection
   * @param {string} playerName
   * @returns {number}
   */
  getBlockCount(playerName) {
    return this.getSelection(playerName).getBlockCount();
  }

  /**
   * Get selection info
   * @param {string} playerName
   * @returns {string}
   */
  getSelectionInfo(playerName) {
    return this.getSelection(playerName).getInfo();
  }

  /**
   * Clear player's selection
   * @param {string} playerName
   */
  clearSelection(playerName) {
    this.getSelection(playerName).clear();
  }

  /**
   * Clear all selections
   */
  clearAll() {
    this.selections.clear();
  }
}

// Export singleton instance
export const selectionManager = new SelectionManager();
