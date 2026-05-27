/**
 * Main Application - Initializes canvas, runs game loop, handles events
 * This is the entry point loaded last after all modules are ready.
 *
 * Responsibilities:
 *  1. Canvas setup with DPR-aware sizing for crisp rendering
 *  2. Input event routing (mouse, touch) to the active page
 *  3. Main game loop (update + draw at requestAnimationFrame rate)
 *
 * Coordinate system:
 *  - The canvas internal resolution is scaled by devicePixelRatio for sharpness
 *  - ctx.scale(dpr) is applied, so ALL drawing and hit-testing uses logical pixels
 *    (i.e., window.innerWidth / window.innerHeight)
 *  - Page modules receive a virtual canvas object { width, height } with logical dims
 */
(function () {
  'use strict';

  // --- Canvas Setup ---
  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');
  let lastTime = 0;

  /**
   * Resize the canvas to fill the viewport.
   * Applies devicePixelRatio scaling for crisp rendering on high-DPI screens.
   * Re-initializes the current page to recalculate its layout.
   */
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    // Set actual pixel dimensions (high-res)
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Set CSS display dimensions (logical)
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    // Scale context so we can draw in logical pixels
    ctx.scale(dpr, dpr);

    // Re-init current page so it can recalculate button positions, etc.
    const page = AppState.getPage();
    if (page && page.init) page.init(canvas);
  }

  // Expose logical dimensions as convenience properties on the canvas element.
  // Page modules should use these (or the logicalCanvas object passed to draw)
  // rather than canvas.width/height directly.
  Object.defineProperty(canvas, 'logicalWidth', {
    get() { return window.innerWidth; }
  });
  Object.defineProperty(canvas, 'logicalHeight', {
    get() { return window.innerHeight; }
  });

  // --- Event Listeners ---

  /**
   * Mouse move — update AppState coords and forward to active page for hover detection.
   */
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    AppState.mouseX = e.clientX - rect.left;
    AppState.mouseY = e.clientY - rect.top;

    const page = AppState.getPage();
    if (page && page.onMouseMove) page.onMouseMove(AppState.mouseX, AppState.mouseY);
  });

  /**
   * Mouse click — initialize audio context on first interaction (browser policy),
   * then forward the click to the active page.
   */
  canvas.addEventListener('click', (e) => {
    AudioManager.init();

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const page = AppState.getPage();
    if (page && page.onClick) page.onClick(mx, my);
  });

  /**
   * Touch start — acts as click for mobile devices.
   * Uses { passive: false } to allow preventDefault (avoid scroll/zoom).
   */
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    AudioManager.init();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    AppState.mouseX = mx;
    AppState.mouseY = my;

    const page = AppState.getPage();
    if (page && page.onClick) page.onClick(mx, my);
  }, { passive: false });

  /**
   * Touch move — update hover state on mobile (drag-over buttons).
   */
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    AppState.mouseX = touch.clientX - rect.left;
    AppState.mouseY = touch.clientY - rect.top;

    const page = AppState.getPage();
    if (page && page.onMouseMove) page.onMouseMove(AppState.mouseX, AppState.mouseY);
  }, { passive: false });

  /**
   * Window resize — recalculate canvas dimensions and re-init the active page.
   */
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // --- Game Loop ---

  /**
   * Main render loop called via requestAnimationFrame.
   * Computes delta time, updates AppState.time, and delegates drawing to the active page.
   * @param {DOMHighResTimeStamp} timestamp
   */
  function gameLoop(timestamp) {
    // Delta time in seconds, capped at 100ms to prevent huge jumps (e.g., tab switch)
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    AppState.time += dt;

    // Use logical dimensions for all drawing
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Clear the entire canvas
    ctx.clearRect(0, 0, w, h);

    // Draw the current page only if it's a Canvas page
    const isCanvasPage = ['COVER'].includes(AppState.currentState);
    if (isCanvasPage) {
      const page = AppState.getPage();
      if (page && page.draw) {
        const logicalCanvas = { width: w, height: h };
        page.draw(ctx, logicalCanvas, dt);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  window.Auth = {
    async checkStatus() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (!data.logged_in) {
          document.getElementById('login-overlay').classList.remove('hidden');
        } else {
          document.getElementById('login-overlay').classList.add('hidden');
          if (data.role === 'admin') {
            AppState.setState('ADMIN');
          }
        }
      } catch (e) {
        console.error('Auth error', e);
      }
    },
    async submitLogin() {
      const nama = document.getElementById('login-nama').value;
      const kelas = document.getElementById('login-kelas').value;
      const nis = document.getElementById('login-nis').value;
      const errorDiv = document.getElementById('login-error');
      
      if (!nama || !nis || (!kelas && nis !== 'admin')) {
        errorDiv.style.display = 'block';
        return;
      }
      
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama, kelas, nis })
        });
        const data = await res.json();
        if (data.success) {
          errorDiv.style.display = 'none';
          document.getElementById('login-overlay').classList.add('hidden');
          if (data.role === 'admin') {
            AppState.setState('ADMIN');
          }
        } else {
          errorDiv.innerText = data.error || 'Login gagal';
          errorDiv.style.display = 'block';
        }
      } catch (e) {
        errorDiv.innerText = 'Terjadi kesalahan jaringan';
        errorDiv.style.display = 'block';
      }
    },
    async logout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        // Clear login inputs
        document.getElementById('login-nama').value = '';
        document.getElementById('login-kelas').value = '';
        document.getElementById('login-nis').value = '';
        
        // Reset AppState variables
        AppState.materiSlide = 0;
        AppState.kuisIndex = 0;
        AppState.kuisAnswers = [null, null, null, null, null];
        AppState.kuisScore = null;
        AppState.kuisSubmitted = false;

        // Show overlay again
        document.getElementById('login-overlay').classList.remove('hidden');
        // Hide admin page if it's currently active
        AppState.setState('COVER');
      } catch (e) {
        console.error(e);
      }
    }
  };

  window.Admin = {
    async fetchStats() {
      const tbody = document.getElementById('admin-table-body');
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Memuat data...</td></tr>';
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.stats) {
          if (data.stats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Belum ada data siswa.</td></tr>';
            return;
          }
          let html = '';
          data.stats.forEach(s => {
            html += `<tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${s.nis}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${s.nama}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${s.kelas}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${s.last_page}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${s.last_slide}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${s.best_score} / 5</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${s.updated_at}</td>
            </tr>`;
          });
          tbody.innerHTML = html;
        } else {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Akses ditolak atau error.</td></tr>';
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Terjadi kesalahan jaringan.</td></tr>';
      }
    }
  };

  function init() {
    resizeCanvas();

    // Check authentication first
    window.Auth.checkStatus();

    // Initialize via setState so video and all UI toggles are properly set up
    AppState.setState('COVER');

    requestAnimationFrame(gameLoop);
  }

  // Start the application
  init();

})();

// --- Global Floating Chat Functions ---
window.toggleChatPopup = function() {
  const popup = document.getElementById('floating-chat-popup');
  if (popup) {
    popup.classList.toggle('hidden');
    if (!popup.classList.contains('hidden')) {
      const input = document.getElementById('floating-chat-input');
      if (input) input.focus();
      updateFloatingChatUI();
    }
  }
};

window.sendFloatingChat = function() {
  const input = document.getElementById('floating-chat-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  
  // Use shared chat history from MATERI page
  const chatHistory = (window.Pages && window.Pages.MATERI && window.Pages.MATERI.chatHistory) 
    ? window.Pages.MATERI.chatHistory 
    : [];
    
  chatHistory.push({ role: 'user', content: msg });
  input.value = '';
  
  updateFloatingChatUI();
  // Also update MATERI chat UI if it's currently active
  if (window.Pages && window.Pages.MATERI && window.Pages.MATERI.updateChatHistoryUI) {
    window.Pages.MATERI.updateChatHistoryUI();
  }
  
  const historyDiv = document.getElementById('floating-chat-history');
  if (historyDiv) {
    historyDiv.innerHTML += `
      <div style="align-self: flex-start; background: #e0f2fe; padding: 12px; border-radius: 12px; border-bottom-left-radius: 0; max-width: 80%; color: #0f172a; font-style: italic; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        🤖 SAINTIKA sedang berpikir...
      </div>
    `;
    historyDiv.scrollTop = historyDiv.scrollHeight;
  }
  
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatHistory })
  })
  .then(res => res.json())
  .then(data => {
    if (data.response) {
      chatHistory.push({ role: 'assistant', content: data.response });
      if (window.speakText) window.speakText(data.response);
    } else {
      chatHistory.push({ role: 'assistant', content: "Maaf, terjadi kesalahan: " + (data.error || "Unknown error") });
    }
    updateFloatingChatUI();
    if (window.Pages && window.Pages.MATERI && window.Pages.MATERI.updateChatHistoryUI) {
      window.Pages.MATERI.updateChatHistoryUI();
    }
  })
  .catch(err => {
    chatHistory.push({ role: 'assistant', content: "Maaf, gagal terhubung ke server." });
    updateFloatingChatUI();
    if (window.Pages && window.Pages.MATERI && window.Pages.MATERI.updateChatHistoryUI) {
      window.Pages.MATERI.updateChatHistoryUI();
    }
  });
};

window.updateFloatingChatUI = function() {
  const historyDiv = document.getElementById('floating-chat-history');
  if (!historyDiv) return;
  
  let html = `
    <div style="align-self: flex-start; background: #e0f2fe; padding: 12px; border-radius: 12px; border-bottom-left-radius: 0; max-width: 80%; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.5;">
      <strong>🤖 SAINTIKA:</strong><br/>Halo! Saya SAINTIKA, Tutor Fisika Virtual Anda. Ada yang ingin ditanyakan tentang Fluida Dinamis?
    </div>
  `;
  
  const formatMsg = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  };
  
  const chatHistory = (window.Pages && window.Pages.MATERI && window.Pages.MATERI.chatHistory) 
    ? window.Pages.MATERI.chatHistory 
    : [];
    
  chatHistory.forEach(msg => {
    if (msg.role === 'user') {
      html += `
        <div style="align-self: flex-end; background: #3b82f6; padding: 12px; border-radius: 12px; border-bottom-right-radius: 0; max-width: 80%; color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.5;">
          <strong>Anda:</strong><br/>${formatMsg(msg.content)}
        </div>
      `;
    } else if (msg.role === 'assistant') {
      html += `
        <div style="align-self: flex-start; background: #e0f2fe; padding: 12px; border-radius: 12px; border-bottom-left-radius: 0; max-width: 80%; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.5;">
          <strong>🤖 SAINTIKA:</strong><br/>${formatMsg(msg.content)}
        </div>
      `;
    }
  });
  
  historyDiv.innerHTML = html;
  historyDiv.scrollTop = historyDiv.scrollHeight;
};

// --- Speech Recognition & Synthesis ---
window.useVoiceReply = false;

window.startVoiceRecognition = function(inputId, sendCallback) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Browser Anda tidak mendukung fitur pengenalan suara. Gunakan Google Chrome.");
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'id-ID';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.dataset.originalPlaceholder = inputEl.placeholder;
    inputEl.placeholder = "Mendengarkan... 🎤";
  }
  
  recognition.start();
  
  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    if (inputEl) {
      inputEl.value = speechResult;
      inputEl.placeholder = inputEl.dataset.originalPlaceholder || "Ketik pesan...";
    }
    // Set flag to use voice reply
    window.useVoiceReply = true;
    if (sendCallback) sendCallback();
  };
  
  recognition.onerror = function(event) {
    console.error("Speech recognition error", event.error);
    if (inputEl) inputEl.placeholder = inputEl.dataset.originalPlaceholder || "Ketik pesan...";
  };
  
  recognition.onend = function() {
    if (inputEl && inputEl.placeholder.includes("Mendengarkan")) {
      inputEl.placeholder = inputEl.dataset.originalPlaceholder || "Ketik pesan...";
    }
  };
};

window.speakText = function(text) {
  if (!window.useVoiceReply) return; // Only speak if user used mic
  window.useVoiceReply = false; // reset flag
  
  if (!('speechSynthesis' in window)) return;
  
  // Clean markdown before speaking
  let cleanText = text.replace(/[*_#`]/g, '');
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'id-ID';
  utterance.rate = 1.0;
  utterance.pitch = 1.1; // slightly higher pitch for SAINTIKA
  
  // Try to find an Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang.includes('id'));
  if (idVoice) utterance.voice = idVoice;
  
  window.speechSynthesis.speak(utterance);
};
