// ============================================================
// cover.js — COVER landing page module
// State: COVER
// Animated landing with particle system, pipe illustration,
// airplane silhouette, and floating bubbles.
// ============================================================
window.Pages = window.Pages || {};
window.Pages.COVER = {
  buttons: [],
  localState: {},

  // ----------------------------------------------------------
  // init — called once when the page becomes active
  // ----------------------------------------------------------
  init(canvas) {
    const w = canvas.logicalWidth || canvas.width;
    const h = canvas.logicalHeight || canvas.height;
    const cx = w / 2;

    // ---- Particle system (floating bubbles) ----
    this.localState.particles = [];
    for (let i = 0; i < 60; i++) {
      this.localState.particles.push(this._createParticle(canvas, true));
    }

    // ---- Pipe water particles (flow inside pipe) ----
    this.localState.pipeParticles = [];
    for (let i = 0; i < 28; i++) {
      this.localState.pipeParticles.push({
        t: Math.random(), // 0‥1 progress along pipe
        radius: 2 + Math.random() * 3,
        yOff: (Math.random() - 0.5) * 0.6, // vertical offset within pipe (-0.5..0.5 normalised)
        opacity: 0.5 + Math.random() * 0.5,
      });
    }

    // ---- Airflow dash offset for animation ----
    this.localState.airflowOffset = 0;

    // ---- Load Logo ----
    this.localState.logoImg = new Image();
    this.localState.logoImg.src = '/static/images/logo-saintika.png';

    // ---- Buttons ----
    this.buttons = [];

    // "Mulai Belajar" button
    const btnW = 240, btnH = 56;
    this.buttons.push(new UI.Button({
      x: cx - btnW / 2,
      y: h * 0.68,
      w: btnW,
      h: btnH,
      text: 'Mulai Belajar',
      icon: '🚀',
      style: 'accent',
      onClick: () => AppState.setState('MENU'),
    }));

    // "Ganti Akun" button
    this.buttons.push(new UI.Button({
      x: cx - btnW / 2,
      y: h * 0.68 + btnH + 16,
      w: btnW,
      h: 40,
      text: 'Ganti Akun / Logout',
      icon: '🚪',
      style: 'ghost',
      onClick: () => {
        if (window.Auth && window.Auth.logout) {
          window.Auth.logout();
        }
      },
    }));

    // Mute / unmute button (top-right)
    const muteSize = 40;
    this.buttons.push(new UI.Button({
      x: w - muteSize - 16,
      y: 16,
      w: muteSize,
      h: muteSize,
      text: '',
      icon: AudioManager.isMuted ? '🔇' : '🔊',
      style: 'ghost',
      onClick: () => {
        AudioManager.toggleMute();
        // Update icon after toggle
        this.buttons[2].icon = AudioManager.isMuted ? '🔇' : '🔊';
      },
    }));

    // Start background music
    AudioManager.playBgm();
  },

  // ----------------------------------------------------------
  // _createParticle — helper to spawn a floating bubble
  // ----------------------------------------------------------
  _createParticle(canvas, randomY) {
    const colors = [
      'rgba(6,182,212,', // cyan-500
      'rgba(34,211,238,', // cyan-400
      'rgba(59,130,246,', // blue-500
      'rgba(96,165,250,', // blue-400
      'rgba(14,165,233,', // sky-500
    ];
    return {
      x: Math.random() * (canvas.logicalWidth || canvas.width),
      y: randomY ? Math.random() * (canvas.logicalHeight || canvas.height) : (canvas.logicalHeight || canvas.height) + 10,
      radius: 2 + Math.random() * 4,
      speed: 15 + Math.random() * 30, // px/s upward
      swaySpeed: 0.5 + Math.random() * 1.5,
      swayAmp: 10 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.15 + Math.random() * 0.45,
      colorBase: colors[Math.floor(Math.random() * colors.length)],
    };
  },

  // ----------------------------------------------------------
  // draw — called every frame
  // ----------------------------------------------------------
  draw(ctx, canvas, dt) {
    // Update button animations
    this.buttons.forEach(b => b.update(dt));
    // Keep mute icon synced
    this.buttons[2].icon = AudioManager.isMuted ? '🔇' : '🔊';

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const time = AppState.time;

    // ---- 1. Semi-transparent dark overlay for video background ----
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)'; // 60% dark overlay for readability
    ctx.fillRect(0, 0, w, h);

    // ---- 2. Grid pattern overlay ----
    Utils.drawGridPattern(ctx, canvas);

    // ---- 3. Particle system — floating bubbles ----
    const particles = this.localState.particles;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Move upward
      p.y -= p.speed * dt;
      // Horizontal sway
      const sway = Math.sin(time * p.swaySpeed + p.phase) * p.swayAmp;
      const drawX = p.x + sway;

      // Wrap when off top
      if (p.y + p.radius < -10) {
        Object.assign(p, this._createParticle(canvas, false));
      }

      // Draw bubble
      ctx.beginPath();
      ctx.arc(drawX, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.colorBase + p.opacity + ')';
      ctx.fill();

      // Tiny highlight
      if (p.radius > 3) {
        ctx.beginPath();
        ctx.arc(drawX - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();
      }
    }

    // ---- 4 & 5. Pipe and Airplane are now handled by DOM SVG Overlays ----

    // ---- 6. Title text ----
    // "Modul Interaktif & Simulasi" — line 1
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const titleY1 = h * 0.22;
    const titleY2 = h * 0.32;

    // Title: No neon glows, solid dark/bright colors (PhET style)
    // Title: Adjust font sizes based on screen width
    const isMobile = w < 600;
    const titleFontSize = isMobile ? '18px' : '26px';
    const mainFontSize = isMobile ? '32px' : '46px';
    const subFontSize = isMobile ? '12px' : '14px';

    ctx.font = 'bold ' + titleFontSize + ' "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff'; // White for better contrast
    // Add strong shadow for video background
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('Modul Interaktif & Simulasi', cx, titleY1);

    // Draw the Logo right above the text
    if (this.localState.logoImg && this.localState.logoImg.complete && this.localState.logoImg.naturalWidth > 0) {
      const img = this.localState.logoImg;
      const targetWidth = isMobile ? 180 : 250;
      const ratio = targetWidth / img.naturalWidth;
      const targetHeight = img.naturalHeight * ratio;
      const imgY = titleY1 - targetHeight - (isMobile ? 15 : 25);
      
      // Turn off shadow for the image draw
      ctx.save();
      ctx.shadowColor = 'transparent';
      ctx.drawImage(img, cx - targetWidth / 2, imgY, targetWidth, targetHeight);
      ctx.restore();
    }

    // "Fluida Dinamis" — line 2, larger, PhET Orange
    ctx.font = 'bold ' + mainFontSize + ' "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = UI.COLORS.accent; // Orange
    // Add a strong solid shadow for readability over video
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('Fluida Dinamis', cx, titleY2);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // ---- 7. Subtitle ----
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.font = subFontSize + ' "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#e2e8f0'; // Light slate for readability
    ctx.fillText('Fase F  •  Kelas XI  •  Fisika', cx, titleY2 + 36);
    ctx.restore();

    // ---- 8 & 9. Buttons ----
    this.buttons.forEach(b => b.draw(ctx, time));

    // ---- 11. Footer ----
    UI.drawFooter(ctx, canvas);
  },

  // ----------------------------------------------------------
  // _drawPipe — horizontal pipe with narrowing section + water
  // ----------------------------------------------------------
  _drawPipe(ctx, canvas, dt, time) {
    const w = canvas.width;
    const cx = w / 2;
    // Pipe positioned in the lower portion of the canvas
    const pipeY = canvas.height * 0.82;
    const pipeLen = Math.min(500, w * 0.7);
    const pipeX = cx - pipeLen / 2;
    const pipeH = 36; // full height of wide section
    const narrowH = 16; // height of narrow section
    const narrowStart = pipeX + pipeLen * 0.4;
    const narrowEnd = pipeX + pipeLen * 0.7;

    ctx.save();

    // — Pipe body (gradient fill) —
    // Wide left section
    const pipeGrad = ctx.createLinearGradient(0, pipeY - pipeH / 2, 0, pipeY + pipeH / 2);
    pipeGrad.addColorStop(0, '#334155');
    pipeGrad.addColorStop(0.5, '#475569');
    pipeGrad.addColorStop(1, '#1e293b');

    // Build pipe shape path
    ctx.beginPath();
    // Top edge
    const topWide = pipeY - pipeH / 2;
    const botWide = pipeY + pipeH / 2;
    const topNarrow = pipeY - narrowH / 2;
    const botNarrow = pipeY + narrowH / 2;

    // Left rounded cap
    ctx.arc(pipeX + 8, pipeY, pipeH / 2, Math.PI * 0.5, Math.PI * 1.5);
    // Top edge — wide
    ctx.lineTo(narrowStart, topWide);
    // Taper to narrow
    ctx.quadraticCurveTo(narrowStart + 20, topWide, narrowStart + 20, topNarrow);
    // Narrow top
    ctx.lineTo(narrowEnd - 20, topNarrow);
    // Widen back
    ctx.quadraticCurveTo(narrowEnd - 20, topWide, narrowEnd, topWide);
    // Top edge — wide right
    ctx.lineTo(pipeX + pipeLen - 8, topWide);
    // Right rounded cap
    ctx.arc(pipeX + pipeLen - 8, pipeY, pipeH / 2, -Math.PI * 0.5, Math.PI * 0.5);
    // Bottom edge — wide right
    ctx.lineTo(narrowEnd, botWide);
    // Taper to narrow (bottom)
    ctx.quadraticCurveTo(narrowEnd - 20, botWide, narrowEnd - 20, botNarrow);
    // Narrow bottom
    ctx.lineTo(narrowStart + 20, botNarrow);
    // Widen back (bottom)
    ctx.quadraticCurveTo(narrowStart + 20, botWide, narrowStart, botWide);
    // Bottom edge — wide left
    ctx.lineTo(pipeX + 8, botWide);
    ctx.closePath();

    ctx.fillStyle = pipeGrad;
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // — Water particles flowing inside —
    ctx.save();
    // Clip to pipe interior
    ctx.clip();
    const pp = this.localState.pipeParticles;
    for (let i = 0; i < pp.length; i++) {
      const p = pp[i];
      // Advance particle
      // Speed depends on position — faster in narrow section
      const posX = pipeX + p.t * pipeLen;
      let speed = 0.08; // base speed (fraction of pipe/s)
      if (posX >= narrowStart && posX <= narrowEnd) {
        speed = 0.22; // faster in narrow section
      }
      p.t += speed * dt;
      if (p.t > 1.05) {
        p.t = -0.05;
        p.yOff = (Math.random() - 0.5) * 0.6;
      }

      // Compute actual position
      const px = pipeX + p.t * pipeLen;
      // Y — interpolate between wide and narrow
      let halfH = pipeH / 2;
      if (px >= narrowStart + 20 && px <= narrowEnd - 20) {
        halfH = narrowH / 2;
      } else if (px > narrowStart && px < narrowStart + 20) {
        const frac = (px - narrowStart) / 20;
        halfH = Utils.lerp(pipeH / 2, narrowH / 2, frac);
      } else if (px > narrowEnd - 20 && px < narrowEnd) {
        const frac = (px - (narrowEnd - 20)) / 20;
        halfH = Utils.lerp(narrowH / 2, pipeH / 2, frac);
      }
      const py = pipeY + p.yOff * halfH * 0.85;

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,130,246,${p.opacity})`;
      ctx.fill();
    }
    ctx.restore();

    // Pipe label
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = UI.COLORS.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Asas Kontinuitas: A₁v₁ = A₂v₂', cx, pipeY + pipeH / 2 + 18);

    ctx.restore();
  },

  // ----------------------------------------------------------
  // _drawAirplane — simplified airplane with airflow lines
  // ----------------------------------------------------------
  _drawAirplane(ctx, canvas, time) {
    const cx = canvas.width / 2;
    const ay = canvas.height * 0.54; // airplane vertical center
    const scale = Math.min(1, canvas.width / 900);

    ctx.save();
    ctx.translate(cx, ay);
    ctx.scale(scale, scale);

    // — Fuselage —
    ctx.beginPath();
    ctx.moveTo(-80, 0);    // nose
    ctx.lineTo(-50, -10);
    ctx.lineTo(60, -8);
    ctx.lineTo(75, -4);
    ctx.lineTo(75, 4);
    ctx.lineTo(60, 8);
    ctx.lineTo(-50, 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,182,212,0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6,182,212,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // — Wings —
    ctx.beginPath();
    ctx.moveTo(-20, -8);
    ctx.lineTo(-50, -30);
    ctx.lineTo(20, -30);
    ctx.lineTo(30, -8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,182,212,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bottom wing
    ctx.beginPath();
    ctx.moveTo(-20, 8);
    ctx.lineTo(-50, 30);
    ctx.lineTo(20, 30);
    ctx.lineTo(30, 8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,182,212,0.18)';
    ctx.fill();
    ctx.stroke();

    // — Tail —
    ctx.beginPath();
    ctx.moveTo(55, -8);
    ctx.lineTo(65, -24);
    ctx.lineTo(78, -20);
    ctx.lineTo(72, -6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,182,212,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,0.5)';
    ctx.stroke();

    // — Airflow lines (dashes around wings) —
    ctx.strokeStyle = 'rgba(34,211,238,0.4)';
    ctx.lineWidth = 1;
    const dashOffset = (time * 60) % 20;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -dashOffset;

    // Upper airflow — faster (closer lines, Bernoulli)
    for (let i = 0; i < 4; i++) {
      const yy = -34 - i * 7;
      ctx.beginPath();
      ctx.moveTo(-70, yy + 4);
      ctx.quadraticCurveTo(-10, yy - 2, 50, yy + 2);
      ctx.stroke();
    }
    // Lower airflow — slower (wider spacing)
    ctx.strokeStyle = 'rgba(34,211,238,0.22)';
    ctx.lineDashOffset = dashOffset; // opposite direction feel
    for (let i = 0; i < 3; i++) {
      const yy = 34 + i * 10;
      ctx.beginPath();
      ctx.moveTo(-70, yy - 4);
      ctx.quadraticCurveTo(-10, yy + 3, 50, yy - 1);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Lift arrow
    ctx.strokeStyle = 'rgba(34,211,238,0.55)';
    ctx.lineWidth = 2;
    const liftBob = Math.sin(time * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(0, -30 + liftBob);
    ctx.lineTo(0, -52 + liftBob);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(-5, -47 + liftBob);
    ctx.lineTo(0, -55 + liftBob);
    ctx.lineTo(5, -47 + liftBob);
    ctx.strokeStyle = 'rgba(34,211,238,0.55)';
    ctx.stroke();

    // Label
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(34,211,238,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('Gaya Angkat (Lift)', 0, -60 + liftBob);

    ctx.restore();
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
    this.localState.particles = [];
    this.localState.pipeParticles = [];
    

  },
};
