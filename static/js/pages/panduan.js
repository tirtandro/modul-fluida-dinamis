// ============================================================
// panduan.js — PANDUAN guide page module
// State: PANDUAN
// Displays usage instructions inside a styled content card.
// ============================================================
window.Pages = window.Pages || {};
window.Pages.PANDUAN = {
  buttons: [],
  localState: {},

  // ----------------------------------------------------------
  // init
  // ----------------------------------------------------------
  init(canvas) {
    // Navigation buttons at bottom
    this.buttons = UI.createNavButtons(canvas, [
      { text: 'Kembali',        onClick: () => AppState.setState('MENU'),   style: 'secondary', icon: '🏠' },
      { text: 'Selanjutnya', onClick: () => AppState.setState('TUJUAN'), style: 'primary',   icon: '▶' },
    ]);
  },

  // ----------------------------------------------------------
  // draw
  // ----------------------------------------------------------
  draw(ctx, canvas, dt) {
    this.buttons.forEach(b => b.update(dt));

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const time = AppState.time;

    // ---- Background ----
    Utils.drawGradientBg(ctx, canvas);
    Utils.drawGridPattern(ctx, canvas);

    // ---- Header ----
    UI.drawHeader(ctx, canvas, 'Panduan Penggunaan');

    // ---- Content card ----
    const cardW = Math.min(700, w - 60);
    const cardX = cx - cardW / 2;
    const cardY = 100;
    const padX = 32;
    const padY = 28;
    const lineH = 22;

    // We'll pre-calculate content height then draw
    const contentX = cardX + padX;
    let cursorY = cardY + padY;

    // — Card title —
    ctx.save();\n    ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
    const titleText = 'Panduan Belajar Fluida Dinamis';
    cursorY += 24; // title line

    // — Numbered items —
    const items = [
      'Mulai dari Cover dan tekan tombol "Masuk".',
      'Baca tim penyusun modul dengan seksama kemudian tekan tombol "Mulai Belajar".',
      'Pahami Dasar (CP/TP): Baca bagian CP & TP terlebih dahulu. Ini adalah "tujuan akhir" kalian — hal-hal apa saja yang harus kalian kuasai setelah belajar modul ini.',
      'Eksplorasi Materi: Saat membaca Materi Interaktif, jangan terburu-buru. Jika ada rumus atau prinsip (seperti Hukum Bernoulli), cobalah untuk menghubungkannya dengan contoh nyata yang disediakan.',
      'Praktik dengan Simulasi Virtual: Ini bagian terpenting! Klik pada tautan Simulasi Virtual. Cobalah mengubah-ubah variabel (seperti memperkecil lubang pipa atau menambah kecepatan aliran). Amati apa yang terjadi pada tekanan atau debit air. Jangan takut untuk bereksperimen!',
      'Uji Pemahaman: Setelah merasa cukup paham, kerjakan Kuis Evaluasi. Jangan hanya melihat skor, tetapi perhatikan di mana letak kesalahan kalian jika ada jawaban yang salah.',
    ];

    ctx.font = '15px "Segoe UI", system-ui, sans-serif';
    const textW = cardW - padX * 2 - 30; // leave room for number

    // Pre-wrap each item to get total height
    let totalContentH = 24 + 16; // title + spacing
    const wrappedItems = items.map(text => {
      const lines = Utils.splitTextIntoLines(ctx, text, textW);
      totalContentH += lines.length * lineH + 12; // 12px gap between items
      return lines;
    });

    // Tips
    const tips = [
      '📝 Catat Konsep Kunci: Siapkan buku catatan. Tuliskan poin-poin penting atau pertanyaan yang muncul saat kalian mencoba simulasi.',
      '🔄 Gunakan Navigasi dengan Benar: Gunakan tombol "Selanjutnya" dan "Sebelumnya" untuk mengatur tempo belajar. Jika ada bagian yang sulit, jangan ragu untuk kembali ke halaman sebelumnya.',
      '🌍 Hubungkan dengan Keseharian: Fluida Dinamis ada di sekitar kita—mulai dari cara kerja sayap pesawat hingga air yang mengalir dari keran di rumah.',
    ];
    totalContentH += 20; // gap before tips
    const wrappedTips = tips.map(text => {
      const lines = Utils.splitTextIntoLines(ctx, text, textW);
      totalContentH += lines.length * lineH + 8;
      return lines;
    });

    totalContentH += padY; // bottom padding
    const cardH = totalContentH + padY;

    // Draw card background
    Utils.fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 16, UI.COLORS.bgCard);
    Utils.strokeRoundedRect(ctx, cardX, cardY, cardW, cardH, 16, UI.COLORS.border, 1);

    // Reset cursor and draw text
    cursorY = cardY + padY;

    // Title
    ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = UI.COLORS.textWhite;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(titleText, contentX, cursorY);
    cursorY += 24 + 16;

    // Numbered items
    ctx.font = '15px "Segoe UI", system-ui, sans-serif';
    wrappedItems.forEach((lines, idx) => {
      // Cyan number
      ctx.fillStyle = UI.COLORS.accent;
      ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`${idx + 1}.`, contentX, cursorY);

      // White text
      ctx.fillStyle = UI.COLORS.textLight;
      ctx.font = '15px "Segoe UI", system-ui, sans-serif';
      lines.forEach((line, li) => {
        ctx.fillText(line, contentX + 28, cursorY + li * lineH);
      });
      cursorY += lines.length * lineH + 12;
    });

    // Tips header
    cursorY += 4;
    ctx.beginPath();
    ctx.moveTo(contentX, cursorY);
    ctx.lineTo(contentX + textW + 20, cursorY);
    ctx.strokeStyle = UI.COLORS.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    cursorY += 12;

    ctx.fillStyle = UI.COLORS.accent;
    ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('💡 Tips agar lebih memahami materi:', contentX, cursorY);
    cursorY += lineH + 4;

    // Tips
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    wrappedTips.forEach((lines) => {
      ctx.fillStyle = UI.COLORS.textMuted;
      lines.forEach((line, li) => {
        ctx.fillText(line, contentX, cursorY + li * lineH);
      });
      cursorY += lines.length * lineH + 8;
    });

    ctx.restore();

    // ---- Buttons ----
    this.buttons.forEach(b => b.draw(ctx, time));

    // ---- Footer ----
    UI.drawFooter(ctx, canvas);
  },

  // ----------------------------------------------------------
  // onClick
  // ----------------------------------------------------------
  onClick(x, y) {
    this.buttons.forEach(b => {
      if (b.contains(x, y)) {
        AudioManager.playClick();
        b.onClick();
      }
    });
  },

  // ----------------------------------------------------------
  // onMouseMove
  // ----------------------------------------------------------
  onMouseMove(x, y) {
    this.buttons.forEach(b => b.setHovered(b.contains(x, y)));
  },

  // ----------------------------------------------------------
  // cleanup
  // ----------------------------------------------------------
  cleanup() {
    // nothing to tear down
  },
};
