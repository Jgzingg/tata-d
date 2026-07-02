/**
 * Clipboard Manager
 * Manages copy/paste/cut for each player
 */

import { Vector3 } from "../utils/Vector.js";

/**
 * Represents copied blocks
 */
class ClipboardData {
  constructor() {
    this.blocks = []; // Array of {pos: Vector3, blockType: string, blockData: any}
    this.origin = null; // Original position of first block
  }

  /**
   * Clear clipboard
   */
  clear() {
    this.blocks = [];
    this.origin = null;
  }

  /**
   * Get number of blocks in clipboard
   * @returns {number}
   */
  getSize() {
    return this.blocks.length;
  }

  /**
   * Add block to clipboard
   * @param {Vector3} pos
   * @param {string} blockType
   * @param {any} blockData
   */
  addBlock(pos, blockType, blockData = null) {
    if (this.blocks.length === 0) {
      this.origin = pos.clone();
    }
    this.blocks.push({ pos: pos.clone(), blockType, blockData });
  }

  /**
   * Rotate clipboard 90 degrees
   * Rotation axis: Y (vertical)
   * @param {number} times - Number of 90-degree rotations
   */
  rotateY(times = 1) {
    times = ((times % 4) + 4) % 4;
    if (times === 0) return;

    // Normalize positions relative to origin
    if (!this.origin) return;

    this.blocks.forEach(block => {
      let dx = block.pos.x - this.origin.x;
      let dz = block.pos.z - this.origin.z;

      for (let i = 0; i < times; i++) {
        const newDx = dz;
        const newDz = -dx;
        dx = newDx;
        dz = newDz;
      }

      block.pos = new Vector3(this.origin.x + dx, block.pos.y, this.origin.z + dz);
    });
  }

  /**
   * Flip clipboard (mirror)
   * @param {string} axis - "north" (x), "east" (z), or "up" (y)
   */
  flip(axis) {
    if (!this.origin) return;

    if (axis === "north" || axis === "x") {
      this.blocks.forEach(block => {
        const dx = block.pos.x - this.origin.x;
        block.pos = new Vector3(this.origin.x - dx, block.pos.y, block.pos.z);
      });
    } else if (axis === "east" || axis === "z") {
      this.blocks.forEach(block => {
        const dz = block.pos.z - this.origin.z;
        block.pos = new Vector3(block.pos.x, block.pos.y, this.origin.z - dz);
      });
    } else if (axis === "up" || axis === "y") {
      this.blocks.forEach(block => {
        const dy = block.pos.y - this.origin.y;
        block.pos = new Vector3(block.pos.x, this.origin.y - dy, block.pos.z);
      });
    }
  }

  /**
   * Offset all blocks
   * @param {Vector3} offset
   */
  offset(offset) {
    this.blocks.forEach(block => {
      block.pos = block.pos.add(offset);
    });
    this.origin = this.origin.add(offset);
  }
}

/**
 * Clipboard Manager - manages clipboard for each player
 */
class ClipboardManager {
  constructor() {
    this.clipboards = new Map(); // playerName -> ClipboardData
  }

  /**
   * Get or create clipboard for player
   * @param {string} playerName
   * @returns {ClipboardData}
   */
  getClipboard(playerName) {
    if (!this.clipboards.has(playerName)) {
      this.clipboards.set(playerName, new ClipboardData());
    }
    return this.clipboards.get(playerName);
  }

  /**
   * Clear player's clipboard
   * @param {string} playerName
   */
  clearClipboard(playerName) {
    this.getClipboard(playerName).clear();
  }

  /**
   * Copy blocks to clipboard
   * @param {string} playerName
   * @param {Array} blocks - Array of {pos, blockType, blockData}
   */
  copyBlocks(playerName, blocks) {
    const clipboard = this.getClipboard(playerName);
    clipboard.clear();
    blocks.forEach(block => {
      clipboard.addBlock(block.pos, block.blockType, block.blockData);
    });
  }

  /**
   * Check if clipboard has data
   * @param {string} playerName
   * @returns {boolean}
   */
  hasData(playerName) {
    return this.getClipboard(playerName).getSize() > 0;
  }

  /**
   * Get clipboard size
   * @param {string} playerName
   * @returns {number}
   */
  getSize(playerName) {
    return this.getClipboard(playerName).getSize();
  }

  /**
   * Rotate clipboard
   * @param {string} playerName
   * @param {number} degrees - 90, 180, 270
   */
  rotate(playerName, degrees) {
    const times = degrees / 90;
    this.getClipboard(playerName).rotateY(times);
  }

  /**
   * Flip clipboard
   * @param {string} playerName
   * @param {string} direction - "north", "east", "up"
   */
  flip(playerName, direction) {
    this.getClipboard(playerName).flip(direction);
  }

  /**
   * Offset clipboard
   * @param {string} playerName
   * @param {Vector3} offset
   */
  offset(playerName, offset) {
    this.getClipboard(playerName).offset(offset);
  }

  /**
   * Get blocks from clipboard
   * @param {string} playerName
   * @returns {Array}
   */
  getBlocks(playerName) {
    return this.getClipboard(playerName).blocks;
  }
}

// Export singleton instance
export const clipboardManager = new ClipboardManager();
