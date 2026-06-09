import { GuidedTutorial } from "../app/tutorial.js";
import { gameState } from "../state.js";

function setButtonState(btnId, isEnabled) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.disabled = !isEnabled;
  btn.classList.toggle("btn-enabled", isEnabled);
  btn.classList.toggle("btn-disabled", !isEnabled);

  // Clean up glow highlights dynamically when disabling/enabling buttons
  btn.classList.remove("glow-run-ready", "glow-active-btn");
}

export function renderWordCards(containerId, goalSlotId, isTutorial = false) {
  const container = document.getElementById(containerId);
  const goalSlot = document.getElementById(goalSlotId);
  if (!container) return;

  container.innerHTML = "";

  const targetWords = gameState.targetWords || [];
  const hiddenWord = gameState.hiddenWords || [];
  const totalCollected = gameState.collectedLetters.length;

  // All words are completed only if all target words are collected AND no hidden words remain
  const totalRequiredLetters = targetWords.join("").length;
  let allWordsCompleted = totalCollected === totalRequiredLetters && hiddenWord.length === 0;

  let lettersConsumed = 0;

  // Render visible target words
  targetWords.forEach((word) => {
    const card = document.createElement("div");
    card.className = "word-card-target";

    const wordStart = lettersConsumed;
    const wordEnd = wordStart + word.length;

    const isWordCompleted = totalCollected >= wordEnd;

    if (isWordCompleted) card.classList.add("completed-card");
    else if (totalCollected >= wordStart) card.classList.add("active-card");

    for (let i = 0; i < word.length; i++) {
      const tile = document.createElement("div");
      tile.className = "card-letter-tile";

      const globalIndex = wordStart + i;
      if (globalIndex < totalCollected) tile.classList.add("lit");

      tile.textContent = word[i];
      card.appendChild(tile);
    }

    container.appendChild(card);
    lettersConsumed += word.length;
  });

  // Render hidden words as placeholders (question marks)
  hiddenWord.forEach((word) => {
    const card = document.createElement("div");
    card.className = "word-card-target hidden-word-card";

    for (let i = 0; i < word.length; i++) {
      const tile = document.createElement("div");
      tile.className = "card-letter-tile";
      tile.textContent = "?";
      card.appendChild(tile);
    }
    container.appendChild(card);
  });

  // Render star
  if (goalSlot) {
    goalSlot.className = allWordsCompleted ? "goal-slot active-goal" : "goal-slot";
    container.appendChild(goalSlot);
  }

  if (isTutorial) {
    updateTutorialButtonsState(allWordsCompleted);
  } else {
    const hasQueue = gameState.queue && gameState.queue.length > 0;
    setButtonState("btnRun", hasQueue);
    setButtonState("btnUndo", hasQueue);
    setButtonState("btnClear", hasQueue);
  }
}

function updateTutorialButtonsState() {
  // 1. Disable ALL tutorial buttons first
  [
    "btnRunTuto",
    "btnUndoTuto",
    "btnClearTuto",
    "btnUpTuto",
    "btnDownTuto",
    "btnLeftTuto",
    "btnRightTuto",
  ].forEach((id) => setButtonState(id, false));

  const runBtn = document.getElementById("btnRunTuto");
  const currentStep = GuidedTutorial.currentStep;
  const activeSolution = GuidedTutorial.pathSolutions?.[currentStep];

  if (!activeSolution) return;

  const queueLen = gameState.queue ? gameState.queue.length : 0;
  const requiredLen = activeSolution.length;

  // 2. Only allow RUN if the player's queue length matches the solution length
  if (queueLen === requiredLen) {
    setButtonState("btnRunTuto", true);
    runBtn?.classList.add("glow-run-ready");
  }

  // 3. Otherwise, guide them by highlighting the next correct directional button
  else if (queueLen < requiredLen) {
    const nextDir = activeSolution[queueLen];

    const correctBtn = document.getElementById(
      `btn${nextDir.charAt(0).toUpperCase() + nextDir.slice(1)}Tuto`,
    );

    if (correctBtn) {
      setButtonState(correctBtn.id, true);
      correctBtn.classList.add("glow-active-btn");
    }
  }
}

export function showLevelTutorial() {
  const overlay = document.getElementById("focusOverlay");
  const tutBox = document.getElementById("tutorialText");
  if (overlay) overlay.style.display = "none";
  if (tutBox) tutBox.style.display = "none";
  updateTutorialHint();
}

/**
 * @param {string} mode
 */
export function updateHint(mode) {
  if (mode === "game") {
    renderWordCards("gameWordHintContainer", "gameGoal", false);
  } else {
    renderWordCards("tutoWordHintContainer", "tutoGoal", true);
  }
}

export const updateTutorialHint = () => updateHint("tutorial");
export const updateWordHint = () => updateHint("game");
