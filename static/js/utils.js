/**
 * Utils - Shared utility functions for canvas drawing and math
 * Provides rounded rectangles, text wrapping, gradients, interpolation, and more.
 * All methods are stateless and operate on the provided canvas context.
 */
window.Utils = {

  /**
   * Draw a rounded rectangle PATH (does NOT fill or stroke).
   * Call ctx.fill() or ctx.stroke() after this to render.
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} r - Corner radius
   */
  roundedRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  /**
   * Fill a rounded rectangle with a given color.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} r - Corner radius
   * @param {string} fillStyle - CSS color string
   */
  fillRoundedRect(ctx, x, y, w, h, r, fillStyle) {
    ctx.save();
    ctx.fillStyle = fillStyle;
    this.roundedRectPath(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();
  },

  /**
   * Stroke a rounded rectangle outline.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} r - Corner radius
   * @param {string} strokeStyle - CSS color string
   * @param {number} [lineWidth=1] - Stroke width in pixels
   */
  strokeRoundedRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1) {
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    this.roundedRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
  },

  /**
   * Word-wrap text and draw it on the canvas.
   * Splits text by spaces, measures each word, and breaks lines when maxWidth is exceeded.
   * @param {CanvasRenderingContext2D} ctx - Canvas context (font/fillStyle should be set before calling)
   * @param {string} text - The text to wrap and draw
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position (baseline of first line)
   * @param {number} maxWidth - Maximum line width in pixels
   * @param {number} lineHeight - Vertical spacing between lines in pixels
   * @returns {number} Total height consumed by the rendered text
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let totalHeight = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, y + totalHeight);
        line = words[i] + ' ';
        totalHeight += lineHeight;
      } else {
        line = testLine;
      }
    }

    // Draw the last remaining line
    ctx.fillText(line.trim(), x, y + totalHeight);
    totalHeight += lineHeight;
    return totalHeight;
  },

  /**
   * Splits a text string into an array of lines that fit within maxWidth.
   * Does NOT draw the text.
   * @param {CanvasRenderingContext2D} ctx - Canvas context for font measurement
   * @param {string} text - The text to split
   * @param {number} maxWidth - Maximum line width in pixels
   * @returns {string[]} Array of text lines
   */
  splitTextIntoLines(ctx, text, maxWidth) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  },

  /**
   * Draw a vertical linear gradient background covering the entire canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} canvas - Canvas-like object with width/height
   * @param {string} color1 - Top color (CSS color)
   * @param {string} color2 - Bottom color (CSS color)
   */
  drawGradientBg(ctx, canvas, color1 = '#e1f5fe', color2 = '#f0f8ff') {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  /**
   * Linear interpolation between two values.
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0 = a, 1 = b)
   * @returns {number}
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  /**
   * Clamp a value to the [min, max] range.
   * @param {number} val - Value to clamp
   * @param {number} min - Minimum bound
   * @param {number} max - Maximum bound
   * @returns {number}
   */
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  /**
   * Ease in-out cubic easing function.
   * Smooth acceleration and deceleration for animations.
   * @param {number} t - Progress (0 to 1)
   * @returns {number} Eased value (0 to 1)
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  /**
   * Draw a subtle grid pattern overlay on the canvas.
   * Used for visual texture on dark backgrounds.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} canvas - Canvas-like object with width/height
   * @param {string} color - Grid line color (CSS color)
   * @param {number} [spacing=40] - Distance between grid lines in pixels
   * @param {number} [alpha=0.03] - Opacity of grid lines (0-1)
   */
  drawGridPattern(ctx, canvas, color = '#cccccc', spacing = 40, alpha = 0.5) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.restore();
  },

  /**
   * Format a quiz score as a percentage string.
   * @param {number} correct - Number of correct answers
   * @param {number} total - Total number of questions
   * @returns {string} Percentage string, e.g. "80%"
   */
  formatScore(correct, total) {
    return Math.round((correct / total) * 100) + '%';
  }
};
