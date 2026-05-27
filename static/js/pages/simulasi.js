// =============================================================================
// SIMULASI Page Module — Fluida Dinamis Interactive Learning App
// Shows a description card, a PhET iframe launcher, and an animated on-canvas
// pipe-flow simulation demonstrating the Continuity Equation (A₁v₁ = A₂v₂).
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Particle system for the mini pipe simulation
  // ---------------------------------------------------------------------------
  var MAX_PARTICLES = 60;

  /** Create a fresh particle at the left entrance of the pipe */
  function spawnParticle(pipeGeom) {
    var yRange = pipeGeom.leftH * 0.7;
    return {
      x: pipeGeom.leftX,
      y: pipeGeom.centerY + (Math.random() - 0.5) * yRange,
      radius: 3 + Math.random() * 2,
      alpha: 0.7 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2  // slight bobbing
    };
  }

  /** Determine the pipe half-height at a given x position */
  function pipeHalfHeightAt(x, pg) {
    if (x < pg.narrowStart) return pg.leftH / 2;
    if (x > pg.narrowEnd) return pg.rightH / 2;
    // In the transition / narrow zone
    if (x < pg.narrowStart + pg.transW) {
      var t = (x - pg.narrowStart) / pg.transW;
      return Utils.lerp(pg.leftH / 2, pg.narrowH / 2, Utils.easeInOutCubic(t));
    }
    if (x > pg.narrowEnd - pg.transW) {
      var t2 = (x - (pg.narrowEnd - pg.transW)) / pg.transW;
      return Utils.lerp(pg.narrowH / 2, pg.rightH / 2, Utils.easeInOutCubic(t2));
    }
    return pg.narrowH / 2;
  }

  /** Determine the speed multiplier at a given x position */
  function speedAt(x, pg) {
    var h = pipeHalfHeightAt(x, pg);
    // Speed inversely proportional to cross-section area (height)
    return (pg.leftH / 2) / h;
  }

  // ---------------------------------------------------------------------------
  // Page Module
  // ---------------------------------------------------------------------------
  window.Pages = window.Pages || {};

  window.Pages.SIMULASI = {
    buttons: [],
    localState: {},

    // ---- Initialise ----
    init: function (canvas) {
      this.buttons = [];
      var self = this;

      // Pipe geometry (computed relative to canvas)
      var cw = canvas.width;
      var ch = canvas.height;
      var pipeW = Math.min(620, cw - 80);
      var pipeX = (cw - pipeW) / 2;
      var pipeCY = ch * 0.52;
      var leftH = 100;
      var narrowH = 40;
      var transW = pipeW * 0.12;

      this.localState = {
        particles: [],
        spawnTimer: 0,
        pipeGeom: {
          leftX: pipeX,
          rightX: pipeX + pipeW,
          centerY: pipeCY,
          leftH: leftH,
          rightH: leftH,
          narrowH: narrowH,
          narrowStart: pipeX + pipeW * 0.35,
          narrowEnd: pipeX + pipeW * 0.65,
          transW: transW,
          width: pipeW
        }
      };

      // Seed some particles
      for (var i = 0; i < 30; i++) {
        var p = spawnParticle(this.localState.pipeGeom);
        p.x = this.localState.pipeGeom.leftX + Math.random() * pipeW;
        // Clamp y to pipe at that x
        var hh = pipeHalfHeightAt(p.x, this.localState.pipeGeom);
        p.y = pipeCY + (Math.random() - 0.5) * hh * 1.4;
        this.localState.particles.push(p);
      }

      // "Buka Simulasi PhET" button
      var phetBtnW = 260;
      var phetBtnH = 50;
      this.localState.phetBtn = UI.Button({
        x: (cw - phetBtnW) / 2,
        y: ch * 0.30,
        w: phetBtnW,
        h: phetBtnH,
        text: '🔬 Buka Simulasi PhET',
        style: 'accent',
        onClick: function () {
          var overlay = document.getElementById('overlay');
          if (!overlay) return;
          overlay.classList.remove('hidden');
          overlay.innerHTML =
            '<button class="close-btn" onclick="document.getElementById(\'overlay\').classList.add(\'hidden\'); document.getElementById(\'overlay\').innerHTML=\'\';">✕ Tutup Simulasi</button>' +
            '<iframe src="https://phet.colorado.edu/sims/html/fluid-pressure-and-flow/latest/fluid-pressure-and-flow_all.html" allowfullscreen></iframe>';
        }
      });

      // Navigation buttons
      var navConfigs = [
        {
          text: 'Kembali', style: 'secondary', icon: '🏠',
          onClick: function () { AppState.setState('MENU'); }
        },
        {
          text: 'Sebelumnya', style: 'ghost', icon: '◀',
          onClick: function () { AppState.setState('MATERI'); }
        },
        {
          text: 'Selanjutnya', style: 'primary', icon: '▶',
          onClick: function () { AppState.setState('KUIS'); }
        }
      ];
      this.buttons = UI.createNavButtons(canvas, navConfigs);
      // Add the PhET button to the clickable list
      this.buttons.push(this.localState.phetBtn);
    },

    // ---- Draw every frame ----
    draw: function (ctx, canvas, dt) {
      var COLORS = UI.COLORS;
      var ls = this.localState;
      var pg = ls.pipeGeom;

      // --- Background ---
      Utils.drawGradientBg(ctx, canvas, COLORS.bgDark, COLORS.bgMid);
      Utils.drawGridPattern(ctx, canvas, COLORS.border, 40, 0.08);

      // --- Header ---
      UI.drawHeader(ctx, canvas, 'Simulasi Virtual', 'PhET Interactive Simulation');

      // --- Description card ---
      var descW = Math.min(640, canvas.width - 60);
      var descX = (canvas.width - descW) / 2;
      var descY = 130;
      var descPad = 20;
      Utils.fillRoundedRect(ctx, descX, descY, descW, 70, 12, COLORS.bgCard);
      Utils.strokeRoundedRect(ctx, descX, descY, descW, 70, 12, COLORS.border, 1);
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = COLORS.textLight;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      Utils.wrapText(
        ctx,
        'Simulasi ini memvisualisasikan perubahan laju aliran air ketika melewati pipa yang luas penampangnya diubah-ubah secara dinamis. Anda dapat mengamati penerapan Asas Kontinuitas secara langsung.',
        descX + descPad, descY + descPad, descW - descPad * 2, 20
      );

      // --- PhET Button ---
      ls.phetBtn.update(dt);
      ls.phetBtn.draw(ctx, AppState.time);

      // --- Mini Pipe Simulation ---
      // Draw pipe body
      ctx.save();
      // Build pipe path (top edge left→right then bottom edge right→left)
      ctx.beginPath();
      var steps = 80;
      var stepX = pg.width / steps;
      // Top edge
      for (var i = 0; i <= steps; i++) {
        var px = pg.leftX + i * stepX;
        var hh = pipeHalfHeightAt(px, pg);
        if (i === 0) ctx.moveTo(px, pg.centerY - hh);
        else ctx.lineTo(px, pg.centerY - hh);
      }
      // Bottom edge (reverse)
      for (var j = steps; j >= 0; j--) {
        var px2 = pg.leftX + j * stepX;
        var hh2 = pipeHalfHeightAt(px2, pg);
        ctx.lineTo(px2, pg.centerY + hh2);
      }
      ctx.closePath();
      // Fill pipe interior
      var pipeGrad = ctx.createLinearGradient(pg.leftX, pg.centerY - pg.leftH / 2, pg.leftX, pg.centerY + pg.leftH / 2);
      pipeGrad.addColorStop(0, 'rgba(59,130,246,0.10)');
      pipeGrad.addColorStop(0.5, 'rgba(6,182,212,0.08)');
      pipeGrad.addColorStop(1, 'rgba(59,130,246,0.10)');
      ctx.fillStyle = pipeGrad;
      ctx.fill();
      // Stroke pipe walls
      ctx.strokeStyle = COLORS.primary;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // --- Update & draw particles ---
      ls.spawnTimer += dt;
      if (ls.spawnTimer > 0.08 && ls.particles.length < MAX_PARTICLES) {
        ls.particles.push(spawnParticle(pg));
        ls.spawnTimer = 0;
      }

      var baseSpeed = 100; // px/s
      for (var k = ls.particles.length - 1; k >= 0; k--) {
        var part = ls.particles[k];
        var spd = speedAt(part.x, pg);
        part.x += baseSpeed * spd * dt;
        // Gentle vertical bob
        part.phase += dt * 2;
        part.y += Math.sin(part.phase) * 0.3;
        // Constrain y to pipe boundaries
        var halfH = pipeHalfHeightAt(part.x, pg) * 0.85;
        part.y = Utils.clamp(part.y, pg.centerY - halfH, pg.centerY + halfH);

        // Remove if past the pipe
        if (part.x > pg.rightX + 10) {
          ls.particles.splice(k, 1);
          continue;
        }

        // Draw particle (brighter when faster)
        var brightness = Utils.clamp(spd / 2.5, 0.3, 1);
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.radius * (0.8 + brightness * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96,165,250,' + (part.alpha * brightness).toFixed(2) + ')';
        ctx.fill();
      }

      // --- Labels ---
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Left section label
      ctx.fillStyle = COLORS.accentLight;
      ctx.fillText('A\u2081 (besar)', pg.leftX + (pg.narrowStart - pg.leftX) / 2, pg.centerY + pg.leftH / 2 + 12);
      // Narrow section label
      ctx.fillStyle = COLORS.warning;
      ctx.fillText('A\u2082 (kecil)', (pg.narrowStart + pg.narrowEnd) / 2, pg.centerY + pg.narrowH / 2 + 12);
      // Right section label
      ctx.fillStyle = COLORS.accentLight;
      ctx.fillText('A\u2081 (besar)', pg.narrowEnd + (pg.rightX - pg.narrowEnd) / 2, pg.centerY + pg.rightH / 2 + 12);

      // Velocity arrows
      var arrowY = pg.centerY;
      // Small arrow left section
      drawArrow(ctx, pg.leftX + 30, arrowY, 30, COLORS.textLight, 1.5);
      // Large arrow narrow section
      drawArrow(ctx, (pg.narrowStart + pg.narrowEnd) / 2 - 20, arrowY, 45, COLORS.warning, 2.5);
      // Small arrow right section
      drawArrow(ctx, pg.rightX - 60, arrowY, 30, COLORS.textLight, 1.5);

      // Speed labels
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = COLORS.textMuted;
      ctx.fillText('v\u2081 (lambat)', pg.leftX + 50, arrowY - 20);
      ctx.fillStyle = COLORS.warning;
      ctx.fillText('v\u2082 (cepat)', (pg.narrowStart + pg.narrowEnd) / 2, arrowY - 22);
      ctx.fillStyle = COLORS.textMuted;
      ctx.fillText('v\u2081 (lambat)', pg.rightX - 50, arrowY - 20);

      // Continuity equation label
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = COLORS.accentLight;
      ctx.fillText('A\u2081 \u00d7 v\u2081 = A\u2082 \u00d7 v\u2082', canvas.width / 2, pg.centerY + pg.leftH / 2 + 38);

      // --- Nav & Footer ---
      this.buttons.forEach(function (b) { b.update(dt); });
      this.buttons.forEach(function (b) { b.draw(ctx, AppState.time); });
      UI.drawFooter(ctx, canvas);
    },

    // ---- Click ----
    onClick: function (x, y) {
      this.buttons.forEach(function (b) {
        if (b.contains(x, y)) {
          AudioManager.playClick();
          b.onClick();
        }
      });
    },

    // ---- Hover ----
    onMouseMove: function (x, y) {
      this.buttons.forEach(function (b) {
        b.setHovered(b.contains(x, y));
      });
    },

    // ---- Cleanup — remove PhET overlay ----
    cleanup: function () {
      var overlay = document.getElementById('overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Helper — draw a small right-pointing arrow
  // ---------------------------------------------------------------------------
  function drawArrow(ctx, x, y, len, color, lw) {
    var headLen = 8;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x + len, y);
    ctx.lineTo(x + len - headLen, y - headLen * 0.5);
    ctx.lineTo(x + len - headLen, y + headLen * 0.5);
    ctx.closePath();
    ctx.fill();
  }
})();
