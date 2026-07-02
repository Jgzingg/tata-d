# WorldEdit Addon - Developer Documentation

This guide is for developers who want to extend the addon or understand its architecture.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Systems](#core-systems)
3. [Module Reference](#module-reference)
4. [Creating Custom Commands](#creating-custom-commands)
5. [API Examples](#api-examples)
6. [Best Practices](#best-practices)

---

## Architecture Overview

### System Diagram

```
Main Entry Point (main.js)
    ↓
Event Listeners (Chat, Click)
    ↓
Command Registry
    ├── Individual Commands
    ├── Selection Manager
    ├── Clipboard Manager
    └── History Manager
    ↓
Utilities
    ├── Vector3 (3D math)
    ├── BlockIterator (iteration)
    ├── BlockValidator (validation)
    └── BatchProcessor (performance)
    ↓
Minecraft World API
```

### Key Design Principles

1. **Modularity** - Each system is independent
2. **Immutability** - Data is mostly immutable (Vector3, Selection)
3. **Per-Player Data** - Selections, clipboards, history per player
4. **Batch Processing** - Large operations split into chunks
5. **Error Handling** - Try-catch blocks prevent crashes

---

## Core Systems

### 1. Selection System

**File:** `selection/SelectionManager.js`

Manages player selections (Pos1 + Pos2).

```javascript
import { selectionManager } from "./selection/SelectionManager.js";

// Set position 1
selectionManager.setPos1("PlayerName", new Vector3(x, y, z));

// Set position 2
selectionManager.setPos2("PlayerName", new Vector3(x, y, z));

// Get bounds
const bounds = selectionManager.getBounds("PlayerName");
// Returns: { min: Vector3, max: Vector3 }

// Get block count
const count = selectionManager.getBlockCount("PlayerName");

// Check if complete
const complete = selectionManager.hasSelection("PlayerName");

// Clear
selectionManager.clearSelection("PlayerName");
```

### 2. Clipboard System

**File:** `clipboard/ClipboardManager.js`

Manages per-player clipboards for copy/paste.

```javascript
import { clipboardManager } from "./clipboard/ClipboardManager.js";

// Copy blocks
const blocks = [
  { pos: Vector3, blockType: "minecraft:stone", blockData: null },
  // ... more blocks
];
clipboardManager.copyBlocks("PlayerName", blocks);

// Check if has data
if (clipboardManager.hasData("PlayerName")) {
  const blocks = clipboardManager.getBlocks("PlayerName");
}

// Rotate
clipboardManager.rotate("PlayerName", 90); // 90, 180, or 270

// Flip (mirror)
clipboardManager.flip("PlayerName", "north"); // north, east, up

// Offset
const offset = new Vector3(5, 0, 10);
clipboardManager.offset("PlayerName", offset);
```

### 3. History System

**File:** `history/HistoryManager.js`

Manages undo/redo for each player.

```javascript
import { historyManager, HistoryAction } from "./history/HistoryManager.js";

// Add action to history
const action = new HistoryAction(
  "Fill Stone",                    // Name
  [],                             // Changes (for display)
  () => { /* execute code */ },   // Execute function
  () => { /* undo code */ }       // Undo function
);
historyManager.addAction("PlayerName", action);

// Undo
const result = historyManager.undo("PlayerName");
if (result.success) {
  console.log(`Undid: ${result.actionName}`);
}

// Redo
const result = historyManager.redo("PlayerName");

// Check status
if (historyManager.canUndo("PlayerName")) {
  // Can undo
}

if (historyManager.canRedo("PlayerName")) {
  // Can redo
}
```

---

## Module Reference

### Vector3

**File:** `utils/Vector.js`

3D vector for coordinates.

```javascript
import { Vector3 } from "../utils/Vector.js";

// Create vector
const v1 = new Vector3(10, 20, 30);

// From location
const v2 = Vector3.fromLocation(player.location);

// Operations
const v3 = v1.add(v2);              // Add
const v4 = v1.subtract(v2);         // Subtract
const v5 = v1.multiply(2);          // Scale

// Properties
console.log(v1.x, v1.y, v1.z);     // Coordinates
console.log(v1.toString());         // "10, 20, 30"

// Distance
const dist = v1.distance(v2);       // Euclidean
const manhattan = v1.absDistance(v2); // Manhattan

// Bounds
const bounds = v1.getBounds(v2);    // { min: Vector3, max: Vector3 }

// Comparison
if (v1.equals(v2)) { }
```

### BlockIterator

**File:** `utils/BlockIterator.js`

Efficient iteration over 3D block regions.

```javascript
import { BlockIterator } from "../utils/BlockIterator.js";

const min = new Vector3(0, 0, 0);
const max = new Vector3(100, 50, 100);
const iterator = new BlockIterator(min, max);

// Get single block
const { position, done } = iterator.next();

// Get batch of blocks
const batch = iterator.nextBatch(500);

// Progress
const percent = iterator.getProgress();

// Check if done
if (iterator.isDone()) { }

// Reset
iterator.reset();

// Total size
const total = iterator.getSize(); // Number of blocks
```

### BlockValidator

**File:** `utils/BlockValidator.js`

Validate and normalize block names.

```javascript
import {
  isValidBlock,
  normalizeBlockName,
  getValidBlocks,
  getBlockDisplayName
} from "../utils/BlockValidator.js";

// Validate
if (isValidBlock("stone")) {
  // Valid block
}

// Normalize
const normalized = normalizeBlockName("dirt");
// Returns: "minecraft:dirt"

// Get display name
const name = getBlockDisplayName("minecraft:oak_planks");
// Returns: "oak_planks"

// Get all valid blocks
const blocks = getValidBlocks(); // Array of all valid block types
```

### GameMode

**File:** `utils/GameMode.js`

Check game mode.

```javascript
import { isCreativeMode } from "../utils/GameMode.js";

if (isCreativeMode(player)) {
  // Player is in creative mode
}
```

---

## Creating Custom Commands

### Basic Template

```javascript
// File: behavior_pack/scripts/commands/MyCommand.js

import { Command } from "./Command.js";
import { getMessage } from "../config.js";

export class MyCommand extends Command {
  constructor() {
    super(
      "mycommand",                    // Command name (no /)
      "Description of my command",    // Help text
      "/mycommand [args]"             // Usage example
    );
  }

  validateArgs(args) {
    // Check if arguments are valid
    return args.length >= 1;
  }

  execute(player, args, world) {
    // Check if can execute (creative mode, permissions)
    const check = this.canExecute(player);
    if (!check.canExecute) {
      this.sendMessage(player, check.errorMessage);
      return;
    }

    // Validate arguments
    if (!this.validateArgs(args)) {
      this.sendError(
        player,
        getMessage("INVALID_ARGUMENTS", { usage: this.usage })
      );
      return;
    }

    // Implement command logic
    try {
      this.sendSuccess(player, "Command executed!");
    } catch (error) {
      console.error("Command error:", error);
      this.sendError(player, "Failed to execute command");
    }
  }
}
```

### Register Custom Command

1. Create file: `behavior_pack/scripts/commands/MyCommand.js`
2. Edit `CommandRegistry.js`:

```javascript
import { MyCommand } from "./MyCommand.js";

registerDefaultCommands() {
  // ... existing commands ...
  const defaultCommands = [
    // ... other commands ...
    new MyCommand(),
  ];
  // ... rest of code ...
}
```

### Command Base Class API

```javascript
import { Command } from "./Command.js";

class MyCommand extends Command {
  // Message methods
  sendMessage(player, message);      // Send plain message
  sendSuccess(player, message);      // Green success message
  sendError(player, message);        // Red error message
  
  // Validation
  validateArgs(args);                // Return true/false
  canExecute(player);                // Return {canExecute, errorMessage}
  
  // Properties
  this.name;                         // Command name
  this.description;                  // Help text
  this.usage;                        // Usage example
}
```

---

## API Examples

### Example 1: Fill Selection with Block

```javascript
import { selectionManager } from "../selection/SelectionManager.js";
import { BlockIterator } from "../utils/BlockIterator.js";

function fillSelection(playerName, blockType, world) {
  const bounds = selectionManager.getBounds(playerName);
  if (!bounds) return false;

  const iterator = new BlockIterator(bounds.min, bounds.max);
  
  while (!iterator.isDone()) {
    const batch = iterator.nextBatch(500);
    for (const pos of batch) {
      const dimension = world.getDimension("overworld");
      dimension.getBlock(pos).setType(blockType);
    }
  }

  return true;
}
```

### Example 2: Copy Selection to Clipboard

```javascript
import { selectionManager } from "../selection/SelectionManager.js";
import { clipboardManager } from "../clipboard/ClipboardManager.js";
import { BlockIterator } from "../utils/BlockIterator.js";

function copySelection(playerName, world) {
  const bounds = selectionManager.getBounds(playerName);
  if (!bounds) return 0;

  const blocks = [];
  const iterator = new BlockIterator(bounds.min, bounds.max);

  const dimension = world.getDimension("overworld");
  
  while (!iterator.isDone()) {
    const batch = iterator.nextBatch(500);
    for (const pos of batch) {
      const block = dimension.getBlock(pos);
      blocks.push({
        pos: pos,
        blockType: block.typeId,
        blockData: block
      });
    }
  }

  clipboardManager.copyBlocks(playerName, blocks);
  return blocks.length;
}
```

### Example 3: Replace Blocks

```javascript
import { selectionManager } from "../selection/SelectionManager.js";
import { BlockIterator } from "../utils/BlockIterator.js";

function replaceBlocks(playerName, fromBlock, toBlock, world) {
  const bounds = selectionManager.getBounds(playerName);
  if (!bounds) return 0;

  let replaced = 0;
  const iterator = new BlockIterator(bounds.min, bounds.max);
  const dimension = world.getDimension("overworld");

  while (!iterator.isDone()) {
    const batch = iterator.nextBatch(500);
    for (const pos of batch) {
      const block = dimension.getBlock(pos);
      if (block.typeId === fromBlock) {
        block.setType(toBlock);
        replaced++;
      }
    }
  }

  return replaced;
}
```

### Example 4: Undo/Redo Action

```javascript
import { historyManager, HistoryAction } from "../history/HistoryManager.js";

function executeAndTrack(playerName, actionName, executeFunc, undoFunc) {
  const action = new HistoryAction(
    actionName,
    [],
    executeFunc,
    undoFunc
  );

  // Execute immediately
  executeFunc();

  // Add to history
  historyManager.addAction(playerName, action);
}

// Usage
executeAndTrack(
  "PlayerName",
  "Fill Stone",
  () => {
    // Execute code
    fillSelection("PlayerName", "minecraft:stone", world);
  },
  () => {
    // Undo code
    fillSelection("PlayerName", "minecraft:air", world);
  }
);
```

---

## Best Practices

### 1. Always Validate Input

```javascript
// ✅ Good
if (!selectionManager.hasSelection(playerName)) {
  this.sendError(player, getMessage("NO_SELECTION"));
  return;
}

// ❌ Bad
const bounds = selectionManager.getBounds(playerName);
bounds.min.x; // Might crash if bounds is null
```

### 2. Use Try-Catch for Safety

```javascript
// ✅ Good
try {
  dimension.getBlock(pos).setType(blockType);
} catch (error) {
  console.error("Block operation failed:", error);
}

// ❌ Bad
dimension.getBlock(pos).setType(blockType); // Might crash
```

### 3. Batch Large Operations

```javascript
// ✅ Good - processes in chunks
const iterator = new BlockIterator(min, max);
while (!iterator.isDone()) {
  const batch = iterator.nextBatch(500);
  for (const pos of batch) {
    processBlock(pos);
  }
}

// ❌ Bad - processes all at once
for (let x = min.x; x <= max.x; x++) {
  for (let y = min.y; y <= max.y; y++) {
    for (let z = min.z; z <= max.z; z++) {
      processBlock({x, y, z});
    }
  }
}
```

### 4. Use Immutable Data

```javascript
// ✅ Good - creates new Vector3
const offset = new Vector3(5, 0, 10);
const newPos = oldPos.add(offset);

// ❌ Bad - modifying original (if possible)
oldPos.x += 5; // Don't do this
```

### 5. Provide User Feedback

```javascript
// ✅ Good - clear messages
this.sendSuccess(player, "Operation complete! 1000 blocks processed.");

// ❌ Bad - no feedback
fillSelection(playerName, blockType, world);
```

### 6. Check Game Mode

```javascript
// ✅ Good
const check = this.canExecute(player);
if (!check.canExecute) {
  this.sendMessage(player, check.errorMessage);
  return;
}

// ❌ Bad - no check
// Allows non-creative players to use addon
```

### 7. Use Configuration

```javascript
// ✅ Good - uses config
import { CONFIG } from "../config.js";

if (count > CONFIG.MAX_BLOCK_LIMIT) {
  // Error
}

// ❌ Bad - hardcoded value
if (count > 500000) {
  // Error
}
```

### 8. Handle Dimensions Correctly

```javascript
// ✅ Good
const dimension = world.getDimension(player.dimension.id);

// ❌ Bad - assumes overworld
const dimension = world.getDimension("overworld");
```

---

## Testing Commands

### Manual Testing

1. Type `/wand` to get wand
2. Select area
3. Test command: `/mycommand args`
4. Check output in chat
5. Type `/undo` to undo changes

### Debug Logging

```javascript
console.warn("Debug info:", someValue);
// View in: Settings → Feedback
```

### Common Errors

```
"TypeError: Cannot read property 'x' of null"
→ Selection is null, check with hasSelection()

"world is not defined"
→ Make sure world is passed as parameter

"Cannot find module"
→ Check import path is correct

"Unexpected token"
→ Check JavaScript syntax (missing commas, brackets)
```

---

## Performance Profiling

### Timing Operations

```javascript
const start = Date.now();

// Your operation here
fillSelection(playerName, blockType, world);

const time = Date.now() - start;
console.warn(`Operation took ${time}ms`);
```

### Optimize Large Operations

```javascript
// Reduce batch size if causing lag
const batchSize = 100; // instead of 500
const batch = iterator.nextBatch(batchSize);
```

---

## Contributing

To contribute improvements:

1. Follow the existing code style
2. Add comments explaining complex logic
3. Test with various scenarios
4. Update documentation

---

**Happy developing!**
