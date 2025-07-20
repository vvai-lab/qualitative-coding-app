// Color utility functions for automatic code color assignment

export class ColorGenerator {
  // Predefined set of visually distinct colors for qualitative coding
  static PRESET_COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#eab308', // Yellow
    '#dc2626', // Dark Red
    '#2563eb', // Dark Blue
    '#059669', // Dark Green
    '#d97706', // Dark Amber
    '#7c3aed', // Dark Purple
    '#0891b2', // Dark Cyan
    '#ea580c', // Dark Orange
    '#65a30d', // Dark Lime
    '#db2777', // Dark Pink
    '#4f46e5', // Dark Indigo
    '#0d9488', // Dark Teal
    '#ca8a04', // Dark Yellow
  ];

  // Track which colors have been used
  static usedColors = new Set();

  // Get the next available color from preset colors
  static getNextPresetColor() {
    for (const color of this.PRESET_COLORS) {
      if (!this.usedColors.has(color)) {
        this.usedColors.add(color);
        return color;
      }
    }
    
    // If all preset colors are used, generate a random one
    return this.generateRandomColor();
  }

  // Generate a random color that's not too light or too dark
  static generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
    const lightness = 45 + Math.floor(Math.random() * 20);  // 45-65%
    
    return this.hslToHex(hue, saturation, lightness);
  }

  // Convert HSL to HEX
  static hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // Mark a color as used (when loading existing codes)
  static markColorAsUsed(color) {
    if (color) {
      this.usedColors.add(color.toLowerCase());
    }
  }

  // Reset color tracking (useful when loading a new project)
  static resetUsedColors() {
    this.usedColors.clear();
  }

  // Initialize color tracking based on existing codes
  static initializeFromExistingCodes(codes) {
    this.resetUsedColors();
    codes.forEach(code => {
      if (code.color) {
        this.markColorAsUsed(code.color);
      }
    });
  }

  // Get a color for a new code, ensuring it's unique
  static getColorForNewCode(existingCodes = []) {
    // Initialize if needed
    if (this.usedColors.size === 0 && existingCodes.length > 0) {
      this.initializeFromExistingCodes(existingCodes);
    }
    
    return this.getNextPresetColor();
  }
}
