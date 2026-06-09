import { setControlsEnabled } from "../app/init.js";
import { metricsLog } from "../app/metrics.js";
import { goToScreen } from "../app/navigation.js";
import { PLAYER } from "../config.js";
import { gameState } from "../state.js";
import { burstStarAnim } from "../ui/anim.js";
import { renderGrid } from "../ui/gridRenderer.js";
import { SoundFX } from "../ui/sound.js";
import { setLevelLayout } from "./setup.js";

export function showTutorialCompleteModal() {
  const overlay = document.getElementById("focusOverlay");
  if (!overlay) return;
  overlay.style.display = "block";

  const backBtn = document.getElementById("btnTopBack");
  if (backBtn) backBtn.style.display = "none";

  const existingModal = document.getElementById("victory-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "victory-modal";
  modal.className = "modal-overlay victory-modal";

  modal.innerHTML = `
    <h2>🎉 Tutorial Complete!</h2>
    <p>You're ready to play!</p>
    <div class="button-group">
      <button id="startGameBtn" class="start-btn">START CHALLENGE</button>
    </div>
  `;

  document.body.appendChild(modal);

  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) {
    startBtn.onclick = () => {
      overlay.style.display = "none";
      modal.remove();
      gameState.currentLevel = 1;
      setLevelLayout(1, "game");
      goToScreen("game");
    };
  }
}

export function showVictoryModal() {
  const overlay = document.getElementById("focusOverlay");
  if (!overlay) return;
  overlay.style.display = "block";

  const backBtn = document.getElementById("btnTopBack");
  if (backBtn) backBtn.style.display = "none";

  const existingModal = document.getElementById("victory-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "victory-modal";
  modal.className = "modal-overlay victory-modal";

  const levelNum = gameState.currentLevel + 1;

  modal.innerHTML = `
    <h2>🎉 Level Complete!</h2>
    <p>Great job!</p>
    <div class="button-group">
      <button id="nextLevelBtn" class="next-btn">LEVEL ${levelNum}</button>
      <button id="levelMapBtn" class="map-btn">🗺️ Level Map</button>
    </div>`;

  document.body.appendChild(modal);

  const nextBtn = document.getElementById("nextLevelBtn");
  const mapBtn = document.getElementById("levelMapBtn");

  if (nextBtn) {
    nextBtn.onclick = () => {
      overlay.style.display = "none";
      modal.remove();

      const nextLevel = gameState.currentLevel + 1;
      localStorage.setItem("last_unlocked_level", nextLevel.toString());

      if (nextLevel <= gameState.maxUnlockedLevel) {
        gameState.currentLevel = nextLevel;
        setLevelLayout(nextLevel, "game");
        goToScreen("game");
        if (backBtn) backBtn.style.display = "flex";
      } else {
        goToScreen("game");
        if (backBtn) backBtn.style.display = "flex";
      }
    };
  }

  if (mapBtn) {
    mapBtn.onclick = () => {
      overlay.style.display = "none";
      modal.remove();
      goToScreen("levelmap");
      if (backBtn) backBtn.style.display = "flex";
    };
  }
}

export function handleVictory(mode) {
  gameState.isRunning = false;
  gameState.grid[gameState.playerIndex] = PLAYER;
  renderGrid(mode === "game" ? "game-grid" : "tuto-grid");

  setControlsEnabled(true, mode);
  burstStarAnim();
  SoundFX.playVictory();

  metricsLog.trackAction(mode === "game" ? "level" : "tuto", "LEVEL_COMPLETED");

  if (mode === "game") {
    if (gameState.currentLevel === gameState.maxUnlockedLevel) {
      gameState.maxUnlockedLevel++;
      localStorage.setItem("last_unlocked_level", gameState.maxUnlockedLevel.toString());
    }

    const isMaxLevel = gameState.currentLevel >= 3;
    if (isMaxLevel) {
      setTimeout(showFeedbackModal, 1000);
    } else {
      setTimeout(showVictoryModal, 500);
    }
  } else {
    localStorage.setItem("tutorial_completed", "true");
    localStorage.setItem("last_unlocked_level", "1");
    gameState.maxUnlockedLevel = 1;
    gameState.currentLevel = 1;
    setTimeout(showTutorialCompleteModal, 500);
  }
}

export function showFeedbackModal() {
  const overlay = document.getElementById("focusOverlay");
  if (!overlay) return;
  overlay.style.display = "block";

  const existingModal = document.getElementById("feedback-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "feedback-modal";
  modal.className = "feedback-dynamic-modal";

  modal.innerHTML = `
    <button type="button" id="btnCloseFeedback" class="close-btn">&times;</button>
    
    <div class="feedback-content">
      <h2 style="font-size: 1.8rem; margin-bottom: 5px;">🎉 Congratulations!</h2>
      <p style="color: #666; margin-bottom: 20px;">Thank you for playing AlgoBet. We would love to hear your feedback.</p>
      <form id="feedbackForm">
        ${[
          "Was the game easy to understand?",
          "Were the buttons and controls easy to use?",
          "Was the game fun to play?",
          "Did you enjoy the challenges in the game?",
          "Did the game make you think before making a move?",
          "Did the game help you plan your moves?",
          "Did you like the colours and graphics?",
          "Was the game screen easy to understand?",
          "Would you like to play AlgoBet again?",
          "Overall, how much do you like AlgoBet?",
        ]
          .map(
            (q, i) => `
        <div class="rating-group" style="margin-bottom: 18px; text-align: left;">
          <label style="font-weight: bold; display: block; margin-bottom: 8px; color: #333;">${i + 1}. ${q}</label>
          <div class="stars" style="display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 10px;">
            ${[5, 4, 3, 2, 1]
              .map(
                (val) => `
              <input type="radio" name="q${i + 1}" value="${val}" id="q${i + 1}-${val}" required style="position: absolute; opacity: 0; width: 0; height: 0;">
              <label for="q${i + 1}-${val}" class="emoji-star" style="font-size: 1.8rem; cursor: pointer; transition: transform 0.1s;">
                ${val === 5 ? "😍" : val === 4 ? "😄" : val === 3 ? "🙂" : val === 2 ? "😐" : "😞"}
              </label>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
          )
          .join("")}
        
        <textarea name="likedMost" placeholder="What did you like most about the game? (optional)" style="width:100%; padding:10px; border-radius:10px; border:2px solid #ccc; font-family:inherit; min-height:70px; margin-bottom:10px; box-sizing:border-box;"></textarea>
        <textarea name="makeBetter" placeholder="What would make the game even better? (optional)" style="width:100%; padding:10px; border-radius:10px; border:2px solid #ccc; font-family:inherit; min-height:70px; margin-bottom:15px; box-sizing:border-box;"></textarea>
        
        <button type="submit" class="submit-btn" style="width:100%; background:#4CAF50; color:white; padding:12px; border:none; border-radius:50px; font-weight:bold; font-size:1.1rem; cursor:pointer; box-shadow:0 4px 0 #388E3C;">Submit Feedback</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // PEMBETULAN: Menukar .onsubmit kepada .onclick untuk butang pangkah biasa
  document.getElementById("btnCloseFeedback").onclick = () => {
    modal.remove();
    overlay.style.display = "none";
  };

  // === GANTIKAN BLOK CSS INI DI DALAM modal.js ===
  // Suntik gaya interaksi CSS emoji (Kelabu asal, berwarna bila dipilih)
  if (!document.getElementById("emoji-feedback-css")) {
    const style = document.createElement("style");
    style.id = "emoji-feedback-css";
    style.innerHTML = `
      /* 1. Semua emoji asal berwarna kelabu & pudar */
      .emoji-star { 
        filter: grayscale(1); 
        opacity: 0.4; 
        transition: transform 0.2s, filter 0.2s, opacity 0.2s; 
      }

      /* 2. Hover effect */
      .emoji-star:hover { 
        transform: scale(1.2); 
        opacity: 0.8;
        filter: grayscale(0.5);
      }

      /* 3. Hanya emoji yang radio buttonnya kena CHECKED sahaja akan menyala warna penuh */
      .stars input:checked + label { 
        filter: grayscale(0) !important; 
        opacity: 1 !important; 
        transform: scale(1.3); 
      }
    `;
    document.head.appendChild(style);
  }

  // LOGIK BAHARU: Membolehkan unselect semula emoji (Grayscale balik bila klik kali kedua)
  modal.querySelectorAll('.stars input[type="radio"]').forEach((radio) => {
    // Kita guna mousedown/click untuk simpan status asal sebelum input berubah
    radio.addEventListener("click", function () {
      if (this.wasChecked) {
        this.checked = false;
        this.wasChecked = false;
        console.log(
          `[Feedback UI] Pilihan untuk ${this.name} dibatalkan (Unselect). Grayscale semula.`,
        );
      } else {
        // Reset semua radio dalam kumpulan yang sama dulu
        modal.querySelectorAll(`input[name="${this.name}"]`).forEach((r) => {
          r.wasChecked = false;
        });
        // Tandakan radio ini sebagai sedang dipilih
        this.wasChecked = true;
      }
    });
  });

  // PEMBETULAN UTAMA: Menggunakan addEventListener("submit") supaya emoji & text-area boleh berfungsi
  const form = document.getElementById("feedbackForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("[Feedback UI] Mengutip maklum balas daripada borang...");

    const submitBtn = form.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Processing...";

    const formData = new FormData(form);
    const ratings = [];
    for (let i = 1; i <= 10; i++) {
      ratings.push(parseInt(formData.get(`q${i}`)) || 0);
    }

    const likedMost = formData.get("likedMost") || "";
    const makeBetter = formData.get("makeBetter") || "";

    // DIHUBUNGKAN: Menghantar data ke fungsi pusat di metrics.js untuk simulasi log pangkalan data
    metricsLog.logFeedbackToConsole(ratings, likedMost, makeBetter);

    alert("Simulated: Thank you for your feedback! Check your web console. 🎉");

    modal.remove();
    overlay.style.display = "none";
    goToScreen("menu");
  });
}
