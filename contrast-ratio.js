/**
 * contrast-ratio
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   WCAG 2 contrast: the relative luminance of a color, the contrast ratio
 *   between two colors (1 to 21), a pass/fail check against the AA and AAA
 *   levels, and a helper that picks the most readable text color for a
 *   background.
 *
 * ---------------------------------------------------------------------------
 * MIT License
 *
 * Copyright (c) 2026 紅梅
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------
 *
 * References:
 *   - W3C. Web Content Accessibility Guidelines (WCAG) 2.2: relative luminance.
 *     https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 *   - W3C. Understanding Success Criterion 1.4.3: Contrast (Minimum).
 *     https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
 *   - W3C. Understanding Success Criterion 1.4.11: Non-text Contrast.
 *     https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
 *   - Wikipedia. sRGB (the transfer function).
 *     https://en.wikipedia.org/wiki/SRGB
 */

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// Reads a HEX string or { r, g, b } object. Any alpha is ignored.
function readRgb(color, name) {
  if (typeof color === "string") {
    const match = HEX_PATTERN.exec(color.trim());
    if (!match) throw new RangeError(`${name} is not a valid HEX color.`);

    let digits = match[1];
    if (digits.length <= 4) digits = digits.split("").map((char) => char + char).join("");
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
    };
  }

  if (typeof color === "object" && color !== null) {
    for (const channel of ["r", "g", "b"]) {
      const value = color[channel];
      if (typeof value !== "number" || !(value >= 0 && value <= 255)) {
        throw new RangeError(`${name}.${channel} must be a number from 0 to 255.`);
      }
    }
    return { r: color.r, g: color.g, b: color.b };
  }

  throw new TypeError(`${name} must be a HEX string or an { r, g, b } object.`);
}

// Undoes the sRGB gamma curve: from a 0..255 channel to linear light (0..1).
function toLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/**
 * The WCAG relative luminance of a color: 0 for black up to 1 for white.
 * The three channels are weighted by how bright the eye finds each one
 * (green most, blue least).
 *
 * @param {string|{r: number, g: number, b: number}} color - A HEX string
 *   (#rgb, #rrggbb; alpha is ignored) or an object with r, g, b from 0 to 255.
 * @returns {number}
 * @throws {TypeError} If color is not a string or object.
 * @throws {RangeError} If color is not a valid color.
 */
export function relativeLuminance(color) {
  const { r, g, b } = readRgb(color, "color");
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * The WCAG contrast ratio between two colors: (lighter + 0.05) / (darker + 0.05),
 * from 1 (no contrast) to 21 (black on white). The order of the colors does not matter.
 *
 * Do not round the ratio before comparing it with a limit: 4.499 does not
 * pass the 4.5 limit.
 *
 * @param {string|{r: number, g: number, b: number}} color1 - A HEX string or { r, g, b }.
 * @param {string|{r: number, g: number, b: number}} color2 - A HEX string or { r, g, b }.
 * @returns {number}
 * @throws {TypeError} If a color is not a string or object.
 * @throws {RangeError} If a color is not valid.
 */
export function contrastRatio(color1, color2) {
  const first = relativeLuminance(color1);
  const second = relativeLuminance(color2);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * Checks a pair of colors against the WCAG 2 contrast levels.
 *
 *   normal text: AA needs 4.5, AAA needs 7
 *   large text (18 pt, or 14 pt bold, and above): AA needs 3, AAA needs 4.5
 *   user interface parts and graphics: need 3
 *
 * @param {string|{r: number, g: number, b: number}} foreground - The text (or icon) color.
 * @param {string|{r: number, g: number, b: number}} background - The background color.
 * @returns {{ratio: number, normalText: {aa: boolean, aaa: boolean},
 *   largeText: {aa: boolean, aaa: boolean}, uiComponents: boolean}}
 * @throws {TypeError} If a color is not a string or object.
 * @throws {RangeError} If a color is not valid.
 */
export function wcagCompliance(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    normalText: { aa: ratio >= 4.5, aaa: ratio >= 7 },
    largeText: { aa: ratio >= 3, aaa: ratio >= 4.5 },
    uiComponents: ratio >= 3,
  };
}

/**
 * Picks the most readable color for text on a background: the candidate with
 * the highest contrast ratio. If two candidates tie, the first one wins.
 *
 * @param {string|{r: number, g: number, b: number}} background - The background color.
 * @param {Array<string|{r: number, g: number, b: number}>} [candidates=["#000000", "#ffffff"]] -
 *   The text colors to choose from (at least one).
 * @returns {string|{r: number, g: number, b: number}} One of the candidates, as given.
 * @throws {TypeError} If a color is not a string or object, or candidates is not an array.
 * @throws {RangeError} If a color is not valid, or candidates is empty.
 */
export function bestTextColor(background, candidates = ["#000000", "#ffffff"]) {
  if (!Array.isArray(candidates)) {
    throw new TypeError("bestTextColor: candidates must be an array.");
  }
  if (candidates.length === 0) {
    throw new RangeError("bestTextColor: candidates must not be empty.");
  }

  let best = candidates[0];
  let bestRatio = contrastRatio(best, background);
  for (const candidate of candidates.slice(1)) {
    const ratio = contrastRatio(candidate, background);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }
  return best;
}
