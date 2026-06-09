import { EMPTY, GOAL, PLAYER, WALL } from "../config.js";
import { getPredictedPath } from "../game/logic.js";
import { gameState } from "../state.js";

export function renderGrid(gridId) {
  // Init
  const container = document.getElementById(gridId);

  if (!container) return;
  if (!gameState || !gameState.grid) return;

  const predictedPathArray = getPredictedPath();
  const predictedPathSet = new Set(predictedPathArray);

  const isTutorial = gridId === "tuto-grid";
  const cellClass = isTutorial ? "tuto-cell" : "game-cell";

  const totalCells = gameState.SIZE * gameState.SIZE;

  /* -------------------------------------------------
      1. ONLY RUN WHEN GRID SIZE CHANGE
      ------------------------------------------------- */
  if (container.children.length !== totalCells) {
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${gameState.SIZE},1fr)`;

    for (let i = 0; i < totalCells; i++) {
      const cellNode = document.createElement("div");
      cellNode.className = cellClass;
      container.appendChild(cellNode);
    }
  }

  /* -------------------------------------------------
      2. UPDATE LOOP
      ------------------------------------------------- */
  const children = container.children;
  const isRunning = gameState.isRunning;
  const grid = gameState.grid;

  const hiddenLetters = gameState.hiddenLettersMap || {};

  for (let idx = 0; idx < totalCells; idx++) {
    const cellNode = children[idx];
    const cell = grid[idx];

    // Determine current state classes
    const newClasses = [cellClass];

    // Set.has is faster faster than Array.includes inside loop
    if (isTutorial && !isRunning && predictedPathSet.has(idx)) newClasses.push("path-preview");

    // Set cell content and specialized classes
    let content = "";
    if (cell === WALL) {
      newClasses.push("wall");
      content = WALL;
    } else if (idx === gameState.playerIndex) {
      newClasses.push("player");
      content = PLAYER;
    } else if (cell === GOAL) {
      newClasses.push("goal");
      content = GOAL;
    } else if (cell !== EMPTY) {
      newClasses.push("letter");
      content = cell;
    } else if (hiddenLetters[idx]) {
      newClasses.push("letter-locked");
      content = "";
    }

    // Only update the DOM if the content or class has actually changed
    const targetClassName = newClasses.join(" ");
    if (cellNode.textContent !== content) cellNode.textContent = content;
    if (cellNode.className !== targetClassName) cellNode.className = targetClassName;
  }

  updateActiveCommandHighlight(gridId);
}

function updateActiveCommandHighlight(gridId) {
  const isTutorial = gridId === "tuto-grid";
  const queueId = isTutorial ? "tutoCommandQueue" : "gameCommandQueue"; // Matches your config IDs
  const queueContainer = document.getElementById(queueId);

  if (!queueContainer) return;

  const commandElements = queueContainer.children;
  const currentStep = gameState.currentCommandIndex || 0;

  for (let i = 0; i < commandElements.length; i++) {
    if (gameState.isRunning && i === currentStep) {
      commandElements[i].classList.add("command-step-active"); // Soft yellow glowing class
    } else {
      commandElements[i].classList.remove("command-step-active");
    }
  }
}
