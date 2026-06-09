export const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playTone(freq, type, duration, delay = 0) {
    try {
      this.init();
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + delay + duration,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.log(e);
    }
  },
  playClick() {
    this.playTone(600, "sine", 0.08);
  },
  playCollect() {
    this.playTone(523.25, "triangle", 0.1, 0);
    this.playTone(659.25, "triangle", 0.1, 0.05);
    this.playTone(783.99, "triangle", 0.15, 0.1);
  },
  playVictory() {
    this.playTone(523.25, "triangle", 0.12, 0);
    this.playTone(659.25, "triangle", 0.12, 0.08);
    this.playTone(783.99, "triangle", 0.12, 0.16);
    this.playTone(1046.5, "sine", 0.35, 0.24);
  },
  playFail() {
    this.playTone(130, "sawtooth", 0.25);
  },
};
