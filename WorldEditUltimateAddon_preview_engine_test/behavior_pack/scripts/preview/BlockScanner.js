import { Vector3 } from "../utils/Vector.js";

const DEFAULT_BATCH_SIZE = 256;

function boundsFrom(pos1, pos2) {
  return pos1 instanceof Vector3 ? pos1.getBounds(pos2) : Vector3.fromLocation(pos1).getBounds(Vector3.fromLocation(pos2));
}

function blockKey(dimensionId, x, y, z) {
  return `${dimensionId}:${x},${y},${z}`;
}

export class BlockScanner {
  constructor() {
    this.cache = new Map();
  }

  readBlock(dimension, x, y, z) {
    const key = blockKey(dimension.id, x, y, z);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    let data = null;
    try {
      const block = dimension.getBlock({ x, y, z });
      if (block) {
        data = { x, y, z, type: block.typeId };
      }
    } catch {
      data = { x, y, z, type: "minecraft:air" };
    }

    this.cache.set(key, data);
    return data;
  }

  scanArea(pos1, pos2, dimension) {
    const bounds = boundsFrom(pos1, pos2);
    const blocks = [];

    for (let y = bounds.min.y; y <= bounds.max.y; y++) {
      for (let x = bounds.min.x; x <= bounds.max.x; x++) {
        for (let z = bounds.min.z; z <= bounds.max.z; z++) {
          const data = this.readBlock(dimension, x, y, z);
          if (data) blocks.push(data);
        }
      }
    }

    return blocks;
  }

  *scanAreaByChunk(pos1, pos2, dimension, batchSize = DEFAULT_BATCH_SIZE) {
    const bounds = boundsFrom(pos1, pos2);
    const minChunkX = Math.floor(bounds.min.x / 16);
    const maxChunkX = Math.floor(bounds.max.x / 16);
    const minChunkZ = Math.floor(bounds.min.z / 16);
    const maxChunkZ = Math.floor(bounds.max.z / 16);

    for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
      for (let chunkZ = minChunkZ; chunkZ <= maxChunkZ; chunkZ++) {
        const chunkMinX = Math.max(bounds.min.x, chunkX * 16);
        const chunkMaxX = Math.min(bounds.max.x, chunkX * 16 + 15);
        const chunkMinZ = Math.max(bounds.min.z, chunkZ * 16);
        const chunkMaxZ = Math.min(bounds.max.z, chunkZ * 16 + 15);
        let batch = [];

        for (let y = bounds.min.y; y <= bounds.max.y; y++) {
          for (let x = chunkMinX; x <= chunkMaxX; x++) {
            for (let z = chunkMinZ; z <= chunkMaxZ; z++) {
              const data = this.readBlock(dimension, x, y, z);
              if (data) batch.push(data);

              if (batch.length >= batchSize) {
                yield batch;
                batch = [];
              }
            }
          }
        }

        if (batch.length > 0) {
          yield batch;
        }
      }
    }
  }

  forgetDimension(dimensionId) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${dimensionId}:`)) this.cache.delete(key);
    }
  }
}

export const blockScanner = new BlockScanner();
export function scanArea(pos1, pos2, dimension) {
  return blockScanner.scanArea(pos1, pos2, dimension);
}
