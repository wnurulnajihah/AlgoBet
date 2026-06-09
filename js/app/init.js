import { FIXED_LEVELS } from "../game/data.js";
import { addCommands, clearQueue, runCommands, undoCommand } from "../game/logic.js";
import { showFeedbackModal } from "../game/modal.js";
import { setLevelLayout } from "../game/setup.js";
import { MODE_CONFIG } from "../mode.js";
import { gameState, setMode, switchToGameMode } from "../state.js";
import { metricsLog } from "./metrics.js";
import { goToScreen } from "./navigation.js";

/* ===================================
              HELPERS
   =================================== */

/**
 * @param {string} elementId * @param {*} callback
 */
function setupControl(elementId, callback) {
  const el = document.getElementById(elementId);
  if (el) el.addEventListener("click", callback);
}

export function updateMenuUI() {
  const btnStart = document.getElementById("btnStart");
  const btnMap = document.getElementById("btnMap");
  const btnRateApp = document.getElementById("btnRateApp");
  if (!btnStart) return;

  const savedLevel = localStorage.getItem("last_unlocked_level");
  const hasCompletedTutorial = localStorage.getItem("tutorial_completed") === "true";

  if (!hasCompletedTutorial) {
    if (btnStart) btnStart.textContent = "NEW GAME";
    if (btnMap) btnMap.style.display = "none";
    if (btnRateApp) btnRateApp.style.display = "none";
    return;
  }

  // Default case if the condition never met
  const totalLeveles = FIXED_LEVELS.length;
  let lastUnlockedLevel = parseInt(savedLevel || "1", 10);
  if (lastUnlockedLevel > totalLeveles) lastUnlockedLevel = totalLeveles;
  btnStart.textContent = `LEVEL ${lastUnlockedLevel}`;
  if (btnMap) btnMap.style.display = "block";
}

export function startGameHandler() {
  const savedLevel = localStorage.getItem("last_unlocked_level");
  const hasCompletedTutorial = localStorage.getItem("tutorial_completed") === "true";

  if (!hasCompletedTutorial) {
    setMode("tuto");
    gameState.currentLevel = 1;
    gameState.maxUnlockedLevel = 1;
    setLevelLayout(1, "tuto");
    goToScreen("tutorial");
    return;
  }

  if (hasCompletedTutorial && gameState.currentLevel === 1) {
    setLevelLayout(1, "tuto");
    goToScreen("tutorial");
    return;
  }

  // Default case if the conditions never met
  switchToGameMode();
  const lastUnlockedLevel = parseInt(savedLevel || "1", 10);
  gameState.currentLevel = lastUnlockedLevel;
  gameState.maxUnlockedLevel = lastUnlockedLevel;
  setLevelLayout(lastUnlockedLevel, "game");
  goToScreen("game");
}

export function setControlsEnabled(enabled, mode) {
  const activeScreen = document.querySelector(".screen.active");
  const expectedScreen = mode === "game" ? "game" : "tutorial";
  if (!activeScreen || !activeScreen.id.includes(expectedScreen)) return;

  const buttons = [
    "btnUp",
    "btnDown",
    "btnLeft",
    "btnRight",
    "btnRun",
    "btnUndo",
    "btnClear",
    "btnTopBack",
  ];

  const suffix = MODE_CONFIG[mode]?.suffix ?? "";

  for (const id of buttons) {
    const elementId = id === "btnTopBack" ? "btnTopBack" : `${id}${suffix}`;
    const btn = document.getElementById(elementId);
    if (btn) btn.disabled = !enabled;
  }
}

export function setTutorialOverlayVisibility(visible) {
  const overlay = document.getElementById("tutorial-overlay");
  if (overlay) overlay.style.display = visible ? "flex" : "none";
}

/* ===================================
      Initialize event listeners
   =================================== */
export function initEventListeners() {
  // Panggil satu fungsi ini sahaja
  metricsLog.checkAndLogNewPlayer();

  const hasCompletedTutorial = localStorage.getItem("tutorial_completed") === "true";

  /* ---- MENU BUTTONS ---- */
  const btnStart = document.getElementById("btnStart");
  if (btnStart) btnStart.addEventListener("click", startGameHandler);

  const btnMap = document.getElementById("btnMap");
  if (btnMap) {
    btnMap.addEventListener("click", () => goToScreen("levelmap"));
  }

  const btnRateApp = document.getElementById("btnRateApp");
  if (btnRateApp) {
    btnRateApp.addEventListener("click", () => showFeedbackModal());
  }

  const btnCloseFeedback = document.getElementById("btnCloseFeedback");
  if (btnCloseFeedback) {
    btnCloseFeedback.addEventListener("click", () => {
      const activeScreen = document.querySelector(".screen.active");
      if (!activeScreen) return;
      const currentScreenId = activeScreen.id.replace("screen-", "");

      // Tukar id ini kepada 'feedback-overlay'
      // (mengikut id yang anda letak dalam index.html)
      const feedbackOverlay = document.getElementById("feedback-overlay");
      const focusOverlay = document.getElementById("focusOverlay");

      if (currentScreenId === "menu") {
        feedbackOverlay.style.display = "none";
        focusOverlay.style.display = "none";
      } else {
        goToScreen("menu");
      }
    });
  }

  /* ---- BACK BUTTON ---- */
  const btnTopBack = document.getElementById("btnTopBack");

  if (btnTopBack) {
    btnTopBack.addEventListener("click", () => {
      if (gameState.isRunning) return;

      const activeScreen = document.querySelector(".screen.active");
      if (!activeScreen) return;
      const currentScreenId = activeScreen.id.replace("screen-", "");

      gameState.queue = [];

      if (currentScreenId === "game") {
        goToScreen("levelmap");
      } else if (
        (hasCompletedTutorial && currentScreenId === "tutorial") ||
        (!hasCompletedTutorial && currentScreenId === "tutorial")
      ) {
        goToScreen("menu");
      } else if (currentScreenId === "levelmap") {
        goToScreen("menu");
      }
    });
  }

  /* ---- CONTROL FOR GAME AND TUTORIAL MODE ---- */
  for (const [mode, config] of Object.entries(MODE_CONFIG)) {
    const suffixId = config.suffix;

    setupControl(`btnUp${suffixId}`, () => {
      addCommands("up", mode);
      metricsLog.trackAction(mode, "ADD_COMMAND");
    });

    setupControl(`btnDown${suffixId}`, () => {
      addCommands("down", mode);
      metricsLog.trackAction(mode, "ADD_COMMAND");
    });

    setupControl(`btnLeft${suffixId}`, () => {
      addCommands("left", mode);
      metricsLog.trackAction(mode, "ADD_COMMAND");
    });

    setupControl(`btnRight${suffixId}`, () => {
      addCommands("right", mode);
      metricsLog.trackAction(mode, "ADD_COMMAND");
    });

    setupControl(`btnRun${suffixId}`, () => {
      runCommands(mode);
      metricsLog.trackAction(mode, "RUN_QUEUE");
    });

    setupControl(`btnUndo${suffixId}`, () => {
      undoCommand(mode);
      metricsLog.trackAction(mode, "REMOVE_COMMAND");
    });

    setupControl(`btnClear${suffixId}`, () => {
      clearQueue(mode);
      metricsLog.trackAction(mode, "CLEAR_QUEUE");
    });
  }

  /* ---- OVERLAY ---- */
  const overlay = document.getElementById("victoryOverlay");
  if (overlay) overlay.style.display = "none";
}
