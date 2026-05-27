window.Pages = window.Pages || {};
window.Pages.MATERI = {
  slides: [
    {
      title: 'Pendahuluan Fluida Dinamis',
      blocks: [
        { type: 'text', value: 'Fluida dinamis adalah fluida (bisa cair atau gas) yang bergerak atau mengalir. Dalam fisika dasar, kita sering mengasumsikan fluida ini ideal agar lebih mudah dipelajari.' },
        { type: 'heading', value: 'Sifat Fluida Ideal:' },
        { type: 'list', items: [
          'Tidak kompresibel (volume/massa jenis tetap)',
          'Tidak kental (non-viscous), tidak ada gesekan',
          'Alirannya stasioner (steady), kecepatan di suatu titik konstan',
          'Alirannya irrotasional (tidak ada pusaran)'
        ]}
      ]
    },
    {
      title: 'Konsep Debit (Q)',
      blocks: [
        { type: 'text', value: 'Debit aliran adalah besaran yang menyatakan volume fluida yang mengalir melalui suatu penampang dalam satuan waktu tertentu.' },
        { type: 'heading', value: 'Persamaan Debit:' },
        { type: 'formula', value: 'Q = V / t    atau    Q = A × v' },
        { type: 'list', items: [
          'Q = Debit aliran (m³/s)',
          'V = Volume fluida (m³)',
          't = Waktu (s)',
          'A = Luas penampang (m²)',
          'v = Kecepatan aliran (m/s)'
        ]}
      ]
    },
    {
      title: 'Asas Kontinuitas',
      blocks: [
        { type: 'text', value: 'Asas kontinuitas menyatakan bahwa untuk fluida tak kompresibel yang mengalir dalam pipa, laju aliran volume (debit) di setiap titik adalah sama.' },
        { type: 'formula', value: 'Q₁ = Q₂' },
        { type: 'formula', value: 'A₁ × v₁ = A₂ × v₂' },
        { type: 'heading', value: 'Kesimpulan:' },
        { type: 'text', value: 'Kecepatan aliran fluida berbanding terbalik dengan luas penampang. Jika pipa menyempit, aliran akan semakin cepat.' }
      ]
    },
    {
      title: 'Hukum Bernoulli',
      blocks: [
        { type: 'text', value: 'Hukum Bernoulli berhubungan dengan kekekalan energi mekanik dalam fluida. Hukum ini menyatakan bahwa jumlah dari tekanan, energi kinetik per satuan volume, dan energi potensial per satuan volume memiliki nilai yang konstan.' },
        { type: 'heading', value: 'Persamaan Bernoulli:' },
        { type: 'formula', value: 'P + ½ρv² + ρgh = Konstan' },
        { type: 'list', items: [
          'P = Tekanan (Pa)',
          'ρ = Massa jenis fluida (kg/m³)',
          'v = Kecepatan aliran (m/s)',
          'g = Percepatan gravitasi (m/s²)',
          'h = Ketinggian (m)'
        ]}
      ]
    },
    {
      title: 'Penerapan Bernoulli: Pesawat Terbang',
      blocks: [
        { type: 'text', value: 'Gaya angkat pesawat terbang terjadi karena perbedaan kecepatan udara di atas dan di bawah sayap (desain aerofoil).' },
        { type: 'list', items: [
          'Aliran udara di atas sayap (v₁) LEBIH CEPAT',
          'Aliran udara di bawah sayap (v₂) LEBIH LAMBAT',
          'Menurut Bernoulli, karena v₁ > v₂, maka P₁ < P₂',
          'Perbedaan tekanan (P₂ - P₁) inilah yang menghasilkan Gaya Angkat (Lift)'
        ]}
      ]
    },
    {
      title: 'Tutor Virtual AI SAINTIKA',
      blocks: [
        { type: 'text', value: 'Punya pertanyaan materi yang membingungkan? Silakan tanyakan apapun terkait Fluida Dinamis kepada SAINTIKA. Ketik <strong>/help</strong> untuk melihat daftar perintah.' },
        { type: 'chat' }
      ]
    }
  ],

  chatHistory: [],

  renderDOM() {
    const slideIndex = AppState.materiSlide || 0;
    const slide = this.slides[slideIndex];
    
    const contentDiv = document.getElementById('materi-content');
    if (!contentDiv) return;
    
    // Ping progress API whenever a slide is viewed
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'MATERI', slide: slideIndex })
    }).catch(e => console.error(e));
    
    let html = `<h3>${slide.title}</h3><hr/>`;
    
    slide.blocks.forEach(block => {
      if (block.type === 'text') {
        html += `<p>${block.value}</p>`;
      } else if (block.type === 'heading') {
        html += `<div class="card-header blue-header" style="margin-top:20px;">${block.value}</div>`;
      } else if (block.type === 'formula') {
        html += `<div style="background:#eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; font-size: 20px; font-weight: bold; color: #1d4ed8;">${block.value}</div>`;
      } else if (block.type === 'list') {
        html += `<ul class="styled-list">`;
        block.items.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += `</ul>`;
      } else if (block.type === 'chat') {
        html += `
          <div id="chat-container" style="border: 2px solid #3b82f6; border-radius: 12px; margin-top: 20px; overflow: hidden; display: flex; flex-direction: column; height: 400px; background: #f8fafc;">
            <div id="chat-history" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
              <!-- History will be injected here by updateChatHistoryUI -->
            </div>
            <div style="display: flex; border-top: 1px solid #cbd5e1; background: #ffffff;">
              <input type="text" id="chat-input" placeholder="Ketik pesan atau /help lalu tekan Enter..." onkeypress="if(event.key === 'Enter') window.Pages.MATERI.sendChatMessage()" style="flex: 1; border: none; padding: 16px; outline: none; font-family: inherit; font-size: 16px; background: transparent;">
              <button onclick="startVoiceRecognition('chat-input', window.Pages.MATERI.sendChatMessage)" style="background: transparent; color: #3b82f6; font-size: 20px; padding: 0 8px; border: none; cursor: pointer;">🎤</button>
              <button onclick="window.Pages.MATERI.sendChatMessage()" style="background: #3b82f6; color: white; border: none; padding: 0 24px; cursor: pointer; font-weight: bold; font-family: inherit; font-size: 16px;">Kirim</button>
            </div>
          </div>
        `;
      }
    });
    
    // Add slide indicators (dots)
    html += `<div style="display:flex; justify-content:center; margin-top:24px; gap:8px;">`;
    for(let i=0; i<this.slides.length; i++) {
      const activeStr = (i === slideIndex) ? 'background:#3b82f6;' : 'background:#cbd5e1;';
      html += `<div style="width:12px; height:12px; border-radius:50%; ${activeStr}"></div>`;
    }
    html += `</div>`;
    
    contentDiv.innerHTML = html;

    // After DOM is ready, if chat is rendered, populate its history
    if (document.getElementById('chat-history')) {
      this.updateChatHistoryUI();
    }
    
    
    // Render Navigation
    const navDiv = document.getElementById('materi-nav');
    if (!navDiv) return;
    
    let navHtml = '';
    navHtml += `<button class="btn btn-secondary" onclick="AppState.setState('MENU')">🏠 Kembali</button>`;
    
    if (slideIndex > 0) {
      navHtml += `<button class="btn btn-ghost" onclick="window.Pages.MATERI.prevSlide()">◀ Sebelumnya</button>`;
    } else {
      navHtml += `<button class="btn btn-ghost" onclick="AppState.setState('TUJUAN')">◀ Sebelumnya</button>`;
    }
    
    if (slideIndex < this.slides.length - 1) {
      navHtml += `<button class="btn btn-primary" onclick="window.Pages.MATERI.nextSlide()">Selanjutnya ▶</button>`;
    } else {
      navHtml += `<button class="btn btn-primary" onclick="AppState.setState('SIMULASI')">Ke Simulasi ▶</button>`;
    }
    
    navDiv.innerHTML = navHtml;
  },

  nextSlide() {
    if (AppState.materiSlide < this.slides.length - 1) {
      AppState.materiSlide++;
      this.renderDOM();
    }
  },

  prevSlide() {
    if (AppState.materiSlide > 0) {
      AppState.materiSlide--;
      this.renderDOM();
    }
  },
  
  sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    
    // Add to history
    this.chatHistory.push({ role: 'user', content: msg });
    input.value = '';
    
    // Optimistic UI update
    this.updateChatHistoryUI();
    
    // Show loading
    const historyDiv = document.getElementById('chat-history');
    if (historyDiv) {
      historyDiv.innerHTML += `
        <div id="chat-loading" style="align-self: flex-start; background: #e0f2fe; padding: 12px; border-radius: 12px; border-bottom-left-radius: 0; max-width: 80%; color: #0f172a; font-style: italic; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          🤖 SAINTIKA sedang berpikir...
        </div>
      `;
      historyDiv.scrollTop = historyDiv.scrollHeight;
    }
    
    // Send to backend
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: this.chatHistory })
    })
    .then(res => res.json())
    .then(data => {
      if (data.response) {
        this.chatHistory.push({ role: 'assistant', content: data.response });
        if (window.speakText) window.speakText(data.response);
      } else {
        this.chatHistory.push({ role: 'assistant', content: "Maaf, terjadi kesalahan: " + (data.error || "Unknown error") });
      }
      this.updateChatHistoryUI();
    })
    .catch(err => {
      this.chatHistory.push({ role: 'assistant', content: "Maaf, gagal terhubung ke server." });
      this.updateChatHistoryUI();
    });
  },

  updateChatHistoryUI() {
    const historyDiv = document.getElementById('chat-history');
    if (!historyDiv) return;
    
    let html = `
      <div style="align-self: flex-start; background: #e0f2fe; padding: 12px; border-radius: 12px; border-bottom-left-radius: 0; max-width: 80%; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.5;">
        <strong>🤖 SAINTIKA:</strong><br/>Halo! Saya SAINTIKA, Tutor Fisika Virtual Anda. Ada yang ingin ditanyakan tentang Fluida Dinamis?
      </div>
    `;
    
    // Simple markdown formatter
    const formatMsg = (text) => {
      let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/\n/g, '<br/>');
      return formatted;
    };
    
    this.chatHistory.forEach(msg => {
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
    
    // Refocus input
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  },
  
  // Stubs for canvas loop
  init() {}, draw() {}, cleanup() {}
};
