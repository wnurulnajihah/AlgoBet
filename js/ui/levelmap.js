import { goToScreen } from "../app/navigation.js";
import { FIXED_LEVELS } from "../game/data.js";
import { gameState } from "../state.js";
import { SoundFX } from "./sound.js";

export function renderLevelMap() {
  const levelMapContainer = document.getElementById("levelMapContainer");
  if (!levelMapContainer) return;
  levelMapContainer.innerHTML = "";

  levelMapContainer.onclick = (event) => {
    // Find if the thing clicked is a level-node or inside one
    const node = event.target.closest(".level-node");

    // If we didn't click a node, or if it's locked, do nothing
    if (!node || node.classList.contains("locked")) return;

    // Get the level number from the text content
    const level = parseInt(node.querySelector(".level-number").textContent);

    SoundFX.playTone(400, "sine", 0.1);
    gameState.currentLevel = level;

    // Navigate based on level
    goToScreen(level === 1 ? "tutorial" : "game");
  };

  // Loop just to render the HTML
  const totalLevels = FIXED_LEVELS.length;

  const savedLevel = parseInt(localStorage.getItem("last_unlocked_level") || "1", 10);

  for (let i = 1; i <= totalLevels; i++) {
    const levelNode = document.createElement("div");

    let statusClass = "locked";
    if (i < savedLevel) {
      statusClass = "completed";
    } else if (i === savedLevel) {
      statusClass = "current";
    }

    levelNode.className = `level-node ${statusClass}`;

    levelNode.innerHTML = `
      <div class="level-number">${i}</div>
      ${i < savedLevel ? '<div class="level-star">🌟🌟🌟</div>' : ""}
    `;

    levelMapContainer.appendChild(levelNode);
  }
}

export function updateLevelBadge() {
  const badgeGame = document.getElementById("gameLevelBadge");
  if (badgeGame) badgeGame.textContent = `LEVEL ${gameState.currentLevel}`;

  const badgeTuto = document.getElementById("tutoLevelBadge");
  if (badgeTuto) badgeTuto.textContent = "LEVEL 1";
}
