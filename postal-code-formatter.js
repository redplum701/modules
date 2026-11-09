/**
 * postal-code-formatter
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Formats Japanese postal codes as NNN-NNNN. Accepts messy input such as
 *   full-width digits, different hyphens, spaces, and the postal mark 〒.
 *   It checks the format only (7 digits), not whether the code exists.
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
 *   - Japan Post. 郵便番号 (Postal codes).
 *     https://www.post.japanpost.jp/zipcode/
 *   - Wikipedia. Postal codes in Japan.
 *     https://en.wikipedia.org/wiki/Postal_codes_in_Japan
 *   - MDN Web Docs. String.prototype.normalize(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */

// 3 digits, an optional separator, then 4 digits. The separator can be a
// hyphen or dash of any kind, the prolonged sound mark ー (often typed by
// mistake), or whitespace.
const POSTAL_CODE_PATTERN = /^(\d{3})(?:\s*[-\u2010-\u2015\u2212\u30FC]\s*|\s+)?(\d{4})$/;

// Turns the input into { upper, lower } or null.
// NFKC turns full-width digits and hyphens into plain ASCII.
function readPostalCode(input) {
  const text = input
    .normalize("NFKC")
    .trim()
    .replace(/^\u3012\s*/, ""); // remove a leading postal mark 〒

  const match = POSTAL_CODE_PATTERN.exec(text);
  return match ? { upper: match[1], lower: match[2] } : null;
}

/**
 * Reads a Japanese postal code.
 *
 * @param {string} input - "1000001", "100-0001", "〒１００－０００１", etc.
 * @returns {{digits: string, upper: string, lower: string} | null}
 *   digits: all 7 digits. upper: the first 3. lower: the last 4.
 *   null if the input is not a 7-digit postal code.
 * @throws {TypeError} If input is not a string.
 */
export function parsePostalCode(input) {
  if (typeof input !== "string") {
    throw new TypeError("parsePostalCode: expected a string.");
  }
  const code = readPostalCode(input);
  return code ? { digits: code.upper + code.lower, upper: code.upper, lower: code.lower } : null;
}

/**
 * Formats a Japanese postal code as NNN-NNNN.
 *
 * @param {string} input - A postal code in almost any common written form.
 * @param {object} [options]
 * @param {string} [options.separator="-"] - Text between the two parts.
 * @param {boolean} [options.prefix=false] - Add the postal mark: "〒100-0001".
 * @returns {string|null} The formatted code, or null if the input is not a 7-digit postal code.
 * @throws {TypeError} If input is not a string, or separator is not a string.
 */
export function formatPostalCode(input, options = {}) {
  const { separator = "-", prefix = false } = options;
  if (typeof separator !== "string") {
    throw new TypeError("formatPostalCode: separator must be a string.");
  }

  const parsed = parsePostalCode(input);
  if (parsed === null) return null;
  return (prefix ? "\u3012" : "") + parsed.upper + separator + parsed.lower;
}

/**
 * Checks whether a string is a 7-digit Japanese postal code.
 * Never throws: non-strings return false.
 *
 * Only the format is checked. A code such as 000-0000 passes even though it
 * is not assigned to any area.
 *
 * @param {*} input - Anything.
 * @returns {boolean}
 */
export function isPostalCode(input) {
  return typeof input === "string" && readPostalCode(input) !== null;
}
