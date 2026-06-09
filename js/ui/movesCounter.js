import { gameState } from "../state.js";

export function updateMovesCounter() {
  const counterEl = document.getElementById("movesCounter");
  if (!counterEl) return;
  counterEl.textContent = `Moves: ${gameState.movesUsed}`;
}
