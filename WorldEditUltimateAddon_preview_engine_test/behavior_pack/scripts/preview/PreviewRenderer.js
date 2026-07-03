import { system, world } from "@minecraft/server";
import { blockScanner } from "./BlockScanner.js";
import { CONFIG } from "../config.js";

const PREVIEW_ENTITY = "we:preview_block";
const PREVIEW_TAG = "we_preview";
const MAX_BLOCKS = CONFIG.PREVIEW_MAX_BLOCKS ?? 8192;
const SPAWNS_PER_TICK = CONFIG.PREVIEW_SPAWNS_PER_TICK ?? 96;
const REMOVES_PER_TICK = CONFIG.PREVIEW_REMOVES_PER_TICK ?? 160;

function posKey(x, y, z) {
  return `${x},${y},${z}`;
}

function selectionKey(player, bounds) {
  if (!bounds) return "none";
  return `${player.dimension.id}:${bounds.min.x},${bounds.min.y},${bounds.min.z}:${bounds.max.x},${bounds.max.y},${bounds.max.z}`;
}

function stateEvent(state) {
  if (state === "invalid") return "we:state_invalid";
  if (state === "replace") return "we:state_replace";
  return "we:state_valid";
}

class PreviewSession {
  constructor(playerName) {
    this.playerName = playerName;
    this.key = "none";
    this.entities = new Map();
    this.spawnQueue = [];
    this.removeQueue = [];
    this.state = "valid";
    this.scanJob = null;
  }
}

class PreviewRenderer {
  constructor() {
    this.sessions = new Map();
    this.runHandle = null;
  }

  start(selectionManager) {
    if (this.runHandle !== null) return;

    this.runHandle = system.runInterval(() => {
      for (const player of world.getAllPlayers()) {
        this.updatePlayer(player, selectionManager);
      }
      this.processQueues();
    }, CONFIG.PREVIEW_UPDATE_INTERVAL ?? 4);
  }

  getSession(playerName) {
    if (!this.sessions.has(playerName)) {
      this.sessions.set(playerName, new PreviewSession(playerName));
    }
    return this.sessions.get(playerName);
  }

  updatePlayer(player, selectionManager, state = "valid") {
    const session = this.getSession(player.name);
    const selection = selectionManager.getSelection(player.name);

    if (!selection.isComplete()) {
      this.clear(player.name);
      return;
    }

    const bounds = selection.getBounds();
    const nextKey = selectionKey(player, bounds);
    if (session.key === nextKey && session.state === state) return;

    session.key = nextKey;
    session.state = state;
    this.rebuildDesiredPreview(player, bounds, session);
  }

  rebuildDesiredPreview(player, bounds, session) {
    const wanted = new Set();
    let queued = 0;

    // Clear previous spawn queue before rebuilding
    session.spawnQueue.length = 0;

    const scanIterator = blockScanner.scanAreaByChunk(bounds.min, bounds.max, player.dimension, CONFIG.PREVIEW_SCAN_BATCH_SIZE ?? 256);

    for (const batch of scanIterator) {
      for (const block of batch) {
        if (queued >= MAX_BLOCKS) break;
        const key = posKey(block.x, block.y, block.z);
        wanted.add(key);
        
        // Only add to spawn queue if entity doesn't already exist
        if (!session.entities.has(key)) {
          session.spawnQueue.push({
            key,
            dimensionId: player.dimension.id,
            x: block.x,
            y: block.y,
            z: block.z,
            state: session.state
          });
        }
        queued++;
      }
      if (queued >= MAX_BLOCKS) break;
    }

    // Mark entities for removal if they're no longer in the selection
    for (const [key, entity] of session.entities.entries()) {
      if (!wanted.has(key)) {
        session.removeQueue.push(entity);
        session.entities.delete(key);
      }
    }
  }

  processQueues() {
    for (const session of this.sessions.values()) {
      for (let i = 0; i < REMOVES_PER_TICK && session.removeQueue.length > 0; i++) {
        const entity = session.removeQueue.shift();
        try {
          if (entity?.isValid()) entity.remove();
        } catch {}
      }

      for (let i = 0; i < SPAWNS_PER_TICK && session.spawnQueue.length > 0; i++) {
        const item = session.spawnQueue.shift();
        if (session.entities.has(item.key)) continue;

        try {
          const dimension = world.getDimension(item.dimensionId);
          const entity = dimension.spawnEntity(PREVIEW_ENTITY, {
            x: item.x + 0.5,
            y: item.y,
            z: item.z + 0.5
          });
          entity.addTag(PREVIEW_TAG);
          entity.addTag(`we_preview_owner:${session.playerName}`);
          entity.triggerEvent(stateEvent(item.state));
          session.entities.set(item.key, entity);
        } catch (error) {
          console.warn(`WorldEdit preview spawn failed at ${item.x},${item.y},${item.z}:`, error);
        }
      }
    }
  }

  clear(playerName) {
    const session = this.sessions.get(playerName);
    if (!session) return;

    session.key = "none";
    session.spawnQueue.length = 0;
    for (const entity of session.entities.values()) {
      session.removeQueue.push(entity);
    }
    session.entities.clear();
  }

  clearAllTagged() {
    for (const dimensionId of ["overworld", "nether", "the_end"]) {
      try {
        const dimension = world.getDimension(dimensionId);
        for (const entity of dimension.getEntities({ tags: [PREVIEW_TAG] })) {
          entity.remove();
        }
      } catch {}
    }
  }
}

export const previewRenderer = new PreviewRenderer();
