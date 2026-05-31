/**
 * State Manager - Manages application state and page transitions
 *
 * Valid states:
 *   COVER       - Halaman sampul / cover page
 *   VIDEO_INTRO - Video pembuka / opening video (after login, before MENU)
 *   MENU        - Menu utama / main menu
 *   PANDUAN     - Panduan penggunaan / usage guide
 *   TUJUAN      - Tujuan pembelajaran / learning objectives
 *   MATERI      - Konten materi / learning content (7 slides, index 0-6)
 *   SIMULASI    - Simulasi interaktif / interactive simulation
 *   VIDEO_KUIS  - Video pembuka kuis / quiz intro video (before KUIS)
 *   KUIS        - Soal evaluasi / quiz questions (5 questions, index 0-4)
 *   KUIS_HASIL  - Hasil kuis / quiz results
 *   REFERENSI   - Daftar pustaka / references
 */
window.AppState = {
  /** @type {string} Current active state */
  currentState: 'COVER',

  /** @type {string|null} Previous state (for back navigation) */
  previousState: null,

  /** @type {number} Current materi slide index (0-6) */
  materiSlide: 0,

  /** @type {number} Current quiz question index (0-4) */
  kuisIndex: 0,

  /** @type {(number|null)[]} Selected answer for each quiz question (null = unanswered) */
  kuisAnswers: [null, null, null, null, null],

  /** @type {number} Quiz score (number of correct answers) */
  kuisScore: 0,

  /** @type {boolean} Whether the quiz has been submitted/graded */
  kuisSubmitted: false,

  /** @type {number} Current mouse X position in logical pixels */
  mouseX: 0,

  /** @type {number} Current mouse Y position in logical pixels */
  mouseY: 0,

  /** @type {number} Accumulated time in seconds (for animations) */
  time: 0,

  /** @type {boolean} Whether a page transition is in progress */
  transitioning: false,

  /** @type {number} Transition fade alpha (0 = transparent, 1 = opaque) */
  transitionAlpha: 0,

  /** @type {string|null} Target state for pending transition */
  transitionTarget: null,

  /**
   * Resets the quiz state to start over
   */
  resetKuis() {
    this.kuisIndex = 0;
    this.kuisAnswers = [null, null, null, null, null];
    this.kuisScore = 0;
    this.kuisSubmitted = false;
  },

  /**
   * Change the application state.
   * Calls cleanup() on the current page and init() on the new page.
   * @param {string} newState - The target state to transition to
   */
  setState(newState) {
    if (this.transitioning) return;
    const oldPage = this.getPage();
    if (oldPage && oldPage.cleanup) oldPage.cleanup();
    
    this.previousState = this.currentState;
    this.currentState = newState;
    
    // Ping progress API
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: newState, slide: this.materiSlide })
    }).catch(e => console.error(e));
    
    // Toggle DOM HTML pages
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(p => p.classList.add('hidden'));
    
    // Determine if new state is a DOM page or Canvas page
    const isCanvasPage = ['COVER'].includes(newState);
    
    // Toggle floating chat button (Show only on MATERI and SIMULASI)
    const floatingBtn = document.getElementById('floating-chat-btn');
    if (floatingBtn) {
      if (newState === 'MATERI' || newState === 'SIMULASI') {
        floatingBtn.classList.remove('hidden');
      } else {
        floatingBtn.classList.add('hidden');
        // Hide popup if navigating away
        const popup = document.getElementById('floating-chat-popup');
        if (popup) popup.classList.add('hidden');
      }
    }

    // Toggle background video (Show only on COVER)
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
      if (newState === 'COVER') {
        bgVideo.classList.add('active');
        bgVideo.play().catch(e => console.log('Video auto-play blocked', e));
      } else {
        bgVideo.classList.remove('active');
        bgVideo.pause();
      }
    }

    // Toggle menu background video (Show only on MENU)
    const menuVideo = document.getElementById('menu-bg-video');
    if (menuVideo) {
      if (newState === 'MENU') {
        menuVideo.classList.add('active');
        menuVideo.play().catch(e => console.log('Video auto-play blocked', e));
      } else {
        menuVideo.classList.remove('active');
        menuVideo.pause();
      }
    }

    // Toggle intro video (Show only on VIDEO_INTRO)
    const introVideo = document.getElementById('intro-video');
    if (introVideo) {
      if (newState === 'VIDEO_INTRO') {
        introVideo.currentTime = 0;
        introVideo.play().catch(e => console.log('Intro video auto-play blocked', e));
        // Reset continue button
        const btnContinue = document.getElementById('btn-continue-video');
        if (btnContinue) btnContinue.classList.remove('visible');
      } else {
        introVideo.pause();
      }
    }

    // Toggle kuis intro video (Show only on VIDEO_KUIS)
    const kuisIntroVideo = document.getElementById('kuis-intro-video');
    if (kuisIntroVideo) {
      if (newState === 'VIDEO_KUIS') {
        kuisIntroVideo.currentTime = 0;
        kuisIntroVideo.play().catch(e => console.log('Kuis intro video auto-play blocked', e));
        const btnContinueKuis = document.getElementById('btn-continue-kuis-video');
        if (btnContinueKuis) btnContinueKuis.classList.remove('visible');
      } else {
        kuisIntroVideo.pause();
      }
    }
    
    if (isCanvasPage) {
      // Show canvas container
      const canvasContainer = document.getElementById('canvas-container');
      if (canvasContainer) canvasContainer.classList.remove('hidden');
      
      const newPage = this.getPage();
      if (newPage && newPage.init) {
        const canvas = document.getElementById('mainCanvas');
        newPage.init(canvas);
      }
    } else {
      // Show DOM HTML page
      const domPage = document.getElementById('page-' + newState);
      if (domPage) {
        domPage.classList.remove('hidden');
        // Call DOM-specific render functions if defined
        if (newState === 'MATERI' && window.Pages.MATERI) window.Pages.MATERI.renderDOM();
        if (newState === 'KUIS' && window.Pages.KUIS) window.Pages.KUIS.renderDOM();
        if (newState === 'KUIS_HASIL' && window.Pages.KUIS_HASIL) window.Pages.KUIS_HASIL.renderDOM();
      }
    }
  },

  /**
   * Get the page module for the current state.
   * Pages are registered on the window.Pages object by each page module.
   * @returns {Object|null} Page module with init/draw/onClick/onMouseMove/cleanup methods
   */
  getPage() {
    if (!window.Pages) return null;

    // Direct mapping — state names match page keys
    const stateMap = {
      'COVER': 'COVER',
      'VIDEO_INTRO': 'VIDEO_INTRO',
      'MENU': 'MENU',
      'PANDUAN': 'PANDUAN',
      'TUJUAN': 'TUJUAN',
      'MATERI': 'MATERI',
      'SIMULASI': 'SIMULASI',
      'VIDEO_KUIS': 'VIDEO_KUIS',
      'KUIS': 'KUIS',
      'KUIS_HASIL': 'KUIS_HASIL',
      'REFERENSI': 'REFERENSI'
    };

    return window.Pages[stateMap[this.currentState]] || null;
  },

  /**
   * Reset all quiz-related state to defaults.
   * Called when starting a new quiz attempt.
   */
  resetKuis() {
    this.kuisIndex = 0;
    this.kuisAnswers = [null, null, null, null, null];
    this.kuisScore = 0;
    this.kuisSubmitted = false;
  },

  /**
   * Reset materi to the first slide.
   * Called when re-entering the materi section.
   */
  resetMateri() {
    this.materiSlide = 0;
  }
};
