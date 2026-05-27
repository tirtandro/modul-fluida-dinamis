/**
 * UI System - Button class and UI rendering helpers
 * Provides consistent button rendering, hover effects, and page layout helpers.
 * Redesigned for a bright, PhET-style educational aesthetic.
 */
window.UI = {

  // ========================================
  // Design Tokens — PhET Style (Light & Bright)
  // ========================================
  COLORS: {
    // Light backgrounds
    bgDark: '#f0f8ff',       // Main background (AliceBlue)
    bgMid: '#ffffff',        // Card background (White)
    bgCard: '#ffffff',       // Alias for bgMid
    bgCardLight: '#e1f5fe',  // Lighter card / subtle elements
    border: '#cccccc',       // Border / divider color

    // PhET Blue (primary actions)
    primary: '#1976d2',      // Primary buttons, links
    primaryHover: '#1565c0', // Hover state
    primaryDark: '#0d47a1',  // Active/pressed state
    primaryLight: '#bbdefb', // Light accents

    // PhET Orange (accent / highlights)
    accent: '#f57c00',       // Secondary accent
    accentLight: '#ffb74d',  // Highlight
    accentGlow: '#ffe0b2',   // Soft highlight

    // Text colors (Dark for light backgrounds)
    textWhite: '#212121',    // Headings (Dark Gray/Black)
    textLight: '#424242',    // Body text
    textMuted: '#757575',    // Muted / secondary text
    
    // Inverse text (White for use on dark buttons/headers)
    textInverse: '#ffffff',

    // Semantic colors
    success: '#388e3c',      // Correct answers, positive
    error: '#d32f2f',        // Wrong answers, errors
    warning: '#fbc02d'       // Warnings, caution
  },

  // ========================================
  // Button Class
  // ========================================

  Button: class {
    constructor({ x, y, w, h, text, onClick, style = 'primary', icon = null }) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.text = text;
      this.onClick = onClick;
      this.style = style;
      this.icon = icon;
      this.hovered = false;
      this.hoverProgress = 0;  // 0–1, smooth animation interpolation
      this.visible = true;
    }

    contains(mx, my) {
      return this.visible &&
        mx >= this.x && mx <= this.x + this.w &&
        my >= this.y && my <= this.y + this.h;
    }

    setHovered(val) {
      if (this.hovered !== val) {
        this.hovered = val;
        if (val) AudioManager.playHover();
      }
    }

    update(dt) {
      const target = this.hovered ? 1 : 0;
      this.hoverProgress += (target - this.hoverProgress) * Math.min(1, dt * 15);
    }

    draw(ctx, time) {
      if (!this.visible) return;

      const colors = window.UI.COLORS;
      const hp = this.hoverProgress;
      const radius = this.h / 2; // Pill-shaped buttons

      ctx.save();

      // --- Resolve style-specific colors ---
      let bgColor, bgHoverColor, shadowColor, textColor;

      switch (this.style) {
        case 'primary':
          bgColor = colors.primary;
          bgHoverColor = colors.primaryLight;
          shadowColor = colors.primaryDark;
          textColor = colors.textInverse;
          break;
        case 'secondary':
          bgColor = colors.bgCardLight;
          bgHoverColor = '#b3e5fc';
          shadowColor = '#81d4fa';
          textColor = colors.textWhite;
          break;
        case 'accent':
          bgColor = colors.accent;
          bgHoverColor = colors.accentLight;
          shadowColor = '#e65100';
          textColor = colors.textInverse;
          break;
        case 'success':
          bgColor = colors.success;
          bgHoverColor = '#4caf50';
          shadowColor = '#1b5e20';
          textColor = colors.textInverse;
          break;
        case 'danger':
          bgColor = colors.error;
          bgHoverColor = '#ef5350';
          shadowColor = '#b71c1c';
          textColor = colors.textInverse;
          break;
        case 'ghost':
          bgColor = 'transparent';
          bgHoverColor = '#f5f5f5';
          shadowColor = 'transparent';
          textColor = colors.textLight;
          break;
        default:
          bgColor = colors.primary;
          bgHoverColor = colors.primaryLight;
          shadowColor = colors.primaryDark;
          textColor = colors.textInverse;
      }

      // Flat design button push effect
      const pushDown = hp * 3; 
      
      // Draw shadow (bottom edge)
      if (this.style !== 'ghost') {
        Utils.fillRoundedRect(ctx, this.x, this.y + 4, this.w, this.h, radius, shadowColor);
      }

      // Draw main button body
      const currentBg = this.style === 'ghost' 
        ? `rgba(0,0,0,${hp * 0.05})` 
        : (hp > 0.5 ? bgHoverColor : bgColor);
        
      Utils.fillRoundedRect(ctx, this.x, this.y + pushDown, this.w, this.h, radius, currentBg);
      
      // Optional subtle border
      if (this.style === 'ghost') {
        Utils.strokeRoundedRect(ctx, this.x, this.y + pushDown, this.w, this.h, radius, colors.border, 1.5);
      } else {
        Utils.strokeRoundedRect(ctx, this.x, this.y + pushDown, this.w, this.h, radius, 'rgba(0,0,0,0.1)', 1);
      }

      // --- Label text ---
      ctx.fillStyle = textColor;
      ctx.font = `600 ${Math.min(18, this.h * 0.4)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let displayText = this.text;
      if (this.icon) {
        displayText = this.icon + '  ' + this.text;
      }
      ctx.fillText(displayText, this.x + this.w / 2, this.y + pushDown + this.h / 2);

      ctx.restore();
    }
  },

  // ========================================
  // Page Layout Helpers
  // ========================================

  drawHeader(ctx, canvas, title, subtitle = null) {
    const colors = this.COLORS;
    const headerH = 70;

    // Solid PhET Blue header
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, canvas.width, headerH);

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, headerH, canvas.width, 4);

    // Title text (White on blue)
    ctx.fillStyle = colors.textInverse;
    ctx.font = "bold 24px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, subtitle ? headerH / 2 - 10 : headerH / 2);

    // Optional subtitle
    if (subtitle) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(subtitle, canvas.width / 2, headerH / 2 + 16);
    }

    return headerH;
  },

  drawFooter(ctx, canvas) {
    // Disabled: Footer is now handled by DOM HTML (#app-footer)
  },

  createNavButtons(canvas, configs) {
    const btnW = 160;
    const btnH = 48; // slightly taller for PhET style pills
    const gap = 20;
    const totalW = configs.length * btnW + (configs.length - 1) * gap;
    const startX = (canvas.width - totalW) / 2;
    const y = canvas.height - 100;

    return configs.map((cfg, i) => {
      return new this.Button({
        x: startX + i * (btnW + gap),
        y: y,
        w: btnW,
        h: btnH,
        text: cfg.text,
        onClick: cfg.onClick,
        style: cfg.style || 'primary',
        icon: cfg.icon || null
      });
    });
  }
};
