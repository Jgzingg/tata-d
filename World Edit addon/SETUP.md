# WorldEdit Addon - Installation & Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Enabling Experimental Features](#enabling-experimental-features)
4. [Troubleshooting](#troubleshooting)
5. [Quick Start](#quick-start)

---

## System Requirements

### Minimum Requirements
- **Minecraft Bedrock Edition** (Windows 10/11, Xbox, PS4/5, Nintendo Switch, or Mobile)
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 500MB free space
- **Network**: Required for initial activation only

### Supported Platforms
- ✅ Windows 10/11 (UWP Edition)
- ✅ Xbox One/Series X|S
- ✅ PlayStation 4/5
- ✅ Nintendo Switch
- ✅ iOS/Android (experimental)

---

## Installation Steps

### Step 1: Prepare the Addon Folder

1. Navigate to the location where you downloaded the addon
2. Locate the folder: `World Edit addon`
3. Inside you should see two folders:
   - `behavior_pack` (required)
   - `resource_pack` (optional, for UI improvements)

### Step 2: Enable Experimental Features

**This is CRITICAL for script-based addons to work!**

1. Launch **Minecraft Bedrock Edition**
2. Click **Create New World** or select an existing world
3. Go to **Settings** → **Game** → **Experiments**
4. Enable these features:
   - ✅ "Holiday Creator Features"
   - ✅ "Additional Modding Capabilities"
5. Click **Create** to create the world or **Activate** if modifying existing

> **Note**: Disabling experimental features will disable the addon. Keep them enabled.

### Step 3: Install Behavior Pack

**For Windows UWP/PC:**

1. Open File Explorer
2. Navigate to:
   ```
   %LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\behavior_packs
   ```
3. Copy the `behavior_pack` folder from this addon
4. Paste it into the `behavior_packs` folder
5. Rename the copied folder to something descriptive:
   ```
   behavior_pack → worldedit_behavior
   ```

**For Other Platforms:**

Follow your device's addon management:
- **Xbox**: Use game settings → Manage addons
- **PS4/5**: Use game settings → Manage addons
- **Switch**: Use game settings → Manage addons
- **Mobile**: Use game settings → Manage addons

### Step 4: Install Resource Pack (Optional)

For better visual feedback and UI:

**For Windows UWP/PC:**

1. Navigate to:
   ```
   %LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\resource_packs
   ```
2. Copy the `resource_pack` folder from this addon
3. Paste it into the `resource_packs` folder
4. Rename it:
   ```
   resource_pack → worldedit_resource
   ```

### Step 5: Activate Packs in World

1. Open Minecraft
2. **Create a New World** (or edit existing):
   - Click "Create New World"
   - Go to **Add-ons** (or **Content**)

3. **Apply Behavior Pack**:
   - Go to **Behavior Packs** → **Available**
   - Find **WorldEdit Addon Behavior Pack**
   - Click it and select **Activate**
   - Move it to "Active Packs" on the right

4. **Apply Resource Pack** (optional):
   - Go to **Resource Packs** → **Available**
   - Find **WorldEdit Addon Resource Pack**
   - Click it and select **Activate**
   - Move it to "Active Packs" on the right

5. Click **Create** to start the world with the addon

### Step 6: Verify Installation

1. Join the world in **Creative Mode**
2. Open chat (press `T` on keyboard)
3. Type: `/whelp`
4. You should see a list of all WorldEdit commands
5. Type: `/wand` to receive the selection tool

If you see the help menu and get the wand, **congratulations!** The addon is installed correctly.

---

## Enabling Experimental Features

### Why Are Experiments Needed?

Script-based addons require **experimental features** to function. These features are:
- Stable and safe to use
- Regularly updated with game versions
- Required by the Minecraft scripting API

### How to Enable:

**Method 1: New World**
1. Click "Create New World"
2. Go to "Settings"
3. Scroll to "Experiments"
4. Toggle ON: "Holiday Creator Features" + "Additional Modding Capabilities"
5. Create world

**Method 2: Existing World**
1. Open the world
2. Go to "Settings" → "Game"
3. Scroll to "Experiments"
4. Toggle ON the required features
5. Save and reload

---

## Troubleshooting

### Problem: Addon Not Showing in Pack List

**Solutions:**
1. Verify the folder structure:
   ```
   behavior_pack/
   ├── scripts/
   ├── manifest.json
   └── pack.mcmeta
   ```
2. Check `manifest.json` is valid JSON (no syntax errors)
3. Restart Minecraft completely
4. Try moving pack to: `C:\Users\[YourUsername]\AppData\Local\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\behavior_packs\`

### Problem: Commands Not Working

**Check Checklist:**
- [ ] Are you in **Creative Mode**? (other modes block addon)
- [ ] Did you enable experimental features?
- [ ] Did you activate the behavior pack?
- [ ] Did you reload/restart the world?
- [ ] Type `/whelp` - do you see the menu?

### Problem: "This addon can only be used in Creative mode"

This is expected! The addon only works in Creative mode for safety. To fix:
1. Go to **Settings** → **Game** → **Game Mode**
2. Change from Survival/Adventure/Spectator to **Creative**
3. The addon should now work

### Problem: Wand Not Selecting Blocks

**Check:**
1. Do you have the wand? (Type `/wand` to get it)
2. Are you using **left-click** for Pos1 and **right-click** for Pos2?
3. Try typing `/pos1` and `/pos2` instead
4. Type `/sel` to verify positions are set

### Problem: Operations Freeze the Game

**Solutions:**
1. Reduce selection size (max 500,000 blocks)
2. Edit `config.js` and lower `BLOCKS_PER_TICK`:
   ```javascript
   BLOCKS_PER_TICK: 250  // instead of 500
   ```
3. Close other applications to free memory
4. Use `/undo` if stuck in an operation

### Problem: Resource Pack Not Showing

**Solution:**
- Resource pack is optional and not required for functionality
- If you want it, follow Step 4 above
- You can still use the addon without it

---

## Quick Start

### 1. Get the Wand
```
/wand
```
This gives you the selection tool (diamond axe).

### 2. Select an Area
- **Left-click** a block with wand = Set Position 1
- **Right-click** a block with wand = Set Position 2
- Or use `/pos1` and `/pos2` from your location

### 3. Check Selection
```
/sel
```
Shows your selection size and block count.

### 4. Perform Operations

Fill with stone:
```
/set minecraft:stone
```

Create hollow structure:
```
/hollow
```

Create walls:
```
/walls minecraft:oak_planks
```

### 5. Copy & Paste

Copy:
```
/copy
```

Paste:
```
/paste
```

Rotate before pasting:
```
/rotate 90
```

### 6. Undo Mistakes
```
/undo
/redo
```

---

## Common Tasks

### Create a Platform
```
/pos1
/pos2
/set minecraft:stone
```

### Replace Grass with Dirt
```
/wand
[select area]
/replace minecraft:grass minecraft:dirt
```

### Duplicate a Structure
```
/copy
/stack 3 north  # Make 3 copies going north
```

### Create a Hollow Box
```
/set minecraft:stone
/hollow
```

### Create a Frame Only
```
/outline minecraft:cobblestone
```

---

## Path Locations

### Windows UWP
```
C:\Users\[YourUsername]\AppData\Local\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\
```

Then look for:
- `behavior_packs/` - Place behavior pack here
- `resource_packs/` - Place resource pack here

### Windows Bedrock Launcher
```
C:\Users\[YourUsername]\AppData\Local\Packages\Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe\LocalState\games\com.mojang\
```

### Mac
```
~/Library/Application Support/minecraft/
```

---

## Need Help?

1. **Check the README.md** for detailed command documentation
2. **Verify experimental features** are enabled
3. **Check game mode** - must be Creative
4. **Review config.js** for advanced settings
5. **Check console** (Settings → Feedback) for error messages

---

## Performance Tips

### For Slow Devices:
Edit `behavior_pack/scripts/config.js`:
```javascript
BLOCKS_PER_TICK: 100        // Lower value
MAX_BLOCK_LIMIT: 50000      // Smaller max
```

### For Powerful Devices:
```javascript
BLOCKS_PER_TICK: 2000       // Higher value
MAX_BLOCK_LIMIT: 1000000    // Larger max
```

---

## Uninstalling

1. Delete the behavior pack folder from `behavior_packs/`
2. Delete the resource pack folder from `resource_packs/`
3. Reload/restart Minecraft
4. The addon is completely removed

---

**Congratulations! You're ready to start building with WorldEdit!**

For detailed command documentation, see [README.md](README.md).
