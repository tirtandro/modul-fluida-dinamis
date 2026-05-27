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
    ctx.save();
    ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
    const titleText = 'Petunjuk Penggunaan Modul';
    cursorY += 24; // title line

    // — Numbered items —
    const items = [
      'Klik tombol navigasi (Selanjutnya / Sebelumnya) untuk berpindah halaman materi.',
      'Lakukan interaksi dengan klik simulasi virtual yang tersedia pada bagian tertentu.',
      'Kerjakan kuis evaluasi di akhir untuk mengukur pemahaman Anda.',
      'Gunakan tombol obrolan (floating chat) atau kunjungi halaman SAINTIKA untuk bertanya pada Tutor AI.',
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
      '💡 Tip: Gunakan tombol Kembali untuk kembali ke halaman utama kapan saja.',
      '🔊 Klik tombol suara di pojok kanan atas untuk mengatur audio.',
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

    // Divider line
    cursorY += 4;
    ctx.beginPath();
    ctx.moveTo(contentX, cursorY);
    ctx.lineTo(contentX + textW + 20, cursorY);
    ctx.strokeStyle = UI.COLORS.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    cursorY += 16;

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
