// =============================================================================
// REFERENSI Page Module — Fluida Dinamis Interactive Learning App
// Displays bibliographic references, learning resources, and credits.
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Reference data
  // ---------------------------------------------------------------------------
  var REFERENCES = [
    {
      icon: '\uD83D\uDCD8', // 📘
      text: 'Buku Paket Fisika SMA Kelas XI — Pusat Kurikulum dan Perbukuan, Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.'
    },
    {
      icon: '\uD83C\uDF10', // 🌐
      text: 'PhET Interactive Simulations — University of Colorado Boulder. https://phet.colorado.edu'
    },
    {
      icon: '\uD83D\uDCD6', // 📖
      text: 'Serway, R.A. & Jewett, J.W. — Physics for Scientists and Engineers (referensi tambahan).'
    }
  ];

  var CREDITS_TEXT = 'Modul ini dikembangkan sebagai media pembelajaran interaktif untuk mata pelajaran Fisika Fase F / Kelas XI.';

  // ---------------------------------------------------------------------------
  // Page Module
  // ---------------------------------------------------------------------------
  window.Pages = window.Pages || {};

  window.Pages.REFERENSI = {
    buttons: [],
    localState: {},

    init: function (canvas) {
      this.buttons = [];
      this.localState = {
        animProgress: 0
      };

      var navConfigs = [
        {
          text: 'Kembali', style: 'secondary', icon: '\uD83C\uDFE0',
          onClick: function () { AppState.setState('MENU'); }
        },
        {
          text: 'Sebelumnya', style: 'ghost', icon: '\u25C0',
          onClick: function () { AppState.setState('KUIS'); }
        },
        {
          text: 'Selesai', style: 'success', icon: '\u2713',
          onClick: function () { AppState.setState('MENU'); }
        }
      ];

      this.buttons = UI.createNavButtons(canvas, navConfigs);
    },

    draw: function (ctx, canvas, dt) {
      var COLORS = UI.COLORS;
      var ls = this.localState;

      // Entrance animation
      ls.animProgress = Math.min(1, ls.animProgress + dt * 3);
      var anim = Utils.easeInOutCubic(ls.animProgress);

      // --- Background ---
      Utils.drawGradientBg(ctx, canvas, COLORS.bgDark, COLORS.bgMid);
      Utils.drawGridPattern(ctx, canvas, COLORS.border, 40, 0.08);

      // --- Header ---
      UI.drawHeader(ctx, canvas, 'Referensi & Daftar Pustaka', '');

      // --- Main content card ---
      var cardW = Math.min(680, canvas.width - 60);
      var cardX = (canvas.width - cardW) / 2;
      var cardTop = 130;
      var cardPad = 28;
      var slideOff = (1 - anim) * 30;

      ctx.globalAlpha = anim;

      // Calculate card height dynamically
      var contentMaxW = cardW - cardPad * 2;
      var estimatedH = 380; // generous estimate
      Utils.fillRoundedRect(ctx, cardX, cardTop + slideOff, cardW, estimatedH, 14, COLORS.bgCard);
      Utils.strokeRoundedRect(ctx, cardX, cardTop + slideOff, cardW, estimatedH, 14, COLORS.border, 1);

      var cursorY = cardTop + cardPad + slideOff;
      var contentX = cardX + cardPad;

      // --- Section: Sumber Belajar ---
      // Section icon + title
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = COLORS.accentLight;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('\uD83D\uDCDA Sumber Belajar', contentX, cursorY);
      cursorY += 36;

      // Divider line
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(contentX, cursorY);
      ctx.lineTo(contentX + contentMaxW, cursorY);
      ctx.stroke();
      cursorY += 16;

      // Reference entries
      REFERENCES.forEach(function (ref, idx) {
        // Icon
        ctx.font = '22px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = COLORS.textWhite;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(ref.icon, contentX, cursorY);

        // Text (wraps)
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = COLORS.textLight;
        var refTextH = Utils.wrapText(ctx, ref.text, contentX + 34, cursorY + 2, contentMaxW - 40, 22);
        cursorY += Math.max(refTextH, 28) + 16;

        // Subtle separator between entries (except last)
        if (idx < REFERENCES.length - 1) {
          ctx.strokeStyle = 'rgba(51,65,85,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(contentX + 34, cursorY - 8);
          ctx.lineTo(contentX + contentMaxW, cursorY - 8);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      cursorY += 10;

      // --- Section: Credits ---
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(contentX, cursorY);
      ctx.lineTo(contentX + contentMaxW, cursorY);
      ctx.stroke();
      cursorY += 18;

      // Credits icon + title
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = COLORS.primaryLight;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('\u2139\uFE0F Tentang Modul', contentX, cursorY);
      cursorY += 30;

      // Credits text
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = COLORS.textMuted;
      Utils.wrapText(ctx, CREDITS_TEXT, contentX, cursorY, contentMaxW, 22);

      ctx.globalAlpha = 1;

      // --- Update & draw buttons ---
      this.buttons.forEach(function (b) { b.update(dt); });
      this.buttons.forEach(function (b) { b.draw(ctx, AppState.time); });

      // --- Footer ---
      UI.drawFooter(ctx, canvas);
    },

    onClick: function (x, y) {
      this.buttons.forEach(function (b) {
        if (b.contains(x, y)) {
          AudioManager.playClick();
          b.onClick();
        }
      });
    },

    onMouseMove: function (x, y) {
      this.buttons.forEach(function (b) {
        b.setHovered(b.contains(x, y));
      });
    },

    cleanup: function () {}
  };
})();
