/**
 * reverse-string
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Reverses a string by user-perceived characters (grapheme clusters), so
 *   emoji, flags, and letters with accents are not torn apart the way
 *   text.split("").reverse().join("") would tear them.
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
 *   - MDN Web Docs. Array.prototype.reverse(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
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
 * Reverses a string one grapheme cluster at a time.
 *
 * "abc"       -> "cba"
 * "e" + accent + "a" -> "a" + "e" + accent (the accent stays with its letter)
 * a family emoji stays one emoji
 *
 * Note: this reverses the order of characters only. It does not apply
 * right-to-left (bidirectional) text rules.
 *
 * @param {string} text - The text to reverse.
 * @returns {string} The reversed text.
 * @throws {TypeError} If text is not a string.
 */
export function reverseString(text) {
  if (typeof text !== "string") {
    throw new TypeError("reverseString: expected a string.");
  }
  return splitGraphemes(text).reverse().join("");
}
