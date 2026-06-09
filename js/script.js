import { initEventListeners } from "./app/init.js";
import { goToScreen } from "./app/navigation.js";

/* ===================================
            MAIN FUNCTION
   =================================== */
window.addEventListener("load", () => {
  initEventListeners();
  goToScreen("menu");
});
