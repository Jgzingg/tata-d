/**
 * Block Iterator - Iterate over blocks in a region efficiently
 */

import { Vector3 } from "./Vector.js";

/**
 * Iterator for all blocks within a region
 * Used for batch processing
 */
export class BlockIterator {
  /**
   * @param {Vector3} min - Minimum corner
   * @param {Vector3} max - Maximum corner
   */
  constructor(min, max) {
    const bounds = min.getBounds(max);
    this.min = bounds.min;
    this.max = bounds.max;
    this.currentX = this.min.x;
    this.currentY = this.min.y;
    this.currentZ = this.min.z;
    this.totalBlocks = this.getSize();
    this.processedBlocks = 0;
  }

  /**
   * Get total number of blocks
   * @returns {number}
   */
  getSize() {
    const sizeX = this.max.x - this.min.x + 1;
    const sizeY = this.max.y - this.min.y + 1;
    const sizeZ = this.max.z - this.min.z + 1;
    return sizeX * sizeY * sizeZ;
  }

  /**
   * Get next block position
   * @returns {{position: Vector3, done: boolean}}
   */
  next() {
    if (this.currentY > this.max.y) {
      return { position: null, done: true };
    }

    const position = new Vector3(this.currentX, this.currentY, this.currentZ);
    this.processedBlocks++;

    // Increment coordinates
    this.currentZ++;
    if (this.currentZ > this.max.z) {
      this.currentZ = this.min.z;
      this.currentX++;
      if (this.currentX > this.max.x) {
        this.currentX = this.min.x;
        this.currentY++;
      }
    }

    return { position, done: false };
  }

  /**
   * Get next N blocks (batch processing)
   * @param {number} count - Number of blocks to get
   * @returns {Vector3[]}
   */
  nextBatch(count) {
    const batch = [];
    for (let i = 0; i < count; i++) {
      const { position, done } = this.next();
      if (done) break;
      batch.push(position);
    }
    return batch;
  }

  /**
   * Get progress as percentage
   * @returns {number} 0-100
   */
  getProgress() {
    return Math.round((this.processedBlocks / this.totalBlocks) * 100);
  }

  /**
   * Check if iteration is complete
   * @returns {boolean}
   */
  isDone() {
    return this.currentY > this.max.y;
  }

  /**
   * Reset iterator
   */
  reset() {
    this.currentX = this.min.x;
    this.currentY = this.min.y;
    this.currentZ = this.min.z;
    this.processedBlocks = 0;
  }
}
