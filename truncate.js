/**
 * truncate
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Shortens text to a maximum number of user-perceived characters (grapheme
 *   clusters) and adds an ellipsis. It never cuts an emoji or an accented
 *   letter in half, and the ellipsis counts toward the limit.
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
 *   - MDN Web Docs. Intl.Segmenter. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 *   - Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.
 *     https://unicode.org/reports/tr29/
 *   - MDN Web Docs. Array.prototype.slice(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
 */

let graphemeSegmenter;

// Splits text into user-perceived characters (grapheme clusters), so an emoji
// family, a flag, or "e" plus an accent each stay in one piece.
function splitGraphemes(text) {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    throw new Error("This module needs Intl.Segmenter (Node.js 16+ or a modern browser).");
  }
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return Array.from(graphemeSegmenter.segment(text), (item) => item.segment);
}

/**
 * Shortens text to at most maxLength characters, ending with an ellipsis.
 *
 * Length is counted in grapheme clusters, and the ellipsis is included in the
 * count, so the result is never longer than maxLength. Text that already fits
 * is returned unchanged.
 *
 * @param {string} text - The text to shorten.
 * @param {number} maxLength - Maximum length of the result (integer >= 0, or Infinity).
 * @param {object} [options]
 * @param {string} [options.ellipsis="…"] - Text added at the end when shortened.
 *   Use "" for a plain cut.
 * @returns {string}
 * @throws {TypeError} If text or ellipsis is not a string, or maxLength is not a number.
 * @throws {RangeError} If maxLength is invalid, or the text must be shortened
 *   but maxLength is smaller than the ellipsis.
 */
export function truncate(text, maxLength, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("truncate: text must be a string.");
  }
  if (typeof maxLength !== "number") {
    throw new TypeError("truncate: maxLength must be a number.");
  }
  if (maxLength !== Infinity && !(Number.isInteger(maxLength) && maxLength >= 0)) {
    throw new RangeError("truncate: maxLength must be a non-negative integer or Infinity.");
  }

  const { ellipsis = "…" } = options;
  if (typeof ellipsis !== "string") {
    throw new TypeError("truncate: ellipsis must be a string.");
  }

  const characters = splitGraphemes(text);
  if (characters.length <= maxLength) return text;

  const ellipsisLength = splitGraphemes(ellipsis).length;
  if (ellipsisLength > maxLength) {
    throw new RangeError("truncate: maxLength is smaller than the ellipsis.");
  }

  return characters.slice(0, maxLength - ellipsisLength).join("") + ellipsis;
}
