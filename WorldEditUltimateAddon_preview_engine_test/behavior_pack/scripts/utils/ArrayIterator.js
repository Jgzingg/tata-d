/**
 * Array Iterator - Iterate over a pre-defined array of block changes
 */

export class ArrayIterator {
  /**
   * @param {Array} array - Array of items
   */
  constructor(array) {
    this.array = array;
    this.index = 0;
    this.totalBlocks = array.length;
  }

  getSize() {
    return this.totalBlocks;
  }

  next() {
    if (this.index >= this.array.length) {
      return { position: null, item: null, done: true };
    }
    const item = this.array[this.index++];
    return { position: item, item, done: false }; // position points to item for compatibility
  }

  nextBatch(count) {
    const batch = [];
    for (let i = 0; i < count; i++) {
      const { item, done } = this.next();
      if (done) break;
      batch.push(item);
    }
    return batch;
  }

  getProgress() {
    return Math.round((this.index / this.totalBlocks) * 100);
  }

  isDone() {
    return this.index >= this.array.length;
  }

  reset() {
    this.index = 0;
  }
}
