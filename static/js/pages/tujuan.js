// ============================================================
// tujuan.js — TUJUAN learning objectives page module
// State: TUJUAN
// Two content cards: Capaian Pembelajaran & Tujuan Pembelajaran.
// Responsive: side-by-side on wide screens, stacked on narrow.
// ============================================================
window.Pages = window.Pages || {};
window.Pages.TUJUAN = {
  buttons: [],
  localState: {},

  // ----------------------------------------------------------
  // init
  // ----------------------------------------------------------
  init(canvas) {
    this.buttons = UI.createNavButtons(canvas, [
      { text: 'Kembali',        onClick: () => AppState.setState('MENU'),    style: 'secondary', icon: '🏠' },
      { text: 'Sebelumnya',  onClick: () => AppState.setState('PANDUAN'), style: 'ghost',     icon: '◀' },
      { text: 'Selanjutnya', onClick: () => AppState.setState('MATERI'),  style: 'primary',   icon: '▶' },
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
    const sideBySide = w > 800;

    // ---- Background ----
    Utils.drawGradientBg(ctx, canvas);
    Utils.drawGridPattern(ctx, canvas);

    // ---- Header ----
    UI.drawHeader(ctx, canvas, 'Capaian & Tujuan Pembelajaran');

    // ---- Layout calculations ----
    const gap = 24;
    const padX = 24;
    const padY = 20;
    const lineH = 21;
    const headerBarH = 44;

    let cardW, card1X, card2X, cardStartY;

    if (sideBySide) {
      cardW = Math.min(360, (w - gap * 3) / 2);
      const totalW = cardW * 2 + gap;
      card1X = cx - totalW / 2;
      card2X = card1X + cardW + gap;
      cardStartY = 110;
    } else {
      cardW = Math.min(700, w - 48);
      card1X = cx - cardW / 2;
      card2X = card1X;
      cardStartY = 110;
    }

    // ---- Card 1: Capaian Pembelajaran (CP) ----
    const cpText = 'Peserta didik mampu menerapkan konsep dan prinsip fluida, termodinamika, dan gelombang dalam menyelesaikan masalah yang berkaitan dengan fenomena alam dan kehidupan sehari-hari.';

    ctx.save();
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    const cpLines = Utils.splitTextIntoLines(ctx, cpText, cardW - padX * 2);
    const card1H = headerBarH + padY + cpLines.length * lineH + padY;

    // Card bg
    Utils.fillRoundedRect(ctx, card1X, cardStartY, cardW, card1H, 16, UI.COLORS.bgCard);
    Utils.strokeRoundedRect(ctx, card1X, cardStartY, cardW, card1H, 16, UI.COLORS.border, 1);

    // Header bar with cyan left accent
    ctx.save();
    // Clip to rounded top
    Utils.roundedRectPath(ctx, card1X, cardStartY, cardW, headerBarH, 16);
    ctx.clip();
    ctx.fillStyle = 'rgba(6,182,212,0.08)';
    ctx.fillRect(card1X, cardStartY, cardW, headerBarH);
    // Cyan left bar
    ctx.fillStyle = UI.COLORS.accent;
    ctx.fillRect(card1X, cardStartY, 4, headerBarH);
    ctx.restore();

    // Header text
    ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = UI.COLORS.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📋  Capaian Pembelajaran (CP)', card1X + padX, cardStartY + headerBarH / 2);

    // Body text
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = UI.COLORS.textLight;
    ctx.textBaseline = 'top';
    let cy1 = cardStartY + headerBarH + padY;
    cpLines.forEach(line => {
      ctx.fillText(line, card1X + padX, cy1);
      cy1 += lineH;
    });

    // ---- Card 2: Tujuan Pembelajaran (TP) ----
    const tpItems = [
      'Murid mampu menjelaskan konsep debit aliran fluida ideal.',
      'Murid mampu menerapkan asas kontinuitas dalam permasalahan fluida.',
      'Murid mampu menjelaskan dan menerapkan Hukum Bernoulli pada fenomena kehidupan sehari-hari (pesawat terbang, penyemprot parfum).',
    ];

    // Wrap each item to get total height
    const tpWrapped = tpItems.map(text => Utils.splitTextIntoLines(ctx, text, cardW - padX * 2 - 28));
    let card2ContentH = 0;
    tpWrapped.forEach(lines => {
      card2ContentH += lines.length * lineH + 10;
    });
    const card2H = headerBarH + padY + card2ContentH + padY;
    const card2Y = sideBySide ? cardStartY : cardStartY + card1H + gap;

    // Card bg
    Utils.fillRoundedRect(ctx, card2X, card2Y, cardW, card2H, 16, UI.COLORS.bgCard);
    Utils.strokeRoundedRect(ctx, card2X, card2Y, cardW, card2H, 16, UI.COLORS.border, 1);

    // Header bar with blue left accent
    ctx.save();
    Utils.roundedRectPath(ctx, card2X, card2Y, cardW, headerBarH, 16);
    ctx.clip();
    ctx.fillStyle = 'rgba(59,130,246,0.08)';
    ctx.fillRect(card2X, card2Y, cardW, headerBarH);
    // Blue left bar
    ctx.fillStyle = UI.COLORS.primary;
    ctx.fillRect(card2X, card2Y, 4, headerBarH);
    ctx.restore();

    // Header text
    ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = UI.COLORS.primary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯  Tujuan Pembelajaran (TP)', card2X + padX, card2Y + headerBarH / 2);

    // Body — numbered items
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    ctx.textBaseline = 'top';
    let cy2 = card2Y + headerBarH + padY;

    tpWrapped.forEach((lines, idx) => {
      // Number
      ctx.fillStyle = UI.COLORS.primary;
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`${idx + 1}.`, card2X + padX, cy2);

      // Text
      ctx.fillStyle = UI.COLORS.textLight;
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      lines.forEach((line, li) => {
        ctx.fillText(line, card2X + padX + 24, cy2 + li * lineH);
      });
      cy2 += lines.length * lineH + 10;
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
