/**
 * History Manager
 * Manages undo/redo for each player
 */

/**
 * Represents a single action that can be undone/redone
 */
class HistoryAction {
  /**
   * @param {string} name - Action name (for display)
   * @param {Array} changes - Array of {pos, oldBlock, newBlock}
   * @param {Function} execute - Function to execute the action
   * @param {Function} undo - Function to undo the action
   */
  constructor(name, changes, execute, undo) {
    this.name = name;
    this.changes = changes;
    this.execute = execute;
    this.undo = undo;
    this.timestamp = Date.now();
  }
}

/**
 * History Manager - manages undo/redo for each player
 */
class HistoryManager {
  constructor() {
    this.histories = new Map(); // playerName -> {undoStack: [], redoStack: []}
    this.maxHistorySize = 100; // Maximum actions per player
  }

  /**
   * Get or create history for player
   * @param {string} playerName
   * @returns {{undoStack: HistoryAction[], redoStack: HistoryAction[]}}
   */
  getHistory(playerName) {
    if (!this.histories.has(playerName)) {
      this.histories.set(playerName, {
        undoStack: [],
        redoStack: []
      });
    }
    return this.histories.get(playerName);
  }

  /**
   * Add action to history
   * @param {string} playerName
   * @param {HistoryAction} action
   */
  addAction(playerName, action) {
    const history = this.getHistory(playerName);
    
    // Add to undo stack
    history.undoStack.push(action);
    
    // Clear redo stack (new action invalidates redo)
    history.redoStack = [];

    // Limit history size
    if (history.undoStack.length > this.maxHistorySize) {
      history.undoStack.shift();
    }
  }

  /**
   * Undo last action
   * @param {string} playerName
   * @returns {{success: boolean, actionName: string | null}}
   */
  undo(playerName) {
    const history = this.getHistory(playerName);
    
    if (history.undoStack.length === 0) {
      return { success: false, actionName: null };
    }

    const action = history.undoStack.pop();
    
    try {
      // Execute undo function
      if (action.undo) {
        action.undo();
      }
      
      // Move to redo stack
      history.redoStack.push(action);
      
      return { success: true, actionName: action.name };
    } catch (error) {
      // If undo fails, restore to stack
      history.undoStack.push(action);
      console.error("Undo failed:", error);
      return { success: false, actionName: null };
    }
  }

  /**
   * Redo last undone action
   * @param {string} playerName
   * @returns {{success: boolean, actionName: string | null}}
   */
  redo(playerName) {
    const history = this.getHistory(playerName);
    
    if (history.redoStack.length === 0) {
      return { success: false, actionName: null };
    }

    const action = history.redoStack.pop();
    
    try {
      // Execute action again
      if (action.execute) {
        action.execute();
      }
      
      // Move back to undo stack
      history.undoStack.push(action);
      
      return { success: true, actionName: action.name };
    } catch (error) {
      // If redo fails, restore to stack
      history.redoStack.push(action);
      console.error("Redo failed:", error);
      return { success: false, actionName: null };
    }
  }

  /**
   * Clear history for player
   * @param {string} playerName
   */
  clearHistory(playerName) {
    const history = this.getHistory(playerName);
    history.undoStack = [];
    history.redoStack = [];
  }

  /**
   * Check if can undo
   * @param {string} playerName
   * @returns {boolean}
   */
  canUndo(playerName) {
    return this.getHistory(playerName).undoStack.length > 0;
  }

  /**
   * Check if can redo
   * @param {string} playerName
   * @returns {boolean}
   */
  canRedo(playerName) {
    return this.getHistory(playerName).redoStack.length > 0;
  }

  /**
   * Get undo/redo stack info
   * @param {string} playerName
   * @returns {{undoCount: number, redoCount: number}}
   */
  getStackInfo(playerName) {
    const history = this.getHistory(playerName);
    return {
      undoCount: history.undoStack.length,
      redoCount: history.redoStack.length
    };
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();
export { HistoryAction };
