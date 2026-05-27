var KUIS_DATA = [
  {
    type: 'multiple_choice',
    question: 'Berdasarkan asas kontinuitas, apabila air mengalir dari pipa penampang besar ke pipa penampang kecil, maka kecepatan aliran fluida akan...',
    options: ['Tetap sama', 'Semakin cepat (meningkat)', 'Semakin lambat (menurun)', 'Berhenti seketika'],
    correct: 1,
    explanation: 'Sesuai asas kontinuitas A₁v₁ = A₂v₂, saat penampang mengecil (A₂ < A₁), kecepatan harus meningkat (v₂ > v₁) agar debit tetap konstan.'
  },
  {
    type: 'true_false',
    question: 'Pernyataan: Menurut persamaan Bernoulli, pada daerah di mana kecepatan fluida tinggi, tekanan fluida juga tinggi.',
    options: ['Benar', 'Salah'],
    correct: 1,
    explanation: 'Salah. Menurut Bernoulli, kecepatan tinggi → tekanan rendah. Hubungan antara kecepatan dan tekanan bersifat berbanding terbalik.'
  },
  {
    type: 'multiple_choice',
    question: 'Debit air yang mengalir melalui pipa dengan luas penampang 2 × 10⁻² m² dan kecepatan 3 m/s adalah...',
    options: ['6 × 10⁻² m³/s', '1,5 × 10⁻² m³/s', '5 × 10⁻² m³/s', '6 × 10² m³/s'],
    correct: 0,
    explanation: 'Q = A × v = 2 × 10⁻² × 3 = 6 × 10⁻² m³/s'
  },
  {
    type: 'multiple_choice',
    question: 'Gaya angkat pada sayap pesawat terbang terjadi karena...',
    options: [
      'Tekanan di bawah sayap lebih kecil dari atas sayap',
      'Kecepatan udara di atas sayap lebih besar sehingga tekanan di atas lebih kecil',
      'Udara di bawah sayap bergerak lebih cepat',
      'Berat pesawat lebih kecil dari gaya gravitasi'
    ],
    correct: 1,
    explanation: 'Bentuk airfoil membuat udara di atas sayap bergerak lebih cepat. Menurut Bernoulli, kecepatan tinggi → tekanan rendah, sehingga tekanan di bawah sayap lebih besar → gaya angkat ke atas.'
  },
  {
    type: 'true_false',
    question: 'Pernyataan: Pada fluida ideal, berlaku hukum kekekalan energi yang dinyatakan dalam Persamaan Bernoulli.',
    options: ['Benar', 'Salah'],
    correct: 0,
    explanation: 'Benar. Persamaan Bernoulli pada dasarnya adalah pernyataan hukum kekekalan energi untuk fluida ideal yang bergerak.'
  }
];

window.Pages = window.Pages || {};

window.Pages.KUIS = {
  localState: {
    checked: false,
    selectedOption: null
  },

  renderDOM() {
    const idx = AppState.kuisIndex;
    const qData = KUIS_DATA[idx];
    
    // Reset local state for new question unless already checked
    if (AppState.kuisAnswers[idx] !== null && AppState.kuisAnswers[idx] !== undefined) {
      this.localState.selectedOption = AppState.kuisAnswers[idx];
      this.localState.checked = true;
    } else {
      this.localState.checked = false;
      // Do not reset selectedOption here because renderDOM is called on click
    }

    const contentDiv = document.getElementById('kuis-content');
    if (!contentDiv) return;

    const badge = qData.type === 'true_false' ? 'Benar / Salah' : 'Pilihan Ganda';
    const isChecked = this.localState.checked;
    
    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <span style="background:rgba(6,182,212,0.15); color:#06b6d4; padding:6px 12px; border-radius:6px; font-weight:bold; font-size:12px;">${badge}</span>
        <span style="color:#64748b; font-size:14px; font-weight:bold;">Soal ${idx + 1} dari 5</span>
      </div>
      <h3 style="margin-bottom:24px; line-height:1.4;">${qData.question}</h3>
      <div id="quiz-options">
    `;

    const labels = ['A', 'B', 'C', 'D'];
    qData.options.forEach((opt, i) => {
      const label = qData.type === 'true_false' ? '' : `${labels[i]}. `;
      let extraClass = '';
      if (isChecked) {
        if (i === qData.correct) extraClass = 'correct';
        else if (i === this.localState.selectedOption) extraClass = 'wrong';
      } else if (i === this.localState.selectedOption) {
        extraClass = 'selected';
      }
      
      html += `
        <label class="quiz-option ${extraClass}">
          <input type="radio" name="kuis-opt" value="${i}" ${isChecked ? 'disabled' : ''} ${i === this.localState.selectedOption ? 'checked' : ''} onchange="window.Pages.KUIS.selectOption(${i})">
          ${label}${opt}
          ${(isChecked && i === qData.correct) ? '<span style="float:right; color:#10b981;">✓</span>' : ''}
          ${(isChecked && i === this.localState.selectedOption && i !== qData.correct) ? '<span style="float:right; color:#ef4444;">✗</span>' : ''}
        </label>
      `;
    });

    html += `</div>`;
    
    // Feedback box
    if (isChecked) {
      const isRight = this.localState.selectedOption === qData.correct;
      const fbColor = isRight ? '#10b981' : '#ef4444';
      const fbBg = isRight ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
      const icon = isRight ? '✅ Benar!' : '❌ Salah!';
      html += `
        <div style="margin-top:20px; padding:16px; border:1px solid ${fbColor}; background:${fbBg}; border-radius:10px;">
          <h4 style="margin:0 0 8px 0; color:${fbColor};">${icon}</h4>
          <p style="margin:0; font-size:14px; color:#334155;">${qData.explanation}</p>
        </div>
      `;
    }

    contentDiv.innerHTML = html;

    this.renderNav();
  },

  renderNav() {
    const navDiv = document.getElementById('kuis-nav');
    if (!navDiv) return;
    
    const idx = AppState.kuisIndex;
    const isChecked = this.localState.checked;
    
    let navHtml = `<button class="btn btn-secondary" onclick="AppState.setState('MENU')">🏠 Kembali</button>`;
    
    if (idx > 0) {
      navHtml += `<button class="btn btn-ghost" onclick="window.Pages.KUIS.prevQuestion()">◀ Sebelumnya</button>`;
    }
    
    if (!isChecked && this.localState.selectedOption !== null) {
      navHtml += `<button class="btn btn-primary" onclick="window.Pages.KUIS.checkAnswer()">✔ Cek Jawaban</button>`;
    } else if (isChecked && idx < 4) {
      navHtml += `<button class="btn btn-primary" onclick="window.Pages.KUIS.nextQuestion()">Selanjutnya ▶</button>`;
    } else if (isChecked && idx === 4) {
      navHtml += `<button class="btn btn-primary" style="background:#10b981; border-bottom-color:#059669;" onclick="window.Pages.KUIS.showResults()">Lihat Hasil ✔</button>`;
    }
    
    navDiv.innerHTML = navHtml;
  },

  selectOption(idx) {
    if (this.localState.checked) return;
    this.localState.selectedOption = idx;
    if (window.AudioManager) window.AudioManager.playClick();
    this.renderDOM();
  },

  checkAnswer() {
    if (this.localState.selectedOption === null) return;
    this.localState.checked = true;
    const idx = AppState.kuisIndex;
    AppState.kuisAnswers[idx] = this.localState.selectedOption;
    
    const isRight = this.localState.selectedOption === KUIS_DATA[idx].correct;
    if (window.AudioManager) {
      if (isRight) window.AudioManager.playCorrect();
      else window.AudioManager.playWrong();
    }
    
    this.renderDOM();
  },

  nextQuestion() {
    if (AppState.kuisIndex < 4) {
      AppState.kuisIndex++;
      this.localState.checked = false;
      this.localState.selectedOption = null;
      if (window.AudioManager) window.AudioManager.playClick();
      this.renderDOM();
    }
  },

  prevQuestion() {
    if (AppState.kuisIndex > 0) {
      AppState.kuisIndex--;
      if (window.AudioManager) window.AudioManager.playClick();
      this.renderDOM();
    }
  },
  
  showResults() {
    let score = 0;
    for (let q = 0; q < KUIS_DATA.length; q++) {
      if (AppState.kuisAnswers[q] === KUIS_DATA[q].correct) score++;
    }
    AppState.kuisScore = score;
    AppState.kuisSubmitted = true;
    
    // Save quiz score to DB
    fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: score, total: KUIS_DATA.length })
    }).catch(e => console.error(e));
    
    if (window.AudioManager) window.AudioManager.playClick();
    AppState.setState('KUIS_HASIL');
  },

  init() {
    // Reset local state when entering the quiz page
    this.localState.checked = false;
    this.localState.selectedOption = null;
  }, 
  draw() {}, 
  cleanup() {}
};

window.Pages.KUIS_HASIL = {
  renderDOM() {
    const contentDiv = document.getElementById('kuis-hasil-content');
    if (!contentDiv) return;
    
    const score = AppState.kuisScore || 0;
    const total = 5;
    const pct = score / total;
    
    let color = '#ef4444'; // Red
    let msg = 'Tetap semangat! 📖 Pelajari kembali materinya.';
    if (pct >= 0.8) {
      color = '#10b981'; // Green
      msg = 'Sempurna! 🌟 Pemahaman Anda luar biasa!';
    } else if (pct >= 0.6) {
      color = '#f59e0b'; // Yellow/Orange
      msg = 'Hebat! 👏 Hampir sempurna!';
    }
    
    let html = `
      <div style="margin-bottom:30px;">
        <div style="width:140px; height:140px; border-radius:50%; border:10px solid ${color}; margin:0 auto; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <div style="font-size:36px; font-weight:bold; color:#212121;">${score}/${total}</div>
          <div style="color:#64748b;">${Math.round(pct * 100)}%</div>
        </div>
        <h3 style="color:${color}; margin-top:20px;">${msg}</h3>
      </div>
      
      <div style="text-align:left; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px;">
        <h4 style="margin-top:0; color:#475569; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">Ringkasan Jawaban:</h4>
    `;
    
    for (let i = 0; i < total; i++) {
      const userAns = AppState.kuisAnswers[i];
      const correct = KUIS_DATA[i].correct;
      const isRight = userAns === correct;
      const icon = isRight ? '✅' : '❌';
      
      let ansText = 'Tidak dijawab';
      if (userAns !== undefined && userAns !== null) {
        ansText = KUIS_DATA[i].options[userAns];
      }
      
      html += `
        <div style="margin-bottom:12px; font-size:14px; display:flex; gap:10px;">
          <span>${icon}</span>
          <span style="color:#334155;"><strong>Soal ${i+1}:</strong> Jawaban Anda — ${ansText}</span>
        </div>
      `;
    }
    
    html += `</div>`;
    contentDiv.innerHTML = html;
    
    const navDiv = document.getElementById('kuis-hasil-nav');
    if (navDiv) {
      navDiv.innerHTML = `
        <button class="btn btn-secondary" onclick="AppState.setState('MENU')">🏠 Kembali</button>
        <button class="btn btn-primary" onclick="AppState.resetKuis(); AppState.setState('KUIS')">🔄 Ulangi Kuis</button>
      `;
    }
  },
  
  init() {}, draw() {}, cleanup() {}
};
