/**
 * Game Mode Validator
 * Check if player is in Creative mode using official API
 * Compatible with Minecraft Bedrock 1.20.0+
 */

/**
 * Check if player is in Creative mode
 * @param {Player} player - Player object
 * @returns {boolean} - True if player is in creative mode
 * @throws {TypeError} if player is null or undefined
 */
export function isCreativeMode(player) {
  if (!player) {
    throw new TypeError("Player cannot be null or undefined");
  }

  try {
    const gameMode = player.getGameMode();
    return String(gameMode).toLowerCase() === "creative";
  } catch (error) {
    console.error("Error checking game mode:", error);
    return false;
  }
}

/**
 * Get player's current game mode
 * @param {Player} player - Player object
 * @returns {string} - "creative", "survival", "adventure", or "spectator"
 * @throws {TypeError} if player is null or undefined
 */
export function getGameMode(player) {
  if (!player) {
    throw new TypeError("Player cannot be null or undefined");
  }

  try {
    return player.getGameMode();
  } catch (error) {
    console.error("Error getting game mode:", error);
    return "unknown";
  }
}

/**
 * Format game mode for player display
 * @param {string} gameMode - Game mode string
 * @returns {string} - Formatted game mode name
 */
export function formatGameMode(gameMode) {
  const modeMap = {
    creative: "Creative",
    survival: "Survival",
    adventure: "Adventure",
    spectator: "Spectator"
  };
  return modeMap[gameMode] || gameMode;
}

/**
 * Check if game mode is allowed
 * @param {string} gameMode - Game mode to check
 * @param {string[]} allowedModes - Array of allowed game modes
 * @returns {boolean}
 */
export function isGameModeAllowed(gameMode, allowedModes = ["creative"]) {
  return allowedModes.includes(gameMode);
}
