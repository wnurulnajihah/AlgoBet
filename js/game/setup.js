import { metricsLog } from "../app/metrics.js";
import { EMPTY, GOAL, PLAYER, WALL } from "../config.js";
import { MODE_CONFIG } from "../mode.js";
import { gameState, resetGameState } from "../state.js";
import { updateCommandQueue } from "../ui/commandQueue.js";
import { renderGrid } from "../ui/gridRenderer.js";
import { updateLevelBadge } from "../ui/levelmap.js";
import { updateMovesCounter } from "../ui/movesCounter.js";
import { FIXED_LEVELS, FIXED_TUTO } from "./data.js";

/**
 * Loads a level by index (1‑based) for game mode, or loads tutorial.
 * @param {number|string} index - Level number (1‑30) or "tuto" for tutorial.
 * @param {string} mode - "tuto" or "game"
 */
export function setLevelLayout(index, mode) {
  const isTutorial = mode === "tuto";
  const source = isTutorial ? FIXED_TUTO[0] : FIXED_LEVELS[index - 1];

  if (!source) return;

  const levelData = source.gridSetup();
  const allWords = source.words;

  // 1. Reset to fresh state
  resetGameState();

  // 2. Apply basic level geometry
  gameState.currentLevel = isTutorial ? 1 : index;
  gameState.grid = [...levelData.grid];
  gameState.playerIndex = levelData.playerIndex;
  gameState.targetIndex = levelData.targetIndex;
  gameState.SIZE = Math.sqrt(levelData.grid.length);
  updateMovesCounter();

  // 3. Setup progressive word sequences based on mode
  const firstWord = allWords[0];
  gameState.targetWords = [firstWord];
  gameState.firstWordLength = firstWord.length;
  gameState.hiddenWords = allWords.slice(1);

  const baseGridCopy = [...levelData.grid];

  if (isTutorial) {
    if (levelData.hiddenLettersMap) {
      Object.entries(levelData.hiddenLettersMap).forEach(([idx, letter]) => {
        const numIdx = parseInt(idx);
        if (baseGridCopy[numIdx] !== PLAYER && baseGridCopy[numIdx] !== GOAL) {
          baseGridCopy[numIdx] = letter;
        }
      });
    }
  }

  if (levelData.targetIndex !== undefined) {
    gameState.hiddenTargetIndex = levelData.targetIndex;
    baseGridCopy[levelData.targetIndex] = EMPTY;
    gameState.targetIndex = null;
  }

  // Pass our safely isolated array into the dynamic mask filter
  const { newGrid, hiddenLettersMap } = hideExtraLetters(baseGridCopy, firstWord);
  gameState.grid = newGrid;
  gameState.hiddenLettersMap = hiddenLettersMap;

  // 4. Render UI Elements flawlessly
  const activeConfig = MODE_CONFIG[mode];
  const gridId = isTutorial ? "tuto-grid" : "game-grid";

  renderGrid(gridId);

  if (activeConfig) {
    const container = document.getElementById(activeConfig.queueId);
    if (container) updateCommandQueue(container);
    if (activeConfig.updateHint) activeConfig.updateHint();
  }

  updateLevelBadge();

  // === Mula kira masa level & log masuk level ===
  metricsLog.startLevelTimer();
  metricsLog.trackAction(mode, "LEVEL_START", {
    targetWords: allWords,
    initialVisibleWord: firstWord,
  });
}

/**
 * Load a level by number (calls setLevelLayout for game mode).
 * Kept for backward compatibility – now actually loads the level.
 * @param {number} levelNumber - 1‑based level number.
 */
export function loadLevel(levelNumber) {
  if (levelNumber >= 1 && levelNumber <= FIXED_LEVELS.length) setLevelLayout(levelNumber, "game");
  else return;
}

/**
 * Returns the current required collection sequence as an array of letters.
 * Example: ["C","O","W"] → after hidden words revealed → ["C","O","W","B","A","T"]
 * @returns {string[]}
 */
export function getRequiredSequence() {
  return gameState.targetWords.join("").split("");
}

/**
 * Hides letters that belong to future words (e.g., B, A, T)
 * so they only appear after the first word (e.g., C, O, W) is collected.
 * @param {Array} grid - The full grid with all letters placed.
 * @param {string} firstWord - The first word that must be collected (e.g., "COW").
 * @returns {Object} { newGrid, hiddenLettersMap }
 */
function hideExtraLetters(grid, firstWord) {
  const neededCount = {}; // Count how many of each letter are needed for the first word
  firstWord.split("").forEach((letter) => {
    neededCount[letter] = (neededCount[letter] || 0) + 1;
  });

  const hiddenLettersMap = {};
  const newGrid = [...grid];

  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];

    // Skip non‑letter cells (player, star, wall, empty)
    if (cell !== EMPTY && cell !== PLAYER && cell !== GOAL && cell !== WALL) {
      // If this letter is still needed for the first word, keep it visible
      if (neededCount[cell] > 0) {
        neededCount[cell]--;
      } else {
        // Otherwise hide it (store in hiddenLettersMap, replace with empty)
        newGrid[i] = EMPTY;
        hiddenLettersMap[i] = cell;
      }
    }
  }

  return { newGrid, hiddenLettersMap };
}
