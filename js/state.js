// 1. A template for a completely fresh state
export const createInitialState = () => {
  const savedLevel = localStorage.getItem("last_unlocked_level");
  const maxUnlocked = savedLevel ? parseInt(savedLevel, 10) : 1;

  return {
    currentLevel: maxUnlocked, // What is the player's current level
    maxUnlockedLevel: maxUnlocked,
    grid: [], // The walls and letter will place at
    SIZE: 5,
    movesUsed: 0,
    playerIndex: -1, // Player position
    targetIndex: -1,
    currentCommandIndex: 0,
    queue: [],
    isRunning: false, // Is the player currently moving
    targetWords: [],
    collectedLetters: [],
    hiddenWords: [], // words not yet shown
    hiddenLettersMap: {}, // grid index → letter for hidden letters
    firstWordLength: 0, // length of first word (to know when to reveal)
    hiddenTargetIndex: null,
  };
};

// 2. The active runtime state and active mode tracking
export let gameState = createInitialState();
export let currentMode = "tuto"; // <------- First time

// 3. Helper function to manage state
export function setMode(mode) {
  if (mode === "game" || mode === "tuto") currentMode = mode;
}

export function resetGameState() {
  gameState = createInitialState();
}

export function switchToGameMode() {
  setMode("game");
  resetGameState();
}
