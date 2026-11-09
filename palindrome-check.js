/**
 * palindrome-check
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Checks whether text reads the same forward and backward. By default it
 *   ignores case, spaces, and punctuation, and it compares whole
 *   user-perceived characters (grapheme clusters), so emoji and accented
 *   letters are not split apart.
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
 *   - Wikipedia. Palindrome.
 *     https://en.wikipedia.org/wiki/Palindrome
 *   - MDN Web Docs. String.prototype.normalize(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 *   - MDN Web Docs. Intl.Segmenter. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 *   - Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.
 *     https://unicode.org/reports/tr29/
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
 * Checks whether text is a palindrome.
 *
 * Steps: normalize the text, optionally strip accents, lowercase it, remove
 * characters that are not letters, numbers, or combining marks, then compare
 * grapheme clusters from both ends.
 *
 * An empty string (or a string that is empty after cleaning) counts as a
 * palindrome, as does a single character.
 *
 * @param {string} text - The text to check.
 * @param {object} [options]
 * @param {boolean} [options.ignoreCase=true] - Treat "A" and "a" as equal.
 * @param {boolean} [options.ignoreNonAlphanumeric=true] - Ignore spaces,
 *   punctuation, symbols, and emoji.
 * @param {boolean} [options.ignoreAccents=false] - Treat "é" and "e" as equal.
 * @returns {boolean}
 * @throws {TypeError} If text is not a string.
 */
export function isPalindrome(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("isPalindrome: expected a string.");
  }
  const { ignoreCase = true, ignoreNonAlphanumeric = true, ignoreAccents = false } = options;

  let cleaned = text.normalize("NFC");
  if (ignoreAccents) {
    // Split letters from their accents (NFD), drop the accents, then recombine.
    cleaned = cleaned.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  }
  if (ignoreCase) {
    cleaned = cleaned.toLowerCase();
  }
  if (ignoreNonAlphanumeric) {
    // Keep letters, numbers, and combining marks (so accents stay with their letters).
    cleaned = cleaned.replace(/[^\p{L}\p{N}\p{M}]/gu, "");
  }

  const characters = splitGraphemes(cleaned);
  for (let left = 0, right = characters.length - 1; left < right; left += 1, right -= 1) {
    if (characters[left] !== characters[right]) return false;
  }
  return true;
}
