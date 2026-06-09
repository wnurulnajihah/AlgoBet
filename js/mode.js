import { currentMode } from "./state.js";
import { updateHint, updateTutorialHint } from "./ui/wordCards.js";

export const MODE_CONFIG = {
  game: {
    gridId: "game-grid",
    queueId: "gameCommandQueue",
    updateHint: () => updateHint("game"),
    suffix: "",
  },

  tuto: {
    gridId: "tuto-grid",
    queueId: "tutoCommandQueue",
    updateHint: () => updateTutorialHint("tutorial"),
    suffix: "Tuto",
  },
};

export function getActiveConfig() {
  return MODE_CONFIG[currentMode];
}
