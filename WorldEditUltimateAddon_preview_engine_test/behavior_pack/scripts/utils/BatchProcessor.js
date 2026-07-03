/**
 * Batch Processor - Modern Implementation
 * Handles large operations in batches to avoid lag/crashes
 * Uses system.runInterval for proper scheduling (Bedrock 1.20.0+)
 */

import { system } from "@minecraft/server";
import { BlockIterator } from "./BlockIterator.js";
import { ArrayIterator } from "./ArrayIterator.js";
import { historyManager, HistoryAction } from "../history/HistoryManager.js";
import { CONFIG } from "../config.js";

/**
 * Operation that can be executed in batches
 */
class BatchOperation {
  /**
   * @param {string} name - Operation name
   * @param {BlockIterator} iterator - Block iterator for positions
   * @param {Function} processBlock - Function(position, world) to execute per block
   * @param {any} world - World reference
   * @param {Function} onProgress - Callback(current, total, percentage)
   * @param {Function} onComplete - Callback() when operation finishes
   * @param {Object} historyInfo - Optional { playerName, dimensionId } for undo
   */
  constructor(name, iterator, processBlock, world, onProgress = null, onComplete = null, historyInfo = null) {
    this.name = name;
    this.iterator = iterator;
    this.processBlock = processBlock;
    this.world = world;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.totalBlocks = iterator.getSize();
    this.processedBlocks = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.runHandle = null;
    this.historyInfo = historyInfo;
    this.historyChanges = [];
  }

  /**
   * Get progress as percentage (0-100)
   * @returns {number}
   */
  getProgress() {
    return Math.round((this.processedBlocks / this.totalBlocks) * 100);
  }

  /**
   * Process a single batch
   * @private
   */
  processBatch() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    try {
      // Process BLOCKS_PER_TICK blocks
      const batch = this.iterator.nextBatch(CONFIG.BLOCKS_PER_TICK);

      if (batch.length === 0) {
        // Operation complete
        this.finish();
        return;
      }

      // Process each block in batch
      for (const position of batch) {
        // Se temos que rastrear histórico (e não estamos desfazendo o próprio histórico)
        if (this.historyInfo && this.world) {
          try {
            const dimension = this.world.getDimension(this.historyInfo.dimensionId);
            const block = dimension.getBlock(position);
            if (block && block.typeId) {
              this.historyChanges.push({
                x: position.x,
                y: position.y,
                z: position.z,
                typeId: block.typeId,
                // estados poderiam ser salvos aqui no futuro
              });
            }
          } catch (e) {
            // bloco pode não estar carregado
          }
        }

        this.processBlock(position, this.world);
        this.processedBlocks++;
      }

      // Send progress update if callback exists and interval reached
      if (this.onProgress && this.processedBlocks % CONFIG.PROGRESS_UPDATE_INTERVAL === 0) {
        this.onProgress(this.processedBlocks, this.totalBlocks, this.getProgress());
      }

      // Check if done
      if (this.iterator.isDone()) {
        this.finish();
      }
    } catch (error) {
      console.error(`Error in batch operation "${this.name}":`, error);
      this.finish();
    }
  }

  /**
   * Complete the operation
   * @private
   */
  finish() {
    this.isRunning = false;

    if (this.runHandle !== null) {
      system.clearRun(this.runHandle);
      this.runHandle = null;
    }

    // Send final progress
    if (this.onProgress) {
      this.onProgress(this.processedBlocks, this.totalBlocks, 100);
    }

    // Call completion callback
    if (this.onComplete) {
      this.onComplete();
    }

    // Registrar no histórico se aplicável
    if (this.historyInfo && this.historyChanges.length > 0) {
      const dimensionId = this.historyInfo.dimensionId;
      const changes = this.historyChanges;
      const playerName = this.historyInfo.playerName;
      const opName = this.name;
      const worldRef = this.world;

      const action = new HistoryAction(
        opName,
        changes,
        () => {
          // Redo seria re-aplicar o comando, mas precisaria salvar os NOVOS blocos.
          // Para simplificar e evitar vazamento de memória, Redo pode ser desativado
          // ou recriado posteriormente.
        },
        () => {
          // Undo logic
          const iterator = new ArrayIterator(changes);
          batchProcessor.startOperationWithIterator(
            "undo " + opName,
            iterator,
            worldRef,
            (change, world) => {
              try {
                const dim = world.getDimension(dimensionId);
                const block = dim.getBlock({ x: change.x, y: change.y, z: change.z });
                if (block) {
                  block.setType(change.typeId);
                }
              } catch (e) {}
            },
            null, // sem progresso visual para undo (pode adicionar dps se quiser)
            null
          );
        }
      );
      historyManager.addAction(playerName, action);
    }
  }

  /**
   * Cancel the operation
   */
  cancel() {
    this.finish();
  }
}

/**
 * Batch Processor - manages batch operations with modern API
 */
class BatchProcessor {
  constructor() {
    this.operations = new Map(); // operationId -> BatchOperation
    this.nextId = 1;
  }

  /**
   * Queue and start a new batch operation
   * @param {string} operationName - Name of the operation
   * @param {Vector3} min - Minimum corner of region
   * @param {Vector3} max - Maximum corner of region
   * @param {any} world - World reference
   * @param {Function} processBlock - Function(position, world) to execute per block
   * @param {Function} onProgress - Callback(current, total, percentage) for progress updates
   * @param {Function} onComplete - Callback() when operation finishes
   * @param {Object} historyInfo - Optional info to track undo
   * @returns {string} Operation ID for tracking
   */
  startOperation(operationName, min, max, world, processBlock, onProgress = null, onComplete = null, historyInfo = null) {
    try {
      // Create iterator for this operation
      const iterator = new BlockIterator(min, max);
      
      return this.startOperationWithIterator(operationName, iterator, world, processBlock, onProgress, onComplete, historyInfo);
    } catch (error) {
      console.error("Error starting batch operation:", error);
      if (onComplete) onComplete();
      return null;
    }
  }

  /**
   * Start a new batch operation using a custom iterator (used for Undo)
   */
  startOperationWithIterator(operationName, iterator, world, processBlock, onProgress = null, onComplete = null, historyInfo = null) {
    try {
      // Validate block count
      const blockCount = iterator.getSize();
      if (blockCount > CONFIG.MAX_BLOCK_LIMIT) {
        throw new Error(`Operation would exceed block limit: ${blockCount} > ${CONFIG.MAX_BLOCK_LIMIT}`);
      }

      // Create operation object
      const operation = new BatchOperation(
        operationName,
        iterator,
        processBlock,
        world,
        onProgress,
        onComplete,
        historyInfo
      );

      // Generate operation ID
      const operationId = String(this.nextId++);
      this.operations.set(operationId, operation);

      // Start operation using system.runInterval
      operation.isRunning = true;
      operation.runHandle = system.runInterval(() => {
        operation.processBatch();

        // Cleanup if done
        if (!operation.isRunning) {
          this.operations.delete(operationId);
        }
      }, 1); // Run every tick

      return operationId;
    } catch (error) {
      console.error("Error starting batch operation:", error);
      if (onComplete) {
        onComplete();
      }
      return null;
    }
  }

  /**
   * Get progress of an operation
   * @param {string} operationId
   * @returns {{current: number, total: number, percentage: number} | null}
   */
  getProgress(operationId) {
    const op = this.operations.get(operationId);
    if (!op) {
      return null;
    }

    return {
      current: op.processedBlocks,
      total: op.totalBlocks,
      percentage: op.getProgress()
    };
  }

  /**
   * Pause operation
   * @param {string} operationId
   */
  pauseOperation(operationId) {
    const op = this.operations.get(operationId);
    if (op) {
      op.isPaused = true;
    }
  }

  /**
   * Resume operation
   * @param {string} operationId
   */
  resumeOperation(operationId) {
    const op = this.operations.get(operationId);
    if (op) {
      op.isPaused = false;
    }
  }

  /**
   * Cancel operation
   * @param {string} operationId
   */
  cancelOperation(operationId) {
    const op = this.operations.get(operationId);
    if (op) {
      op.cancel();
      this.operations.delete(operationId);
    }
  }

  /**
   * Get count of active operations
   * @returns {number}
   */
  getActiveOperationCount() {
    let count = 0;
    for (const op of this.operations.values()) {
      if (op.isRunning) {
        count++;
      }
    }
    return count;
  }

  /**
   * Check if an operation is running
   * @param {string} operationId
   * @returns {boolean}
   */
  isOperationRunning(operationId) {
    const op = this.operations.get(operationId);
    return op ? op.isRunning : false;
  }
}

// Export singleton instance
export const batchProcessor = new BatchProcessor();
export { BatchOperation };
