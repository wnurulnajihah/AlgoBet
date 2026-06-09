import { setControlsEnabled } from "../app/init.js";
import { metricsLog } from "../app/metrics.js";
import { GuidedTutorial } from "../app/tutorial.js";
import { EMPTY, GOAL, PLAYER, WALL } from "../config.js";
import { MODE_CONFIG } from "../mode.js";
import { gameState } from "../state.js";
import { updateCommandQueue } from "../ui/commandQueue.js";
import { renderGrid } from "../ui/gridRenderer.js";
import { updateMovesCounter } from "../ui/movesCounter.js";
import { SoundFX } from "../ui/sound.js";
import { handleVictory } from "./modal.js";
import { getRequiredSequence } from "./setup.js";

/* ===================================
          HELPERS
   =================================== */
function refreshGameUI(mode) {
  const config = MODE_CONFIG[mode];
  if (!config) return;

  renderGrid(config.gridId);
  config.updateHint();

  const container = document.getElementById(config.queueId);
  if (container) updateCommandQueue(container);
}

/* ===================================
      THE BRAIN => MOVEMENT HANDLER
   =================================== */
export async function performCommandByDirection(dir, mode) {
  /* -------------------------------------------------
      1. CALCULATE THE TARGET POSITION
     ------------------------------------------------- */
  let row = Math.floor(gameState.playerIndex / gameState.SIZE);
  let col = gameState.playerIndex % gameState.SIZE;

  if (dir === "up") row--;
  else if (dir === "down") row++;
  else if (dir === "left") col--;
  else if (dir === "right") col++;

  // If the player can't move, return
  if (row < 0 || row >= gameState.SIZE || col < 0 || col >= gameState.SIZE) return false;

  const nextIdx = row * gameState.SIZE + col;
  const targetCell = gameState.grid[nextIdx];
  const isLetterTile = targetCell !== EMPTY && targetCell !== GOAL && targetCell !== WALL;

  /* -------------------------------------------------
      2. VALIDATE STATE
      ------------------------------------------------- */
  // Not move if blocked by the wall
  if (targetCell === WALL) {
    SoundFX.playFail();
    triggerWrongFlashAnim(mode, nextIdx);

    metricsLog.updateBehaviorCounter("GAME_ERROR");

    return false;
  }

  const requiredSeq = getRequiredSequence();

  // If collecting letters
  if (isLetterTile) {
    const nextNeeded = requiredSeq[gameState.collectedLetters.length];

    if (targetCell !== nextNeeded) {
      SoundFX.playFail();
      triggerWrongFlashAnim(mode, nextIdx);
      return false; // Player does NOT move if not follow the sequence of letters
    }
  }

  /* -------------------------------------------------
      3. UPDATE STATE
      ------------------------------------------------- */
  gameState.movesUsed++;
  updateMovesCounter();

  // Move to target position
  gameState.grid[gameState.playerIndex] = EMPTY;

  const collectedTileValue = targetCell;
  gameState.playerIndex = nextIdx;

  gameState.grid[gameState.playerIndex] = PLAYER;

  /* -------------------------------------------------
      4. COLLECTING LETTER/STARS ACTION
      ------------------------------------------------- */
  if (isLetterTile) {
    gameState.collectedLetters.push(collectedTileValue);

    // 1. Reveals hidden letters after collecting first set of letters. Works for both mode
    if (
      gameState.hiddenWords.length > 0 &&
      gameState.collectedLetters.length === gameState.firstWordLength
    ) {
      revealHiddenWords();
    }

    // 2. Spawn the star after collecting second set of letter
    let totalExpectedLetters = 0;
    for (let i = 0; i < gameState.targetWords.length; i++) {
      if (gameState.targetWords[i]) {
        totalExpectedLetters += gameState.targetWords[i].length;
      }
    }
    if (gameState.collectedLetters.length === totalExpectedLetters) revealHiddenTarget();

    // Automatically sums up the length of the words up to the player's current step. It doesn't care if it's step 1, 2, or 50
    if (mode === "tuto") {
      const currentStep = GuidedTutorial.currentStep;
      const targetWords = gameState.targetWords || [];

      // 1. Calculate how many letters need to be collected to finish the current step's word(s)
      // For Step 1: needs 3 letters. For Step 2: needs 6 letters.
      let requiredLettersForCurrentStep = 0;

      for (let i = 0; i < currentStep; i++)
        if (targetWords[i]) requiredLettersForCurrentStep += targetWords[i].length;

      // 2. If we hit exactly the total required letters for this step, advance!
      if (gameState.collectedLetters.length === requiredLettersForCurrentStep)
        GuidedTutorial.nextStep();
    }

    SoundFX.playCollect();
  }

  return true;
}

function triggerWrongFlashAnim(mode, targetIndex) {
  const config = MODE_CONFIG[mode];
  const gridContainer = document.getElementById(config?.gridId);
  const tile = gridContainer?.children[targetIndex];

  if (tile) {
    tile.classList.add("wrong-flash");

    // Remove it when the animation finishes
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("wrong-flash");
      },
      { once: true },
    );
  }
}

/* ===================================
             QUEUE HANDLER
   =================================== */
export async function runCommands(mode) {
  if (gameState.isRunning || gameState.queue.length === 0) return;
  gameState.isRunning = true;

  // DISABLE SEMUA BUTTON SEBELUM GERAK
  setControlsEnabled(false, mode);

  if (mode === "tuto") {
    const wrapper = document.getElementById("tutorial-instructional-wrapper");
    if (wrapper) wrapper.style.display = "none";
  }

  // Track which command we're executing
  try {
    for (let i = 0; i < gameState.queue.length; i++) {
      gameState.currentCommandIndex = i;
      const command = gameState.queue[i];

      // 1. Calculate and update state
      const success = await performCommandByDirection(command, mode);
      if (!success) break;

      // 2. Refresh UI immediately so the player moves visually
      refreshGameUI(mode);

      // 3. Pause to let the user see the movement and hear the sound
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(() => {
      finishExecution(mode);
      setControlsEnabled(true, mode);
    }, 300);
  }
}

export function undoCommand(mode) {
  if (gameState.isRunning || gameState.queue.length === 0) return;
  gameState.queue.pop();
  refreshGameUI(mode);
}

export function clearQueue(mode) {
  if (gameState.isRunning) return;
  gameState.queue = [];
  refreshGameUI(mode);
}

export function addCommands(dir, mode) {
  if (gameState.isRunning) return;
  gameState.queue.push(dir);
  refreshGameUI(mode);
}

/* ===================================
   MOVEMENT & COLLECTION CHECK HANDLER
   =================================== */
export function getPredictedPath() {
  let row = Math.floor(gameState.playerIndex / gameState.SIZE);
  let col = gameState.playerIndex % gameState.SIZE;
  const pathIndices = [];

  for (const dir of gameState.queue) {
    // Movement logic (same for both modes)
    if (dir === "up") row--;
    else if (dir === "down") row++;
    else if (dir === "left") col--;
    else if (dir === "right") col++;

    if (row >= 0 && row < gameState.SIZE && col >= 0 && col < gameState.SIZE)
      pathIndices.push(row * gameState.SIZE + col);
  }

  return pathIndices;
}

/* ===================================
     REVEAL HIDDEN LETTERS AND GOAL
   =================================== */
function revealHiddenWords() {
  if (gameState.hiddenWords.length === 0) return;

  if (!gameState.hiddenLettersMap || typeof gameState.hiddenLettersMap !== "object")
    gameState.hiddenLettersMap = {};

  // Add hidden words to targetWords
  gameState.targetWords.push(...gameState.hiddenWords);

  // Place hidden letters back on the grid
  for (const [idx, letter] of Object.entries(gameState.hiddenLettersMap)) {
    const numIdx = parseInt(idx);

    if (gameState.grid[numIdx] === EMPTY) {
      gameState.grid[numIdx] = letter;
    }
  }

  // Clear hidden data so it doesn't trigger again
  gameState.hiddenWords = [];
  gameState.hiddenLettersMap = {};

  SoundFX.playCollect(); // or a different sound
}

function revealHiddenTarget() {
  if (gameState.hiddenTargetIndex !== undefined) {
    const targetIdx = gameState.hiddenTargetIndex;
    if (gameState.grid[targetIdx] === EMPTY) {
      gameState.grid[targetIdx] = GOAL;
      gameState.targetIndex = targetIdx;
    }
    delete gameState.hiddenTargetIndex;
  }
}

/* ===========================================
    FINISH EXECUTION + LEVEL COMPLETE HANDLER
   =========================================== */
function finishExecution(mode) {
  gameState.isRunning = false;
  gameState.queue = [];
  gameState.currentCommandIndex = 0;
  refreshGameUI(mode);

  const requiredSeq = getRequiredSequence();
  const playerReachedTarget = gameState.playerIndex === gameState.targetIndex;
  const allLettersCollected = gameState.collectedLetters.length === requiredSeq.length;

  // Check if the level win or lost. If collect star before collecting all letters, level lost
  if (playerReachedTarget && allLettersCollected) {
    gameState.queue = [];
    refreshGameUI(mode);

    if (mode === "tuto" && allLettersCollected) GuidedTutorial.finish();
    handleVictory(mode);
    return;
  }
}
