// ============================================================
// menu.js — MENU hub page module
// State: MENU
// 2×3 grid of navigation cards with animated hover glow.
// ============================================================
window.Pages = window.Pages || {};
window.Pages.MENU = {
  buttons: [],
  localState: {},

  // ----------------------------------------------------------
  // init
  // ----------------------------------------------------------
  init(canvas) {
    const cx = canvas.width / 2;
    const w = canvas.width;
    const h = canvas.height;

    // ---- Menu card definitions ----
    const cards = [
      { icon: '📖', label: 'Panduan',            state: 'PANDUAN' },
      { icon: '🎯', label: 'Tujuan Belajar',     state: 'TUJUAN' },
      { icon: '📚', label: 'Materi Interaktif',   state: 'MATERI' },
      { icon: '🔬', label: 'Simulasi Virtual',    state: 'SIMULASI' },
      { icon: '📝', label: 'Kuis Evaluasi',       state: 'KUIS' },
      { icon: '📋', label: 'Referensi',           state: 'REFERENSI' },
    ];

    // ---- Grid layout ----
    const cols = 3;
    const rows = 2;
    const cardW = 200;
    const cardH = 120;
    const gap = 20;
    const totalW = cols * cardW + (cols - 1) * gap; // 640
    const totalH = rows * cardH + (rows - 1) * gap; // 260
    const startX = (w - totalW) / 2;
    const startY = (h - totalH) / 2 - 20; // shift up for visual balance

    this.buttons = [];

    cards.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (cardW + gap);
      const by = startY + row * (cardH + gap);

      this.buttons.push(new UI.Button({
        x: bx,
        y: by,
        w: cardW,
        h: cardH,
        text: card.label,
        icon: card.icon,
        style: 'secondary',
        onClick: () => {
          // Reset states where needed before navigating
          if (card.state === 'MATERI') AppState.resetMateri();
          if (card.state === 'KUIS')   AppState.resetKuis();
          AppState.setState(card.state);
        },
      }));
    });

    // ---- "Keluar" exit button ----
    const exitW = 160;
    const exitH = 44;
    this.buttons.push(new UI.Button({
      x: cx - exitW / 2,
      y: startY + totalH + 40,
      w: exitW,
      h: exitH,
      text: 'Kembali',
      icon: '🚪',
      style: 'ghost',
      onClick: () => {
        AudioManager.stopBgm();
        AppState.setState('COVER');
      },
    }));
  },

  // ----------------------------------------------------------
  // draw
  // ----------------------------------------------------------
  draw(ctx, canvas, dt) {
    // Update button animations
    this.buttons.forEach(b => b.update(dt));

    const time = AppState.time;

    // ---- 1. Background ----
    Utils.drawGradientBg(ctx, canvas);
    Utils.drawGridPattern(ctx, canvas);

    // ---- 2. Header ----
    UI.drawHeader(ctx, canvas, 'Menu Utama');

    // ---- 3. Animated glow behind hovered cards ----
    // Draw a subtle glow ring for hovered menu cards (first 6 buttons)
    for (let i = 0; i < 6 && i < this.buttons.length; i++) {
      const b = this.buttons[i];
      if (b.hovered) {
        const glowAlpha = 0.12 + Math.sin(time * 3) * 0.06;
        ctx.save();
        ctx.shadowColor = UI.COLORS.accent;
        ctx.shadowBlur = 18;
        Utils.fillRoundedRect(ctx, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 14,
          `rgba(6,182,212,${glowAlpha})`);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    // ---- 4. Draw all buttons ----
    this.buttons.forEach(b => b.draw(ctx, time));

    // ---- 5. Footer ----
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
