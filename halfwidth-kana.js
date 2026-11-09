/**
 * halfwidth-kana
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts between half-width katakana (ｱｲｳ) and full-width katakana (アイウ),
 *   including the voiced and semi-voiced sound marks: ｶﾞ becomes ガ and ﾊﾟ
 *   becomes パ. Punctuation (｡｢｣､･) is converted too, unless turned off.
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
 *   - Unicode Consortium. Katakana (U+30A0-U+30FF) code chart.
 *     https://www.unicode.org/charts/PDF/U30A0.pdf
 *   - MDN Web Docs. String.prototype.replace(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 */

// Half-width and full-width forms, in the same order (U+FF61 to U+FF9D).
const HALFWIDTH = "｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const FULLWIDTH = "。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

// Full-width kana that have a voiced form (with ゛), and that form.
const VOICED_BASE = "ウカキクケコサシスセソタチツテトハヒフヘホワヲ";
const VOICED_FORM = "ヴガギグゲゴザジズゼゾダヂヅデドバビブベボヷヺ";

// Full-width kana that have a semi-voiced form (with ゜), and that form.
const SEMI_VOICED_BASE = "ハヒフヘホ";
const SEMI_VOICED_FORM = "パピプペポ";

const HALFWIDTH_VOICED_MARK = "ﾞ";
const HALFWIDTH_SEMI_VOICED_MARK = "ﾟ";
const FULLWIDTH_VOICED_MARK = "゛";
const FULLWIDTH_SEMI_VOICED_MARK = "゜";

const PUNCTUATION = new Set(Array.from("。「」、・"));
const HALFWIDTH_PUNCTUATION = new Set(Array.from("｡｢｣､･"));

function pairUp(keys, values) {
  const keyList = Array.from(keys);
  const valueList = Array.from(values);
  return new Map(keyList.map((key, index) => [key, valueList[index]]));
}

const HALF_TO_FULL = pairUp(HALFWIDTH, FULLWIDTH);
const VOICED = pairUp(VOICED_BASE, VOICED_FORM);
const SEMI_VOICED = pairUp(SEMI_VOICED_BASE, SEMI_VOICED_FORM);

// Full-width to half-width: plain kana, then voiced forms as base + mark.
const FULL_TO_HALF = pairUp(FULLWIDTH, HALFWIDTH);
for (const [base, form] of VOICED) {
  FULL_TO_HALF.set(form, FULL_TO_HALF.get(base) + HALFWIDTH_VOICED_MARK);
}
for (const [base, form] of SEMI_VOICED) {
  FULL_TO_HALF.set(form, FULL_TO_HALF.get(base) + HALFWIDTH_SEMI_VOICED_MARK);
}
FULL_TO_HALF.set(FULLWIDTH_VOICED_MARK, HALFWIDTH_VOICED_MARK);
FULL_TO_HALF.set(FULLWIDTH_SEMI_VOICED_MARK, HALFWIDTH_SEMI_VOICED_MARK);

// A half-width character, optionally followed by a voiced or semi-voiced mark.
// The second alternative catches a mark with nothing in front of it.
const HALFWIDTH_PATTERN = /([\uFF61-\uFF9D])([\uFF9E\uFF9F])?|[\uFF9E\uFF9F]/g;
const FULLWIDTH_PATTERN = new RegExp(`[${[...FULL_TO_HALF.keys()].join("")}]`, "g");

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

/**
 * Converts half-width katakana to full-width katakana.
 * A voiced or semi-voiced mark is joined to the letter before it:
 * "ｶﾞ" -> "ガ", "ﾊﾟ" -> "パ", "ｳﾞ" -> "ヴ".
 * A mark that cannot join (such as "ｱﾞ") becomes a separate full-width mark.
 *
 * @param {string} text - Text that may contain half-width katakana.
 * @param {object} [options]
 * @param {boolean} [options.punctuation=true] - Also convert ｡｢｣､･ to 。「」、・.
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function toFullwidthKana(text, options = {}) {
  assertText(text, "toFullwidthKana");
  const { punctuation = true } = options;

  return text.replace(HALFWIDTH_PATTERN, (match, base, mark) => {
    if (base === undefined) {
      // A mark on its own.
      return match === HALFWIDTH_VOICED_MARK ? FULLWIDTH_VOICED_MARK : FULLWIDTH_SEMI_VOICED_MARK;
    }
    if (!punctuation && HALFWIDTH_PUNCTUATION.has(base)) return match;

    const full = HALF_TO_FULL.get(base);
    if (mark === HALFWIDTH_VOICED_MARK && VOICED.has(full)) return VOICED.get(full);
    if (mark === HALFWIDTH_SEMI_VOICED_MARK && SEMI_VOICED.has(full)) return SEMI_VOICED.get(full);

    if (mark === undefined) return full;
    return full + (mark === HALFWIDTH_VOICED_MARK ? FULLWIDTH_VOICED_MARK : FULLWIDTH_SEMI_VOICED_MARK);
  });
}

/**
 * Converts full-width katakana to half-width katakana.
 * Voiced letters are split into letter + mark: "ガ" -> "ｶﾞ", "パ" -> "ﾊﾟ".
 * Letters with no half-width form (ヮ ヰ ヱ ヵ ヶ) and hiragana are left as they are.
 *
 * @param {string} text - Text that may contain full-width katakana.
 * @param {object} [options]
 * @param {boolean} [options.punctuation=true] - Also convert 。「」、・ to ｡｢｣､･.
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function toHalfwidthKana(text, options = {}) {
  assertText(text, "toHalfwidthKana");
  const { punctuation = true } = options;

  return text.replace(FULLWIDTH_PATTERN, (char) => {
    if (!punctuation && PUNCTUATION.has(char)) return char;
    return FULL_TO_HALF.get(char);
  });
}
