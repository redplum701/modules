/**
 * grapheme-count
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Counts the user-perceived characters (grapheme clusters) in a string using
 *   Intl.Segmenter. Also reports the other kinds of length side by side:
 *   code points, UTF-16 code units, and UTF-8 bytes.
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
 *   - MDN Web Docs. TextEncoder. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
 */

let graphemeSegmenter;

function getSegmenter() {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    throw new Error("This module needs Intl.Segmenter (Node.js 16+ or a modern browser).");
  }
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return graphemeSegmenter;
}

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

/**
 * Counts user-perceived characters (grapheme clusters).
 *
 * "👨‍👩‍👧‍👦" is 1, "🇯🇵" is 1, and "e" + a combining accent is 1,
 * while text.length would say 11, 4, and 2.
 *
 * @param {string} text - The text to count.
 * @returns {number}
 * @throws {TypeError} If text is not a string.
 */
export function countGraphemes(text) {
  assertText(text, "countGraphemes");
  let count = 0;
  // Loop instead of building an array, so long text does not use extra memory.
  for (const _segment of getSegmenter().segment(text)) {
    count += 1;
  }
  return count;
}

/**
 * Reports every common kind of text length at once.
 *
 * @param {string} text - The text to measure.
 * @returns {{graphemes: number, codePoints: number, codeUnits: number, bytes: number}}
 *   graphemes: user-perceived characters
 *   codePoints: Unicode code points
 *   codeUnits: UTF-16 code units (what text.length returns)
 *   bytes: size in UTF-8 (lone surrogates are counted as U+FFFD, 3 bytes)
 * @throws {TypeError} If text is not a string.
 */
export function measureText(text) {
  assertText(text, "measureText");
  return {
    graphemes: countGraphemes(text),
    codePoints: Array.from(text).length,
    codeUnits: text.length,
    bytes: new TextEncoder().encode(text).length,
  };
}
