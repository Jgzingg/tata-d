# WorldEdit Addon for Minecraft Bedrock Edition

A powerful and stable block editing tool for Minecraft Bedrock Edition, similar to WorldEdit for Java Edition.

## Features

### Selection System
- **`/wand`** - Get the WorldEdit selection wand
  - Left-click blocks to set Position 1
  - Right-click blocks to set Position 2
- **`/pos1`** - Set Position 1 to your current location
- **`/pos2`** - Set Position 2 to your current location
- **`/sel`** - Display current selection information

### Block Manipulation
- **`/set <block>`** - Fill entire selection with specified block
- **`/replace <from> <to>`** - Replace all blocks of one type with another
- **`/walls <block>`** - Create walls (no ceiling/floor)
- **`/hollow`** - Remove inside blocks (keep walls)
- **`/outline <block>`** - Create outline of selection edges

### Clipboard System
- **`/copy`** - Copy selection to clipboard
- **`/cut`** - Cut selection to clipboard (copy + delete)
- **`/paste`** - Paste clipboard at your position
- **`/rotate <90|180|270>`** - Rotate clipboard
- **`/flip <north|east|up>`** - Flip/mirror clipboard

### Duplication & Movement
- **`/stack <times> [direction]`** - Duplicate selection (direction: up, down, north, south, east, west)
- **`/move <distance> [direction]`** - Move selection in specified direction

### History
- **`/undo`** - Undo last action
- **`/redo`** - Redo last undone action

### Help
- **`/whelp`** - Display all available commands

---

## Installation

### Requirements
- Minecraft Bedrock Edition (Windows 10/11, Xbox, Nintendo Switch, PS4/5, Mobile)
- Experimental features enabled (for script support)

### Installation Steps

1. **Download the Addon**
   - Get the addon folder from the provided location

2. **Enable Experimental Features**
   - Launch Minecraft
   - Create or open a world
   - Go to Settings → Experiments
   - Enable "Holiday Creator Features"
   - Enable "Additional Modding Capabilities"
   - Restart the world

3. **Add Behavior Pack**
   - Navigate to: `%LOCALAPPDATA%/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/behavior_packs/`
   - Copy the `behavior_pack` folder from this addon
   - Rename it to something descriptive (e.g., `worldedit_behavior`)

4. **Add Resource Pack** (Optional, for UI enhancements)
   - Navigate to: `%LOCALAPPDATA%/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/resource_packs/`
   - Copy the `resource_pack` folder
   - Rename it to something descriptive (e.g., `worldedit_resource`)

5. **Apply to World**
   - Open Minecraft
   - Create or edit a world
   - Go to Resource Packs → Add Packs → Your Packs
   - Select both packs and move them to "Active"
   - Go to Behavior Packs → Add Packs → Your Packs
   - Select the behavior pack and move it to "Active"
   - Create/load the world

6. **Verify Installation**
   - Join the world in Creative mode
   - Type `/whelp` to see all commands
   - Type `/wand` to get the selection tool

---

## Usage Examples

### Creating a Stone Platform

```
/wand
# Left-click at one corner
# Right-click at opposite corner
/set minecraft:stone
```

### Replacing Dirt with Grass

```
/wand
# Define selection area
/replace minecraft:dirt minecraft:grass
```

### Creating a Hollow Structure

```
/wand
# Define selection
/hollow
```

### Copying and Pasting

```
/copy                    # Copy selection
/paste                   # Paste at your feet
/rotate 90              # Rotate 90 degrees
/paste                  # Paste rotated version
```

### Duplicating a Structure

```
/stack 5 north          # Duplicate 5 times toward north
/stack 3 up             # Duplicate 3 times upward
```

### Creating Walls

```
/wand
# Define area
/walls minecraft:cobblestone    # Only outer walls
```

---

## Configuration

Edit `behavior_pack/scripts/config.js` to customize:

```javascript
export const CONFIG = {
  // Maximum blocks allowed per operation
  MAX_BLOCK_LIMIT: 500000,

  // Blocks processed per tick (higher = faster, lower = less lag)
  BLOCKS_PER_TICK: 500,

  // Wand item type
  WAND_ITEM: "minecraft:diamond_axe",

  // Allowed players (empty = all players in creative)
  ALLOWED_PLAYERS: [],

  // Custom messages
  MESSAGES: {
    PREFIX: "§6[WorldEdit]§r ",
    // ... more messages
  }
};
```

---

## Restrictions & Limitations

### Game Mode Restriction
- **Only works in Creative mode**
- Any other game mode will show: "This addon can only be used in Creative mode."

### Performance
- Large selections (>500,000 blocks) are prevented
- Operations run in batches to prevent lag/crashes
- Large operations show progress updates

### Features
- One selection per player at a time
- One clipboard per player
- Full undo/redo history per player
- Compatible with Bedrock 1.19.50+

---

## Project Structure

```
World Edit addon/
├── behavior_pack/
│   ├── scripts/
│   │   ├── commands/              # All command implementations
│   │   │   ├── Command.js         # Base command class
│   │   │   ├── CommandRegistry.js # Command manager
│   │   │   ├── WandCommand.js
│   │   │   ├── SetCommand.js
│   │   │   ├── PasteCommand.js
│   │   │   ├── CopyCommand.js
│   │   │   └── ... (more commands)
│   │   ├── selection/             # Selection system
│   │   │   └── SelectionManager.js
│   │   ├── clipboard/             # Copy/paste system
│   │   │   └── ClipboardManager.js
│   │   ├── history/               # Undo/redo system
│   │   │   └── HistoryManager.js
│   │   ├── utils/                 # Utility modules
│   │   │   ├── Vector.js          # 3D vector math
│   │   │   ├── BlockIterator.js   # Efficient block iteration
│   │   │   ├── BlockValidator.js  # Block type validation
│   │   │   ├── GameMode.js        # Game mode checking
│   │   │   └── BatchProcessor.js  # Batch operation handling
│   │   ├── config.js              # Configuration
│   │   └── main.js                # Entry point
│   ├── manifest.json
│   └── pack.mcmeta
├── resource_pack/
│   ├── textures/
│   │   ├── items/
│   │   │   └── wand.png           # Custom wand texture
│   │   └── item_texture.json      # Texture mapping
│   ├── models/
│   │   └── item/
│   │       └── wand.json          # Item model
│   ├── items.json                 # Item configuration
│   ├── manifest.json
│   ├── pack.mcmeta
│   └── TEXTURE_GUIDE.md          # Texture customization guide
└── README.md (this file)
```

---

## Architecture & Design

### Modular Design
- Each system (selection, clipboard, history) is independent
- Commands are isolated in separate files
- Utilities are reusable across modules

### Performance Optimization
- **Batch Processing**: Large operations process in chunks per tick
- **Block Iteration**: Efficient 3D coordinate iteration
- **Progress Tracking**: Real-time progress updates

### Error Handling
- All user inputs are validated
- Game mode checks prevent non-creative access
- Block limits prevent massive operations
- Try-catch blocks prevent crashes

### Data Management
- Per-player selections, clipboards, and history
- Automatic cleanup on player disconnect
- Memory-efficient data structures

---

## Troubleshooting

### Commands Not Working
1. Verify you're in **Creative mode**
2. Check that experimental features are enabled
3. Ensure the behavior pack is active
4. Type `/whelp` to verify addon is loaded

### Wand Not Selecting Blocks
1. Make sure you have the wand (`/wand`)
2. Use **left-click** for Position 1
3. Use **right-click** for Position 2
4. Check `/sel` to see current selection

### Operation Freezing Game
1. Reduce `BLOCKS_PER_TICK` in config.js
2. Use smaller selections
3. Try `/undo` if stuck

### Pack Won't Activate
1. Restart Minecraft completely
2. Verify manifest.json is valid JSON
3. Check that experimental features are enabled

---

## Advanced Configuration

### Adjusting Performance

Edit `behavior_pack/scripts/config.js`:

```javascript
// For slower devices:
BLOCKS_PER_TICK: 100,        // Fewer blocks per tick

// For powerful devices:
BLOCKS_PER_TICK: 1000,       // More blocks per tick
```

### Setting Block Limit

```javascript
// For very large projects:
MAX_BLOCK_LIMIT: 1000000,

// For small builds:
MAX_BLOCK_LIMIT: 100000
```

### Restricting Access

```javascript
// Only allow specific players:
ALLOWED_PLAYERS: ["Steve", "Admin", "Builder"],

// Allow all in creative:
ALLOWED_PLAYERS: []
```

---

## Wand Customization

### Custom Wand Texture

The addon includes a **customizable texture** for the wand item. To customize the wand appearance:

1. **Locate the Texture File**
   - File: `resource_pack/textures/items/wand.png`
   - Size: 16×16 or 32×32 pixels (PNG format)

2. **Edit or Replace the Texture**
   - Open `wand.png` in an image editor (Photoshop, GIMP, Paint.NET, etc.)
   - Modify the colors, patterns, or effects
   - Save as PNG with transparency support

3. **Apply Changes**
   - Replace the file in `resource_pack/textures/items/wand.png`
   - Reload or restart the resource pack in Minecraft
   - Changes take effect immediately

4. **Configuration Files** (Already Set Up)
   - `resource_pack/textures/item_texture.json` - Maps texture file
   - `resource_pack/models/item/wand.json` - Defines item model
   - `resource_pack/items.json` - Links item to texture

For detailed texture customization guides, see **`resource_pack/TEXTURE_GUIDE.md`**

---

## Commands Reference

| Command | Syntax | Description |
|---------|--------|-------------|
| wand | `/wand` | Get selection tool |
| pos1 | `/pos1` | Set pos1 at player location |
| pos2 | `/pos2` | Set pos2 at player location |
| sel | `/sel` | Show selection info |
| set | `/set <block>` | Fill selection |
| replace | `/replace <from> <to>` | Replace blocks |
| walls | `/walls <block>` | Create walls |
| hollow | `/hollow` | Hollow out structure |
| outline | `/outline <block>` | Create outline |
| copy | `/copy` | Copy to clipboard |
| paste | `/paste` | Paste clipboard |
| cut | `/cut` | Cut to clipboard |
| rotate | `/rotate <90\|180\|270>` | Rotate clipboard |
| flip | `/flip <north\|east\|up>` | Mirror clipboard |
| stack | `/stack <times> [dir]` | Duplicate selection |
| move | `/move <dist> [dir]` | Move selection |
| undo | `/undo` | Undo last action |
| redo | `/redo` | Redo last action |
| whelp | `/whelp` | Show all commands |

---

## Version History

### v1.0.0
- Initial release
- All core features implemented
- Stable batch processing
- Full undo/redo support
- Per-player management

---

## License

This addon is provided as-is for use in Minecraft Bedrock Edition. Feel free to modify for personal use.

---

## Support

For issues or suggestions, refer to the code comments or adjust the configuration in `config.js`.

Happy building!
