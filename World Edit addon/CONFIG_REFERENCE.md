# WorldEdit Addon - Configuration Reference

This guide explains all configurable options in the addon.

## Location

Configuration file: `behavior_pack/scripts/config.js`

---

## Configuration Options

### 1. Block Limits

#### `MAX_BLOCK_LIMIT`
Maximum number of blocks that can be edited in a single operation.

```javascript
MAX_BLOCK_LIMIT: 500000
```

**Recommended Values:**
- Small builds: `100000` (100K blocks)
- Medium builds: `500000` (500K blocks) 
- Large builds: `1000000` (1M blocks)
- Servers: `50000` (50K blocks for stability)

**Impact:**
- Higher = can edit larger areas, uses more RAM
- Lower = faster operations, more restrictions

---

### 2. Performance

#### `BLOCKS_PER_TICK`
Number of blocks processed per game tick (per 50ms).

```javascript
BLOCKS_PER_TICK: 500
```

**Recommended Values:**
- Slow devices: `50-100`
- Normal devices: `250-500`
- Fast devices: `1000-2000`
- Servers: `500-1000`

**Impact:**
- Higher = operations complete faster, but may cause lag spikes
- Lower = smoother gameplay, slower operations

**Note:** 1 tick = 50ms. Values too high can freeze the game.

---

### 3. Progress Updates

#### `PROGRESS_UPDATE_INTERVAL`
How many blocks to process before sending a progress update.

```javascript
PROGRESS_UPDATE_INTERVAL: 5000
```

**Recommended Values:**
- Minimal feedback: `10000`
- Normal: `5000`
- Frequent updates: `1000`

**Impact:**
- Higher = less chat spam, less performance impact
- Lower = more frequent updates for long operations

---

### 4. Items

#### `WAND_ITEM`
Which item is used as the WorldEdit wand.

```javascript
WAND_ITEM: "minecraft:diamond_axe"
```

**Valid Options:**
```javascript
"minecraft:diamond_axe"        // Default
"minecraft:iron_axe"           // Lighter
"minecraft:golden_axe"         // Golden
"minecraft:diamond_pickaxe"    // Pickaxe
"minecraft:blaze_rod"          // Magic wand
"minecraft:stick"              // Simple stick
```

---

### 5. Permissions

#### `ALLOWED_PLAYERS`
List of players allowed to use addon. Empty = all players in creative.

```javascript
// Allow all players in creative mode
ALLOWED_PLAYERS: []

// Restrict to specific players
ALLOWED_PLAYERS: ["Steve", "Admin", "Builder"]

// Add more players
ALLOWED_PLAYERS: [
  "Steve",
  "Alex",
  "Admin",
  "ModCreator",
  "PlayerOne"
]
```

**Behavior:**
- Empty array = Everyone in creative can use it
- Non-empty array = Only listed players can use it (must be in creative)

---

### 6. Game Modes

#### `ALLOWED_GAME_MODES`
Which game modes can use the addon.

```javascript
ALLOWED_GAME_MODES: ["creative"]
```

**Note:** Currently only "creative" is supported. The addon will always restrict to creative mode.

**Future Options:** (not yet implemented)
```javascript
ALLOWED_GAME_MODES: ["creative", "adventure"]
```

---

### 7. Messages

#### `MESSAGES` Object
Customizable chat messages and prefixes.

```javascript
MESSAGES: {
  PREFIX: "§6[WorldEdit]§r ",
  ONLY_CREATIVE: "§cThis addon can only be used in Creative mode.",
  NO_PERMISSION: "§cYou don't have permission to use this command.",
  NO_SELECTION: "§cYou must select an area first. Use /wand to get the wand.",
  POS1_SET: "§aPosition 1 set to §6%x%, §6%y%, §6%z%",
  POS2_SET: "§aPosition 2 set to §6%x%, §6%y%, §6%z%",
  // ... more messages
}
```

#### Color Codes:
```
§0 - Black
§1 - Dark Blue
§2 - Dark Green
§3 - Dark Cyan
§4 - Dark Red
§5 - Purple
§6 - Gold
§7 - Light Gray
§8 - Dark Gray
§9 - Blue
§a - Green
§b - Cyan
§c - Red
§d - Magenta
§e - Yellow
§f - White
§r - Reset to white
```

#### Customizing Messages:

Change prefix:
```javascript
PREFIX: "§9[Edit]§r "
```

Change error message:
```javascript
ONLY_CREATIVE: "§cSorry! Creative mode only.",
```

Add custom text:
```javascript
OPERATION_STARTING: "§5Starting operation...",
```

---

## Example Configurations

### Small Creative Server
```javascript
export const CONFIG = {
  MAX_BLOCK_LIMIT: 50000,
  BLOCKS_PER_TICK: 250,
  PROGRESS_UPDATE_INTERVAL: 2500,
  WAND_ITEM: "minecraft:blaze_rod",
  ALLOWED_PLAYERS: ["Admin", "Builder"],
  MESSAGES: {
    PREFIX: "§5[Server Edit]§r ",
    // ... rest of messages
  }
};
```

### Large Creative World
```javascript
export const CONFIG = {
  MAX_BLOCK_LIMIT: 1000000,
  BLOCKS_PER_TICK: 1000,
  PROGRESS_UPDATE_INTERVAL: 10000,
  WAND_ITEM: "minecraft:diamond_axe",
  ALLOWED_PLAYERS: [],  // Everyone
  // ... rest of config
};
```

### Performance-Optimized
```javascript
export const CONFIG = {
  MAX_BLOCK_LIMIT: 100000,
  BLOCKS_PER_TICK: 100,
  PROGRESS_UPDATE_INTERVAL: 5000,
  WAND_ITEM: "minecraft:stick",
  ALLOWED_PLAYERS: [],
  // ... rest of config
};
```

---

## Testing Configuration Changes

After editing `config.js`:

1. **Restart Minecraft**
   - Close Minecraft completely
   - Reopen and load world with addon

2. **Verify Changes**
   - Type `/whelp` to test
   - Perform a small operation
   - Check chat messages

3. **Rollback if Issues**
   - If problems occur, revert changes
   - Restart Minecraft

---

## Advanced Configuration

### Increasing Limits for Mega Builds

For building large structures:

```javascript
MAX_BLOCK_LIMIT: 5000000,      // 5 million blocks
BLOCKS_PER_TICK: 2000,         // Process fast
PROGRESS_UPDATE_INTERVAL: 25000 // Less spam
```

**⚠️ Warning:** Requires powerful device!

### Strict Permissions

For multiplayer/server:

```javascript
ALLOWED_PLAYERS: [
  "Owner",
  "Admin1",
  "Admin2",
  "Builder"
]
```

Only these players can use addon.

### Minimal Chat Spam

```javascript
PROGRESS_UPDATE_INTERVAL: 50000  // Update every 50K blocks
```

Progress updates only show every 50,000 blocks.

### Frequent Feedback

```javascript
PROGRESS_UPDATE_INTERVAL: 1000   // Update every 1K blocks
```

Useful for monitoring large operations.

---

## Configuration Validation

Verify your config has:
1. ✅ Valid JSON syntax
2. ✅ All required properties
3. ✅ Numeric values for limits
4. ✅ Array for ALLOWED_PLAYERS
5. ✅ String values for messages

### Test with:
- Simple `/wand` command should work
- Custom prefix should appear in chat
- Player restrictions should be enforced

---

## Performance Tuning Guide

### If Operations Are Too Slow:
1. Increase `BLOCKS_PER_TICK` (e.g., 500 → 1000)
2. Increase `MAX_BLOCK_LIMIT` if you want larger areas
3. Reduce `PROGRESS_UPDATE_INTERVAL` to avoid chat lag

### If Operations Cause Lag:
1. Decrease `BLOCKS_PER_TICK` (e.g., 500 → 250)
2. Decrease `MAX_BLOCK_LIMIT` to smaller areas
3. Use smaller selections for edits

### If Chat Is Spammy:
1. Increase `PROGRESS_UPDATE_INTERVAL` (e.g., 5000 → 10000)
2. Less frequent updates = cleaner chat

### If Memory Is Low:
1. Decrease `MAX_BLOCK_LIMIT`
2. Decrease `BLOCKS_PER_TICK`
3. Close other applications

---

## Troubleshooting Configuration

### Changes Not Taking Effect

**Solution:**
1. Save the file (Ctrl+S)
2. Completely exit Minecraft
3. Reopen and load world

### Error: "JSON Parse Error"

**Solution:**
1. Check for missing commas
2. Check for unmatched quotes
3. Use JSON validator: https://jsonlint.com/

### Example of Syntax Error:
```javascript
// ❌ Wrong - missing comma
BLOCKS_PER_TICK: 500
MAX_BLOCK_LIMIT: 100000  // <- missing comma above

// ✅ Correct
BLOCKS_PER_TICK: 500,
MAX_BLOCK_LIMIT: 100000,
```

---

## Default Configuration

The addon comes with balanced defaults suitable for most players:

```javascript
export const CONFIG = {
  MAX_BLOCK_LIMIT: 500000,
  BLOCKS_PER_TICK: 500,
  PROGRESS_UPDATE_INTERVAL: 5000,
  COMMAND_PREFIX: "/",
  WAND_ITEM: "minecraft:diamond_axe",
  ALLOWED_GAME_MODES: ["creative"],
  ALLOWED_PLAYERS: [],
  MESSAGES: {
    PREFIX: "§6[WorldEdit]§r ",
    ONLY_CREATIVE: "§cThis addon can only be used in Creative mode.",
    // ... 30+ messages defined
  }
};
```

These defaults are recommended for most use cases.

---

## Questions & Support

If you need help configuring, check:
1. This guide first
2. The README.md for commands
3. The SETUP.md for installation issues
4. Review the config.js comments for details

Happy building!
