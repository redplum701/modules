/**
 * fullwidth-halfwidth
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts between full-width and half-width letters, digits, symbols, and
 *   spaces (ＡＢＣ１２３！ and ABC123!). Each group can be switched on or off.
 *   Kana are not touched; see halfwidth-kana for those.
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
 *   - Unicode Consortium. Halfwidth and Fullwidth Forms (U+FF00-U+FFEF) code chart.
 *     https://www.unicode.org/charts/PDF/UFF00.pdf
 *   - Unicode Consortium. Unicode Standard Annex #11: East Asian Width.
 *     https://www.unicode.org/reports/tr11/
 *   - MDN Web Docs. String.fromCharCode(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode
 */

// Full-width ASCII (U+FF01 to U+FF5E) is the normal ASCII range (U+0021 to
// U+007E) moved up by this amount. The full-width space is separate (U+3000).
const OFFSET = 0xfee0;

// Full-width currency and symbol forms that have a half-width partner outside ASCII.
const FULL_TO_HALF_SYMBOLS = new Map([
  ["\uFFE0", "\u00A2"], // ￠ -> ¢
  ["\uFFE1", "\u00A3"], // ￡ -> £
  ["\uFFE2", "\u00AC"], // ￢ -> ¬
  ["\uFFE3", "\u00AF"], // ￣ -> ¯
  ["\uFFE4", "\u00A6"], // ￤ -> ¦
  ["\uFFE5", "\u00A5"], // ￥ -> ¥
  ["\uFFE6", "\u20A9"], // ￦ -> ₩
]);
const HALF_TO_FULL_SYMBOLS = new Map(
  [...FULL_TO_HALF_SYMBOLS].map(([full, half]) => [half, full])
);

const TO_HALFWIDTH_PATTERN = /[\u3000\uFF01-\uFF5E\uFFE0-\uFFE6]/g;
const TO_FULLWIDTH_PATTERN = /[\u0020-\u007E\u00A2\u00A3\u00A5\u00A6\u00AC\u00AF\u20A9]/g;

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

// Which option controls this half-width character?
function groupOf(halfwidth) {
  if (halfwidth === " ") return "spaces";
  if (/[A-Za-z]/.test(halfwidth)) return "letters";
  if (/[0-9]/.test(halfwidth)) return "digits";
  return "symbols";
}

function readOptions(options) {
  const { letters = true, digits = true, symbols = true, spaces = true } = options;
  return { letters, digits, symbols, spaces };
}

/**
 * Converts full-width letters, digits, symbols, and the ideographic space to
 * their half-width forms: "ＡＢＣ１２３！　￥" -> "ABC123! ¥".
 *
 * Kana, kanji, and other characters are left unchanged. The wave dash "〜"
 * (U+301C) is a different character from the full-width tilde "～" and is
 * not converted.
 *
 * @param {string} text - The text to convert.
 * @param {object} [options] - Turn groups off with false. All default to true.
 * @param {boolean} [options.letters=true] - Ａ-Ｚ ａ-ｚ
 * @param {boolean} [options.digits=true] - ０-９
 * @param {boolean} [options.symbols=true] - Punctuation and symbols, including ￥
 * @param {boolean} [options.spaces=true] - The ideographic space (U+3000)
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function toHalfwidth(text, options = {}) {
  assertText(text, "toHalfwidth");
  const enabled = readOptions(options);

  return text.replace(TO_HALFWIDTH_PATTERN, (char) => {
    const code = char.charCodeAt(0);
    let half;
    if (char === "\u3000") {
      half = " ";
    } else if (code >= 0xff01 && code <= 0xff5e) {
      half = String.fromCharCode(code - OFFSET);
    } else {
      half = FULL_TO_HALF_SYMBOLS.get(char);
    }
    return enabled[groupOf(half)] ? half : char;
  });
}

/**
 * Converts half-width letters, digits, symbols, and spaces to their
 * full-width forms: "ABC123! ¥" -> "ＡＢＣ１２３！　￥".
 *
 * Half-width katakana is not converted here. Use toFullwidthKana from the
 * halfwidth-kana module for that.
 *
 * @param {string} text - The text to convert.
 * @param {object} [options] - Turn groups off with false. All default to true.
 * @param {boolean} [options.letters=true] - A-Z a-z
 * @param {boolean} [options.digits=true] - 0-9
 * @param {boolean} [options.symbols=true] - Punctuation and symbols, including ¥
 * @param {boolean} [options.spaces=true] - The normal space (U+0020)
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function toFullwidth(text, options = {}) {
  assertText(text, "toFullwidth");
  const enabled = readOptions(options);

  return text.replace(TO_FULLWIDTH_PATTERN, (char) => {
    if (!enabled[groupOf(char)]) return char;
    if (char === " ") return "\u3000";
    const code = char.charCodeAt(0);
    if (code >= 0x21 && code <= 0x7e) {
      return String.fromCharCode(code + OFFSET);
    }
    return HALF_TO_FULL_SYMBOLS.get(char);
  });
}
