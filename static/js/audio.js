/**
 * AudioManager - Programmatic sound generation using Web Audio API
 * All sounds are synthesized at runtime — no external audio files needed.
 * Includes click, hover, correct/wrong feedback, and ambient BGM.
 */
window.AudioManager = {
  /** @type {AudioContext|null} Web Audio API context */
  ctx: null,

  /** @type {boolean} Global mute flag */
  isMuted: false,

  /** @type {OscillatorNode[]|null} BGM oscillator references for cleanup */
  bgmOsc: null,

  /** @type {GainNode|null} BGM master gain for fade in/out */
  bgmGain: null,

  /** @type {boolean} Whether BGM is currently playing */
  bgmPlaying: false,

  /**
   * Initialize the AudioContext.
   * Must be called on first user interaction (click/touch) due to browser autoplay policy.
   */
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (common after tab switch or initial load)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  /**
   * Play a short click sound — subtle, high-pitched tick.
   * Used for button presses and navigation actions.
   */
  playClick() {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);
  },

  /**
   * Play a very subtle hover sound.
   * Used when the cursor enters a button's hit area.
   */
  playHover() {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.08);
  },

  /**
   * Play a correct answer sound — ascending C-E-G arpeggio (major triad).
   * Pleasant and rewarding feedback for quiz correct answers.
   */
  playCorrect() {
    if (this.isMuted || !this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.3);

      osc.start(this.ctx.currentTime + i * 0.12);
      osc.stop(this.ctx.currentTime + i * 0.12 + 0.3);
    });
  },

  /**
   * Play a wrong answer sound — descending square-wave buzzer.
   * Distinct but not harsh feedback for incorrect quiz answers.
   */
  playWrong() {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.4);
  },

  /**
   * Start ambient background music — a gentle pad drone.
   * Uses two slightly detuned sine oscillators through a low-pass filter
   * for a warm, non-distracting atmosphere. Fades  // Play ambient background music (disabled per user feedback)
   */
  playBgm() {
    // Disabled to remove the humming sound ('suara ngung')
  },

  /**
   * Stop background music with a 1-second fade out.
   * Cleans up oscillator nodes after fade completes.
   */
  stopBgm() {
    if (!this.bgmPlaying || !this.bgmGain) return;

    try {
      this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

      // Clean up oscillators after fade-out completes
      setTimeout(() => {
        if (this.bgmOsc) {
          this.bgmOsc.forEach(o => {
            try { o.stop(); } catch (e) { /* already stopped */ }
          });
          this.bgmOsc = null;
        }
        this.bgmPlaying = false;
      }, 1100);
    } catch (e) {
      this.bgmPlaying = false;
    }
  },

  /**
   * Toggle global mute on/off.
   * When muted, stops any playing BGM immediately.
   * @returns {boolean} The new muted state (true = muted)
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopBgm();
    return this.isMuted;
  }
};
