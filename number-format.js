/**
 * number-format
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Formats numbers with thousands separators. Works with numbers, BigInt, and
 *   numeric strings (so very large values keep every digit). Separators and
 *   group size are configurable.
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
 *   - MDN Web Docs. Intl.NumberFormat. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 *   - MDN Web Docs. Lookahead assertion. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */

// Converts the input to a plain decimal string like "-1234.5".
function toNumericString(value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("formatNumber: number must be finite.");
    }
    const text = String(value);
    if (/e/i.test(text)) {
      // Very large or very small numbers print in exponent form (1e+21).
      throw new RangeError("formatNumber: exponent notation is not supported. Pass a string or BigInt instead.");
    }
    return text;
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (!/^-?\d+(\.\d+)?$/.test(text)) {
      throw new RangeError(`formatNumber: "${value}" is not a plain decimal number.`);
    }
    return text;
  }

  throw new TypeError("formatNumber: expected a number, BigInt, or numeric string.");
}

/**
 * Adds thousands separators to a number.
 *
 * @param {number|bigint|string} value - e.g. 1234567.89, 12345678901234567890n, "-9876543.21"
 * @param {object} [options]
 * @param {string} [options.separator=","] - Group separator.
 * @param {string} [options.decimalSeparator="."] - Decimal separator.
 * @param {number} [options.groupSize=3] - Digits per group (use 4 for 万-style grouping).
 * @returns {string}
 * @throws {TypeError} If value is not a number, BigInt, or string.
 * @throws {RangeError} If value or groupSize is invalid.
 */
export function formatNumber(value, options = {}) {
  const { separator = ",", decimalSeparator = ".", groupSize = 3 } = options;

  if (!Number.isInteger(groupSize) || groupSize < 1) {
    throw new RangeError("formatNumber: groupSize must be a positive integer.");
  }

  const text = toNumericString(value);
  const sign = text.startsWith("-") ? "-" : "";
  const unsigned = sign ? text.slice(1) : text;
  const [integerPart, fractionPart] = unsigned.split(".");

  // Insert the separator before every full group of digits counted from the right.
  const pattern = new RegExp(`\\B(?=(\\d{${groupSize}})+(?!\\d))`, "g");
  const grouped = integerPart.replace(pattern, () => separator);

  return sign + grouped + (fractionPart === undefined ? "" : decimalSeparator + fractionPart);
}
