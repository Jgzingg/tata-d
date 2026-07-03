/**
 * Block Registry
 *
 * Discovers ALL block types that exist in the running game through the
 * official Script API (`BlockTypes.getAll()`) and caches them in memory.
 *
 * This replaces any manually maintained block list. When Mojang adds new
 * blocks in a future version, this registry picks them up automatically
 * the next time the addon starts - no code changes required.
 */
import { BlockTypes } from "@minecraft/server";

class BlockRegistry {
  constructor() {
    /** @type {string[]} full ids, e.g. "minecraft:stone" */
    this._ids = [];
    /** @type {Set<string>} same data, O(1) lookup */
    this._idSet = new Set();
    /** @type {Map<string, string[]>} "stone" -> ["minecraft:stone"] */
    this._shortNameMap = new Map();
    this._loaded = false;
  }

  /**
   * Load every block type into memory. Safe to call many times -
   * only does real work once (per requirement: cache, don't re-scan).
   */
  load() {
    if (this._loaded) return;

    try {
      const types = BlockTypes.getAll();

      for (const type of types) {
        const id = type?.id;
        if (!id) continue;

        this._idSet.add(id);
        this._ids.push(id);

        const short = id.includes(":") ? id.split(":")[1] : id;
        if (!this._shortNameMap.has(short)) {
          this._shortNameMap.set(short, []);
        }
        this._shortNameMap.get(short).push(id);
      }

      this._ids.sort();
      this._loaded = true;

      console.info(
        `§6[WorldEdit]§r Block registry loaded: ${this._ids.length} block types indexed from the game itself.`
      );
    } catch (error) {
      console.error("§c[WorldEdit] Failed to load block registry:", error);
    }
  }

  /** @returns {boolean} */
  isLoaded() {
    return this._loaded;
  }

  /** @returns {string[]} every known full block id */
  getAllIds() {
    this.load();
    return this._ids;
  }

  /** @param {string} id full id, e.g. "minecraft:stone" */
  hasId(id) {
    this.load();
    return this._idSet.has(id);
  }

  /**
   * @param {string} shortName e.g. "stone" (no namespace)
   * @returns {string[]} full ids sharing that short name (almost always length 1)
   */
  getByShortName(shortName) {
    this.load();
    return this._shortNameMap.get(shortName) || [];
  }

  /** @returns {string[]} every known short (namespace-less) block name */
  getShortNames() {
    this.load();
    return Array.from(this._shortNameMap.keys());
  }

  /** @returns {number} total distinct block ids known */
  getCount() {
    this.load();
    return this._ids.length;
  }
}

// Singleton - loaded once, reused everywhere.
export const blockRegistry = new BlockRegistry();
