/**
 * char-frequency
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Counts how many times each character appears in a string. Characters are
 *   counted by Unicode code point, so emoji and other characters outside the
 *   Basic Multilingual Plane count as one. Includes a most-common helper.
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
 *   - MDN Web Docs. String.prototype[Symbol.iterator](). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator
 *   - MDN Web Docs. Map. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *   - Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.
 *     https://unicode.org/reports/tr29/
 */

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

/**
 * Counts each character in a string.
 *
 * Characters are Unicode code points (a string iterator keeps surrogate pairs
 * together, so "😀" counts once). Combined characters such as "é" written as
 * "e" + an accent are counted as two code points.
 *
 * @param {string} text - The text to count.
 * @param {object} [options]
 * @param {boolean} [options.ignoreCase=false] - Count "A" and "a" together
 *   (characters are lowercased first).
 * @param {boolean} [options.ignoreWhitespace=false] - Skip spaces, tabs, and newlines.
 * @returns {Map<string, number>} Characters in order of first appearance.
 * @throws {TypeError} If text is not a string.
 */
export function charFrequency(text, options = {}) {
  assertText(text, "charFrequency");
  const { ignoreCase = false, ignoreWhitespace = false } = options;

  const counts = new Map();
  for (const char of ignoreCase ? text.toLowerCase() : text) {
    if (ignoreWhitespace && /\s/u.test(char)) continue;
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  return counts;
}

/**
 * Returns the most frequent characters, highest count first.
 * Characters with the same count stay in order of first appearance.
 *
 * @param {string} text - The text to count.
 * @param {number} [limit=Infinity] - Maximum number of results.
 * @param {object} [options] - Same options as charFrequency.
 * @returns {Array<[string, number]>} Pairs of [character, count].
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If limit is not a non-negative integer or Infinity.
 */
export function mostCommonChars(text, limit = Infinity, options = {}) {
  assertText(text, "mostCommonChars");
  if (limit !== Infinity && !(Number.isInteger(limit) && limit >= 0)) {
    throw new RangeError("mostCommonChars: limit must be a non-negative integer or Infinity.");
  }

  // Array.prototype.sort is stable, so ties keep their first-appearance order.
  return [...charFrequency(text, options)]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
