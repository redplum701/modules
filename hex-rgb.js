/**
 * hex-rgb
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts colors between HEX strings and RGB objects.
 *   Supports 3, 4, 6, and 8 digit HEX (with or without "#").
 *   The 4 and 8 digit forms carry an alpha channel.
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
 *   - W3C. CSS Color Module Level 4, Section 6.2: RGB hex notations.
 *     https://www.w3.org/TR/css-color-4/#hex-notation
 *   - MDN Web Docs. parseInt(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
 *   - MDN Web Docs. Number.prototype.toString(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString
 */

// Matches 3, 4, 6, or 8 hex digits, with an optional leading "#".
const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Checks whether a value is a valid HEX color string.
 *
 * @param {*} value - Anything.
 * @returns {boolean} True if the value is a valid HEX color string.
 */
export function isHex(value) {
  return typeof value === "string" && HEX_PATTERN.test(value.trim());
}

/**
 * Converts a HEX color string to an RGB object.
 *
 * @param {string} hex - "#f80", "ff8800", "#ff880080", etc.
 * @returns {{r: number, g: number, b: number, a?: number}}
 *   r, g, b are integers from 0 to 255.
 *   a is from 0 to 1 and only appears when the input has an alpha channel.
 * @throws {TypeError} If hex is not a string.
 * @throws {RangeError} If hex is not a valid HEX color.
 */
export function hexToRgb(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToRgb: expected a string.");
  }

  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) {
    throw new RangeError(`hexToRgb: invalid HEX color "${hex}".`);
  }

  let digits = match[1];

  // Expand shorthand: "f80" -> "ff8800", "f808" -> "ff880088"
  if (digits.length <= 4) {
    digits = digits
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(digits.slice(0, 2), 16);
  const g = parseInt(digits.slice(2, 4), 16);
  const b = parseInt(digits.slice(4, 6), 16);

  if (digits.length === 8) {
    // Round alpha to two decimal places, e.g. 0x80 -> 0.5
    const a = Math.round((parseInt(digits.slice(6, 8), 16) / 255) * 100) / 100;
    return { r, g, b, a };
  }

  return { r, g, b };
}

/**
 * Checks that a value is an integer from 0 to 255.
 *
 * @param {*} value - The value to check.
 * @param {string} name - Channel name used in the error message.
 * @returns {number} The same value.
 * @throws {RangeError} If the value is not an integer from 0 to 255.
 */
function checkByte(value, name) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError(`rgbToHex: ${name} must be an integer from 0 to 255.`);
  }
  return value;
}

/**
 * Converts a number from 0 to 255 to a two-digit lowercase HEX string.
 *
 * @param {number} byte - Integer from 0 to 255.
 * @returns {string} Two hex digits, e.g. 10 -> "0a".
 */
function toHexByte(byte) {
  return byte.toString(16).padStart(2, "0");
}

/**
 * Converts an RGB object to a lowercase HEX color string.
 *
 * @param {{r: number, g: number, b: number, a?: number}} rgb
 *   r, g, b are integers from 0 to 255. a is optional, from 0 to 1.
 * @returns {string} "#rrggbb", or "#rrggbbaa" when a is given.
 * @throws {TypeError} If rgb is not an object.
 * @throws {RangeError} If any channel is out of range.
 */
export function rgbToHex(rgb) {
  if (typeof rgb !== "object" || rgb === null) {
    throw new TypeError("rgbToHex: expected an object like { r, g, b }.");
  }

  const r = checkByte(rgb.r, "r");
  const g = checkByte(rgb.g, "g");
  const b = checkByte(rgb.b, "b");
  let result = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;

  if (rgb.a !== undefined) {
    if (typeof rgb.a !== "number" || Number.isNaN(rgb.a) || rgb.a < 0 || rgb.a > 1) {
      throw new RangeError("rgbToHex: a must be a number from 0 to 1.");
    }
    result += toHexByte(Math.round(rgb.a * 255));
  }

  return result;
}
