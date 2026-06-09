import { gameState } from "../state.js";

// Digantikan dengan nilai kosong kerana kita hanya fokus kepada console.log buat masa ini
export const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwwo3egNytVaR2bZSNfwqN-mHTS1WoWLSripYqWmUMXXr8G41DzZy_f7yuyRkvweeBw/exec";

export const metricsLog = {
  levelStartTime: null,
  firstActionDone: false,
  lastKnownQueue: [],

  currentLevelMetrics: {
    runCount: 0,
    clearCount: 0,
    cmdAddCount: 0,
    cmdRemoveCount: 0,
    totalErrors: 0,
  },

  isNewPlayer() {
    const hasId = !!localStorage.getItem("research_player_id");
    const hasFinishedTuto = localStorage.getItem("tutorial_completed") === "true";
    return !hasId || !hasFinishedTuto;
  },

  checkAndLogNewPlayer() {
    let playerId = localStorage.getItem("research_player_id");

    if (!playerId) {
      let count = parseInt(localStorage.getItem("player_counter") || "0", 10);
      count += 1;

      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        playerId = crypto.randomUUID();
      } else {
        const randomHex = Math.floor(Math.random() * 0x1000000).toString(16);
        playerId = `Player_${count}_${randomHex}`;
      }

      localStorage.setItem("research_player_id", playerId);
      localStorage.setItem("player_counter", count.toString());
      console.log("[LocalStorage] ID Pemain Baharu Dicipta:", playerId);
    } else {
      console.log("[LocalStorage] ID Pemain Sedia Ada Ditemui:", playerId);
    }
  },

  startLevelTimer() {
    const sekarang = performance.now();

    // Saringan: Jika timer pernah dimulakan kurang dari 1 saat (1000ms) yang lalu, abaikan panggilan bertindih ini.
    if (this.levelStartTime && sekarang - this.levelStartTime < 1000) {
      return;
    }

    this.levelStartTime = sekarang;
    this.firstActionDone = false;
    this.lastKnownQueue = [];
    this.currentLevelMetrics = {
      runCount: 0,
      clearCount: 0,
      cmdAddCount: 0,
      cmdRemoveCount: 0,
      totalErrors: 0,
    };
    console.log("[Gameplay] Timer dimulakan untuk level baru.");
  },

  updateBehaviorCounter(eventType) {
    if (eventType === "RUN_QUEUE") this.currentLevelMetrics.runCount++;
    if (eventType === "CLEAR_QUEUE") this.currentLevelMetrics.clearCount++;
    if (eventType === "ADD_COMMAND") this.currentLevelMetrics.cmdAddCount++;
    if (eventType === "REMOVE_COMMAND") this.currentLevelMetrics.cmdRemoveCount++;
    if (eventType === "GAME_ERROR" || eventType === "WRONG_MOVE")
      this.currentLevelMetrics.totalErrors++;
  },

  /**
   * 1. SIMULASI LOG PRESTASI GAMEPLAY (Console Log sahaja - Tiada API)
   */
  logGameplayToConsole(mode) {
    const summary = this.getAcademicSummary();
    const currentTime = performance.now();
    const timeSpentSeconds = this.levelStartTime
      ? ((currentTime - this.levelStartTime) / 1000).toFixed(2)
      : 0;

    const payload = {
      player_id: localStorage.getItem("research_player_id") || "UNKNOWN_PLAYER",
      mode: mode,
      level: gameState.currentLevel,
      total_time_seconds: parseFloat(timeSpentSeconds),
      academic_summary: summary,
    };

    console.log("==================================================");
    console.log("[DATA GAMEPLAY READY] Format untuk disimpan ke GameplaySheet:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==================================================");

    if (WEB_APP_URL !== "") {
      fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("[Google Sheets] Data gameplay berjaya disimpan:", data);
        })
        .catch((error) => {
          console.error("[Google Sheets] Ralat semasa menyimpan data gameplay:", error);
        });
    }
  },

  /**
   * 2. SIMULASI LOG MAKLUM BALAS / FEEDBACK (Console Log sahaja - Tiada API)
   * Fungsi ini sedia dipanggil dari modal.js
   */
  logFeedbackToConsole(ratings, likedMost, makeBetter) {
    const payload = {
      type: "feedback",
      player_id: localStorage.getItem("research_player_id") || "UNKNOWN_PLAYER",
      ratings: ratings,
      likedMost: likedMost,
      makeBetter: makeBetter,
    };

    console.log("==================================================");
    console.log("[DATA FEEDBACK READY] Format untuk disimpan ke FeedbackSheet:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==================================================");

    if (WEB_APP_URL !== "") {
      fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("[Google Sheets] Data feedback berjaya disimpan:", data);
        })
        .catch((error) => {
          console.error("[Google Sheets] Ralat semasa menyimpan data feedback:", error);
        });
    }
  },

  trackAction(mode, eventType, details = {}) {
    const currentTime = performance.now();
    const timeSpentSeconds = this.levelStartTime
      ? ((currentTime - this.levelStartTime) / 1000).toFixed(2)
      : 0;

    let thinkingTime = null;
    if (!this.firstActionDone && this.levelStartTime) {
      thinkingTime = timeSpentSeconds;
      this.firstActionDone = true;
    }

    this.updateBehaviorCounter(eventType);

    if (gameState.queue && gameState.queue.length > 0) {
      this.lastKnownQueue = [...gameState.queue];
    }

    const queueToLog =
      eventType === "LEVEL_COMPLETED" || eventType === "EXECUTION_FINISHED_PARTIAL"
        ? [...this.lastKnownQueue]
        : [...gameState.queue];

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: mode === "tuto" ? "Tutorial" : `Level ${gameState.currentLevel}`,
      mode: mode,
      eventType: eventType,
      timeSpentSeconds: parseFloat(timeSpentSeconds),
      currentQueue: queueToLog,
      ...details,
    };

    if (thinkingTime !== null) {
      logEntry.thinkingTimeSeconds = parseFloat(thinkingTime);
    }

    if (eventType === "LEVEL_COMPLETED") {
      logEntry.levelSummary = {
        totalTimeSpent: parseFloat(timeSpentSeconds),
        totalRuns: this.currentLevelMetrics.runCount,
        totalClears: this.currentLevelMetrics.clearCount,
        totalUndos: this.currentLevelMetrics.cmdRemoveCount,
        cmdsAdded: this.currentLevelMetrics.cmdAddCount,
        executionErrors: this.currentLevelMetrics.totalErrors,
      };

      // Papar log gameplay dalam konsol sebaik sahaja level tamat
      this.logGameplayToConsole(mode);
    }
  },

  getAcademicSummary() {
    return {
      run_attempts: this.currentLevelMetrics.runCount,
      clear_attempts: this.currentLevelMetrics.clearCount,
      commands_added: this.currentLevelMetrics.cmdAddCount,
      commands_removed: this.currentLevelMetrics.cmdRemoveCount,
      total_errors: this.currentLevelMetrics.totalErrors,
      error_ratio:
        this.currentLevelMetrics.runCount > 0
          ? parseFloat(
              (this.currentLevelMetrics.totalErrors / this.currentLevelMetrics.runCount).toFixed(2),
            )
          : 0,
    };
  },
};
