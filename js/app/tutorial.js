import { SoundFX } from "../ui/sound.js";
import { updateTutorialHint } from "../ui/wordCards.js";

export const GuidedTutorial = {
  currentStep: 1,
  totalSteps: 3,
  elements: {},

  getElements() {
    return {
      wrapper: document.getElementById("tutorial-instructional-wrapper"),
      wordDisplay: document.getElementById("tutoWordCard")
        ? document.getElementById("tutoWordCard").parentElement
        : null,
      gridBoard: document.getElementById("tuto-grid"),
      commandBar: document.getElementById("tutoCommandSection"),
      actionButtons: document.querySelector(".tuto-controls"),
      runClearButtons: document.querySelector(".tutoRunClearBtn"),
    };
  },

  pathSolutions: {
    1: ["right", "down", "right"],
    2: ["right", "down", "down"],
    3: ["left"],
  },

  steps: {
    1: {
      text: "Tap the highlighted buttons ➡️ ⬇️ ➡️ then tap RUN to execute the queue",
      highlight: ["actionButtons", "commandBar"],
      glow: ["actionButtons", "commandBar"],
      dim: [],
    },

    2: {
      text: "Good job! Next, tap ➡️ ⬇️ ⬇️ ⬇️, then tap RUN!",
      highlight: ["actionButtons", "commandBar"],
      glow: ["actionButtons", "commandBar"],
      dim: [],
    },

    3: {
      text: "Amazing! Let's finish up! Collect 🍯",
      highlight: ["actionButtons", "commandBar"],
      glow: ["actionButtons", "commandBar"],
      dim: [],
    },
  },

  init() {
    this.currentStep = 1;

    const dom = this.getElements();
    if (!dom.wrapper) return;
    dom.wrapper.style.display = "block";

    this.render();
    this.showStep();
  },

  showStep() {
    const dom = this.getElements();
    if (!dom.wrapper) return;
    dom.wrapper.setAttribute("tuto-step", this.currentStep);
    const textEl = document.getElementById("tut-text-content");
    if (textEl) textEl.innerText = this.steps[this.currentStep].text;

    // Apply visual highlight
    this.applyHighlights(this.steps[this.currentStep]);

    // Refresh the word cards so that updateTutorialButtonsState can re-evaluate
    updateTutorialHint();
  },

  applyHighlights(step) {
    // Remove any existing highlight classes
    document
      .querySelectorAll(".tutorial-highlight, .tutorial-glow, .tutorial-dim")
      .forEach((el) => {
        el.classList.remove("tutorial-highlight", "tutorial-glow", "tutorial-dim");
      });

    const dom = this.getElements();
    const addClass = (selector, className) => {
      if (!selector) return;
      selector.forEach((key) => {
        const el = dom[key];
        if (el) el.classList.add(className);
      });
    };

    // Add highlight class to elements
    addClass(step.highlight, "tutorial-highlight");
    addClass(step.glow, "tutorial-glow");
    addClass(step.dim, "tutorial-dim");
  },

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.showStep();
      const dom = this.getElements();
      if (dom.wrapper) dom.wrapper.style.display = "block";
      SoundFX.playTone(600, "sine", 0.05);
    } else {
      this.finish();
    }
  },

  resetVisualGlows() {
    const allButtons = document.querySelectorAll("[id$='Tuto']");
    for (const btn of allButtons) {
      btn.classList.remove("glow-active-btn", "glow-run-ready");
    }
  },

  finish() {
    const dom = this.getElements();
    if (dom.wrapper) dom.wrapper.style.display = "none";
    updateTutorialHint();
    localStorage.setItem("tutorial_completed", "true");
    this.resetVisualGlows();
  },

  render() {
    const dom = this.getElements();
    if (!dom.wrapper) return;

    dom.wrapper.innerHTML = `
            <div class="tutorial-instruction-box">
              <p id="tut-text-content" style="margin: 0 0 10px 0;"></p>
            </div>
          `;
  },
};
