/**
 * Style Value Normalization Utilities
 * Converts CSS computed styles to input-friendly formats
 */

/**
 * Convert RGB/RGBA color to hex
 */
export function rgbToHex(rgb: string): string {
  // Already hex
  if (rgb.startsWith('#')) return rgb;

  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return '#000000'; // Fallback

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  const hex = ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();

  return `#${hex}`;
}

/**
 * Normalize color value for color input
 */
export function normalizeColor(value: string): string {
  if (!value || value === 'transparent' || value === 'inherit' || value === 'initial') {
    return '#000000';
  }

  if (value.startsWith('rgb')) {
    return rgbToHex(value);
  }

  if (value.startsWith('#')) {
    return value;
  }

  // Named colors - return black as fallback
  return '#000000';
}
