import { setLevelLayout } from "../game/setup.js";
import { gameState } from "../state.js";
import { renderLevelMap } from "../ui/levelmap.js";
import { updateMenuUI } from "./init.js";
import { GuidedTutorial } from "./tutorial.js";

/**@param {string} screenId */
export function goToScreen(screenId) {
  // Hide all screen
  const hideAllScreens = () => {
    const screen = document.querySelectorAll(".screen");
    for (const s of screen) {
      s.classList.remove("active");
      s.style.display = "none";
    }
  };

  // Show screen
  const showScreen = (id) => {
    const targetScreen = document.getElementById(`screen-${id}`);
    if (targetScreen) {
      targetScreen.classList.add("active");
      targetScreen.style.display = "block";
    }
  };

  // Show top
  const setConsoleTopVisibility = () => {
    const consoleTop = document.getElementById("consoleTop");
    if (consoleTop) {
      consoleTop.style.display = screenId === "menu" ? "none" : "block";
    }
  };

  // Show top back button
  const btnTopBack = document.getElementById("btnTopBack");
  if (btnTopBack) {
    if (screenId === "menu") {
      btnTopBack.style.display = "none"; // Sorok kat menu
    } else {
      btnTopBack.style.display = "flex"; // Muncul kat screen lain (game/tutorial/map)
    }
  }

  const screenAction = {
    menu: () => updateMenuUI(),

    levelmap: () => renderLevelMap(),

    game: () => {
      setLevelLayout(gameState.currentLevel, "game");
    },

    tutorial: () => {
      setLevelLayout(1, "tuto");
      GuidedTutorial.init();
    },
  };

  /* ============== RUN ==============*/
  hideAllScreens();
  showScreen(screenId);
  setConsoleTopVisibility();
  if (screenAction[screenId]) screenAction[screenId]();
}
