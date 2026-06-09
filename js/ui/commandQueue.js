import { ARROW_SYMBOLS } from "../config.js";
import { gameState } from "../state.js";

export function updateCommandQueue(containerElement) {
  if (!containerElement) return;

  const fragment = document.createDocumentFragment();

  for (const dir of gameState.queue) {
    const item = document.createElement("div");
    item.className = "command-item";
    item.setAttribute("data-dir", dir);

    item.style.backgroundColor = `var(--color-cmd-${dir})`;

    item.textContent = ARROW_SYMBOLS[dir];

    fragment.appendChild(item);
  }

  containerElement.innerHTML = "";
  containerElement.appendChild(fragment);
}
