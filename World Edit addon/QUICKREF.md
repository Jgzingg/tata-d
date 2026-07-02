# WorldEdit Addon - Quick Reference & Cheat Sheet

Fast lookup guide for common tasks and commands.

---

## Command Quick Reference

| Command | Syntax | Example |
|---------|--------|---------|
| **Selection** |
| Wand | `/wand` | `/wand` |
| Pos1 | `/pos1` | `/pos1` |
| Pos2 | `/pos2` | `/pos2` |
| Show Info | `/sel` | `/sel` |
| **Editing** |
| Fill | `/set <block>` | `/set stone` |
| Replace | `/replace <from> <to>` | `/replace dirt grass` |
| Walls | `/walls <block>` | `/walls oak_planks` |
| Faces | `/faces <block>` | `/faces cobblestone` |
| Hollow | `/hollow` | `/hollow` |
| Outline | `/outline <block>` | `/outline diamond_block` |
| **Clipboard** |
| Copy | `/copy` | `/copy` |
| Cut | `/cut` | `/cut` |
| Paste | `/paste` | `/paste` |
| Rotate | `/rotate <deg>` | `/rotate 90` |
| Flip | `/flip <dir>` | `/flip north` |
| **Movement** |
| Stack | `/stack <times> [dir]` | `/stack 5 north` |
| Move | `/move <dist> [dir]` | `/move 10 up` |
| Shift | `/shift <dist> [dir]` | `/shift 5 east` |
| **History** |
| Undo | `/undo` | `/undo` |
| Redo | `/redo` | `/redo` |
| **Help** |
| Commands | `/whelp` | `/whelp` |

---

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Open Chat | `T` |
| Send Message | `Enter` |
| Cancel | `Esc` |

---

## Common Workflows

### Creating a Platform

```
/pos1                    (or left-click wand)
/pos2                    (or right-click wand)
/set minecraft:stone
```

### Replacing Ground

```
/wand
(left-click bottom-left block)
(right-click top-right block)
/replace minecraft:dirt minecraft:grass
```

### Duplicating a Building

```
/copy
/stack 3 north
/paste                   (repeat 3 times as needed)
```

### Creating Walls

```
(select area)
/walls minecraft:cobblestone
```

### Making Structure Hollow

```
(select area)
/hollow
```

### Copy & Rotate

```
/copy
/rotate 90
/paste
/rotate 180
/paste
```

---

## Block Types (Common)

```
minecraft:stone
minecraft:dirt
minecraft:grass
minecraft:oak_planks
minecraft:oak_log
minecraft:spruce_log
minecraft:birch_log
minecraft:cobblestone
minecraft:sand
minecraft:gravel
minecraft:glass
minecraft:oak_leaves
minecraft:bricks
minecraft:obsidian
minecraft:diamond_block
minecraft:gold_block
minecraft:iron_block
minecraft:lapis_block
minecraft:sandstone
minecraft:nether_brick
minecraft:purpur_block
```

**Tip:** You can omit `minecraft:` prefix (e.g., `/set stone` works)

---

## Directions

| Direction | Aliases |
|-----------|---------|
| up | y |
| down | - |
| north | - |
| south | - |
| east | - |
| west | - |

### Direction Guide

```
NORTH
  |
W-+-E
  |
SOUTH

UP = Y-axis
DOWN = -Y-axis
```

---

## Rotation Angles

| Command | Result |
|---------|--------|
| `/rotate 90` | Quarter turn (clockwise) |
| `/rotate 180` | Half turn (flip) |
| `/rotate 270` | 3/4 turn (counterclockwise) |

---

## Flip Directions

| Direction | Effect |
|-----------|--------|
| `north` / `x` | Mirror left-right |
| `east` / `z` | Mirror front-back |
| `up` / `y` | Mirror top-bottom |

---

## Troubleshooting Checklist

| Issue | Solution |
|-------|----------|
| Commands not working | ✓ Creative mode? ✓ Experimental enabled? ✓ Addon active? |
| Wand not selecting | ✓ Have wand? ✓ Left=Pos1, Right=Pos2? |
| No selection error | ✓ Set both pos1 and pos2? ✓ In same world? |
| Invalid block error | ✓ Correct block name? ✓ Spaces removed? |
| Game freezes | ↓ Selection size, lower BLOCKS_PER_TICK in config |
| Large area slow | ↑ BLOCKS_PER_TICK in config.js |
| Can't undo | ✓ Did nothing yet? ✓ /undo available? |

---

## Color Codes

Use in custom messages (edit `config.js`):

```
§0 Black      §8 Dark Gray
§1 Dk Blue    §9 Blue
§2 Dk Green   §a Green
§3 Dk Cyan    §b Cyan
§4 Dk Red     §c Red
§5 Purple     §d Magenta
§6 Gold       §e Yellow
§7 Lt Gray    §f White
§r Reset      (back to white)
```

Example: `§6[Message]§r This is gold then white`

---

## File Locations

### Windows
```
C:\Users\[YOU]\AppData\Local\Packages\
  Microsoft.MinecraftUWP_8wekyb3d8bbwe\
  LocalState\games\com.mojang\
    ├─ behavior_packs\
    └─ resource_packs\
```

### Configuration
```
behavior_pack/scripts/config.js
```

---

## Config Quick Changes

### Increase Limit
Edit `config.js`:
```javascript
MAX_BLOCK_LIMIT: 1000000  // from 500000
```

### Make Operations Faster
```javascript
BLOCKS_PER_TICK: 1000     // from 500
```

### Make Operations Smoother
```javascript
BLOCKS_PER_TICK: 250      // from 500
```

### Restrict Players
```javascript
ALLOWED_PLAYERS: ["Steve", "Admin"]
```

**Always restart Minecraft after editing config.js**

---

## Performance Settings

| Device | Recommended |
|--------|------------|
| Slow | BLOCKS_PER_TICK: 100 |
| Normal | BLOCKS_PER_TICK: 500 |
| Fast | BLOCKS_PER_TICK: 2000 |

| Usage | Max Limit |
|-------|-----------|
| Small builds | 100000 |
| Large builds | 500000 |
| Mega builds | 1000000+ |

---

## Tips & Tricks

### Quick Selection Switch
- Use `/pos1` and `/pos2` instead of wand clicking if you're inaccurate

### View Selection Stats
- Type `/sel` anytime to see current area size and block count

### Rotate Before Paste
- Copy → `/rotate 90` → Paste (do 4 times for all angles)

### Flip Building
- Copy → `/flip north` → Paste (creates mirror)

### Create Multiple Copies
- `/stack 5 north` duplicates selection 5 times going north

### Fast Movement
- `/move 50 up` moves entire selection 50 blocks up instantly

### Check Before Big Op
- Type `/sel` before `/set` to verify area size

### Undo Mistakes Fast
- `/undo` anytime to revert last operation
- `/redo` to redo if you undo too much

---

## Hotkeys Reference

**In Chat:**
- `Escape` = Close chat, cancel
- `Enter` = Send command
- `Up Arrow` = Repeat last command
- `Ctrl+A` = Select all text

**In Game:**
- `T` = Open chat
- `E` = Inventory (closes chat)

---

## Backup Before Large Operations

Steps:
1. Press `Win+I` to save world
2. Make 2x copies of world folder
3. Do risky operations on one copy
4. If problem, revert to backup

---

## Common Errors & Fixes

**"No selection"**
→ Set pos1 and pos2 first with `/pos1` and `/pos2`

**"Invalid block"**
→ Check spelling: `/set minecraft:stone` (not `minecraft:stones`)

**"Addon only in Creative"**
→ Change game mode in settings

**"Selection too large"**
→ Reduce MAX_BLOCK_LIMIT or select smaller area

**"Can't paste"**
→ Use `/copy` first, then `/paste`

---

## Math Quick Reference

| 1 chunk | 16×16 blocks |
|---------|--------------|
| 1 block | 1 unit |
| Y max | 320 (bedrock at -64) |

---

## Advanced Commands

### Multi-Command Chains
```
/copy
/rotate 90
/paste
/move 20 north
```

Run each command separately (pasting happens at cursor location).

### Edit Then Replace
```
/copy          # Copy original
/rotate 90     # Rotate version
/paste         # Paste rotated copy
/undo          # Change your mind? No problem!
```

---

## Getting Help

1. **In-Game Help** → `/whelp`
2. **Command Help** → Click on command link (if available)
3. **Full Guide** → See README.md
4. **Setup Issues** → See SETUP.md
5. **Configuration** → See CONFIG_REFERENCE.md
6. **Developer** → See DEVELOPER.md

---

## Keyboard Symbols

| Symbol | Meaning |
|--------|---------|
| `Ctrl` | Control key |
| `Win` | Windows key |
| `+` | Press together |
| `/` | Command prefix |

---

## Version Information

- **Addon Version**: 1.0.0
- **Min Minecraft**: 1.19.50+
- **Required**: Experimental features enabled

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Default Block Limit | 500,000 |
| Default Speed | 500 blocks/tick |
| Max History Size | 100 actions |
| Supported Platforms | 6+ |
| Commands | 20+ |

---

**Bookmark this page for quick reference!**

For more details, see:
- README.md (full documentation)
- SETUP.md (installation help)
- CONFIG_REFERENCE.md (all settings)
- DEVELOPER.md (coding guide)
