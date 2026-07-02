# World Edit Addon for Minecraft Bedrock

> A modern, high-performance WorldEdit-inspired addon for Minecraft Bedrock Edition built with the latest Script API.

> **Project Status:** 🚧 In Development

---

## Features

* Selection Wand
* Region Selection (Pos1 / Pos2)
* Clipboard System
* Copy & Paste
* Undo / Redo
* Replace Blocks
* Fill Regions
* Hollow
* Walls
* Faces
* Outline
* Stack
* Move
* Shift
* Rotate
* Flip
* Per-player clipboard
* Per-player history
* Batch processing for large edits
* Optimized for performance
* Creative mode only
* Modular architecture

---

## Goals

This project aims to become the closest possible equivalent to WorldEdit for Minecraft Bedrock Edition while respecting the limitations of the Bedrock Script API.

The addon is designed with the following priorities:

* Stability
* Performance
* Maintainability
* Scalability
* Clean architecture
* Modern Script API compatibility

---

## Compatibility

Target platform:

* Minecraft Bedrock Edition (Latest Version)
* Latest official Script API
* Behavior Pack
* Resource Pack

Older Script API versions are **not** a priority.

---

## Project Structure

```text
scripts/
│
├── clipboard/
├── commands/
├── history/
├── selection/
├── ui/
├── utils/
│
├── config.js
├── main.js
└── CommandRegistry.js
```

Every system is isolated into its own module to make future development easier.

---

## Design Principles

The project follows these principles:

* No duplicated code
* Small reusable functions
* Modular systems
* Centralized validation
* Proper error handling
* Batch block processing
* Easy future expansion

---

## Commands

Current planned commands:

```text
/wand
/pos1
/pos2
/sel

/set
/replace

/copy
/paste
/cut

/undo
/redo

/walls
/faces
/outline
/hollow

/stack
/move
/shift

/rotate
/flip
```

Unlike Java Edition WorldEdit, commands intentionally use `/` instead of `//` to avoid conflicts in Minecraft Bedrock.

---

## Performance

Large operations are processed over multiple ticks instead of editing every block instantly.

This prevents:

* Server lag
* Game freezes
* Watchdog crashes

---

## Security

This addon only works in **Creative Mode**.

Players in Survival, Adventure or Spectator cannot use editing commands.

---

## Development

The codebase is intended to remain:

* Easy to read
* Easy to maintain
* Easy to expand

Contributors should prioritize clean architecture over quick fixes.

---

## Roadmap

* Improved clipboard serialization
* Better progress UI
* Brush tools
* Shape generation
* Schematics
* Region saving
* Multi-selection
* Better permission system
* Configuration UI

---

## Contributing

Pull Requests are welcome.

Before submitting code:

* Keep the architecture modular.
* Avoid duplicated logic.
* Follow existing coding style.
* Prefer performance over shortcuts.
* Maintain compatibility with the latest Minecraft Bedrock Script API.

---

## License

MIT License

---

Made with ❤️ for the Minecraft Bedrock community.
