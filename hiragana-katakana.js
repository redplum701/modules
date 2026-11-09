/**
 * hiragana-katakana
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts between hiragana and (full-width) katakana, and checks whether
 *   text is all hiragana or all katakana. Other characters, including kanji,
 *   the prolonged sound mark, and half-width kana, are left unchanged.
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
 *   - Unicode Consortium. Hiragana (U+3040-U+309F) code chart.
 *     https://www.unicode.org/charts/PDF/U3040.pdf
 *   - Unicode Consortium. Katakana (U+30A0-U+30FF) code chart.
 *     https://www.unicode.org/charts/PDF/U30A0.pdf
 *   - MDN Web Docs. String.prototype.replace(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 */

// Katakana letters sit exactly 0x60 code points after the matching hiragana.
const OFFSET = 0x60;

// Hiragana: ぁ-ゖ (U+3041-U+3096) and the iteration marks ゝゞ (U+309D, U+309E).
const HIRAGANA_PATTERN = /[\u3041-\u3096\u309D\u309E]/g;

// Katakana that have a hiragana partner: ァ-ヶ (U+30A1-U+30F6) and ヽヾ (U+30FD, U+30FE).
// (ヷ ヸ ヹ ヺ have no hiragana, so they are not included.)
const KATAKANA_PATTERN = /[\u30A1-\u30F6\u30FD\u30FE]/g;

// For the checks: letters plus the prolonged sound mark ー (U+30FC).
const ALL_HIRAGANA = /^[\u3041-\u3096\u309D\u309E\u30FC]+$/;
const ALL_KATAKANA = /^[\u30A1-\u30FA\u30FD\u30FE\u30FC]+$/;

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

function shift(char, amount) {
  return String.fromCharCode(char.charCodeAt(0) + amount);
}

/**
 * Converts hiragana to katakana: "ひらがな" -> "ヒラガナ".
 * Everything else (kanji, ー, ASCII, half-width kana) is left unchanged.
 *
 * @param {string} text - The text to convert.
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function toKatakana(text) {
  assertText(text, "toKatakana");
  return text.replace(HIRAGANA_PATTERN, (char) => shift(char, OFFSET));
}

/**
 * Converts katakana to hiragana: "カタカナ" -> "かたかな".
 * Katakana with no hiragana partner (ヷ ヸ ヹ ヺ) and everything else are
 * left unchanged. Half-width katakana is not converted: use
 * toFullwidthKana (halfwidth-kana module) first.
 *
 * @param {string} text - The text to convert.
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function toHiragana(text) {
  assertText(text, "toHiragana");
  return text.replace(KATAKANA_PATTERN, (char) => shift(char, -OFFSET));
}

/**
 * Checks whether text is made only of hiragana (the prolonged sound mark ー
 * is allowed). An empty string is not hiragana.
 *
 * @param {string} text - The text to check.
 * @returns {boolean}
 * @throws {TypeError} If text is not a string.
 */
export function isHiragana(text) {
  assertText(text, "isHiragana");
  return ALL_HIRAGANA.test(text);
}

/**
 * Checks whether text is made only of full-width katakana (the prolonged
 * sound mark ー is allowed). An empty string is not katakana.
 *
 * @param {string} text - The text to check.
 * @returns {boolean}
 * @throws {TypeError} If text is not a string.
 */
export function isKatakana(text) {
  assertText(text, "isKatakana");
  return ALL_KATAKANA.test(text);
}
