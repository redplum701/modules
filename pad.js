/**
 * pad
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Pads strings and numbers to a fixed length: pad on the left, right, or both
 *   sides with any fill string, plus zero-padding for integers (including
 *   negative numbers and BigInt).
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
 *   - MDN Web Docs. String.prototype.padStart(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
 *   - MDN Web Docs. String.prototype.padEnd(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
 *   - MDN Web Docs. Number.isSafeInteger(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
 */

function assertLength(length, fnName) {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(`${fnName}: length must be a non-negative integer.`);
  }
}

function assertFill(fill, fnName) {
  if (typeof fill !== "string" || fill.length === 0) {
    throw new TypeError(`${fnName}: fill must be a non-empty string.`);
  }
}

function toText(value, fnName) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  throw new TypeError(`${fnName}: expected a string, number, or BigInt.`);
}

/**
 * Pads the start (left side) of a value.
 *
 * @param {string|number|bigint} value - The value to pad.
 * @param {number} length - Target length. Longer values are returned unchanged.
 * @param {string} [fill=" "] - Fill string.
 * @returns {string}
 */
export function padStart(value, length, fill = " ") {
  assertLength(length, "padStart");
  assertFill(fill, "padStart");
  return toText(value, "padStart").padStart(length, fill);
}

/**
 * Pads the end (right side) of a value.
 *
 * @param {string|number|bigint} value - The value to pad.
 * @param {number} length - Target length. Longer values are returned unchanged.
 * @param {string} [fill=" "] - Fill string.
 * @returns {string}
 */
export function padEnd(value, length, fill = " ") {
  assertLength(length, "padEnd");
  assertFill(fill, "padEnd");
  return toText(value, "padEnd").padEnd(length, fill);
}

/**
 * Pads both sides of a value. When the extra space is odd,
 * the right side gets the extra character.
 *
 * @param {string|number|bigint} value - The value to pad.
 * @param {number} length - Target length. Longer values are returned unchanged.
 * @param {string} [fill=" "] - Fill string.
 * @returns {string}
 */
export function padCenter(value, length, fill = " ") {
  assertLength(length, "padCenter");
  assertFill(fill, "padCenter");
  const text = toText(value, "padCenter");
  const extra = Math.max(length - text.length, 0);
  const left = Math.floor(extra / 2);
  return text.padStart(text.length + left, fill).padEnd(length, fill);
}

/**
 * Pads an integer with leading zeros. The minus sign counts toward the
 * length, like printf("%03d"): zeroPad(-5, 3) -> "-05".
 *
 * @param {number|bigint|string} value - A safe integer, BigInt, or integer string.
 * @param {number} length - Target length, including the sign.
 * @returns {string}
 */
export function zeroPad(value, length) {
  assertLength(length, "zeroPad");

  let text;
  if (typeof value === "bigint") {
    text = value.toString();
  } else if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError("zeroPad: number must be a safe integer.");
    }
    text = String(value);
  } else if (typeof value === "string" && /^-?\d+$/.test(value)) {
    text = value;
  } else {
    throw new TypeError("zeroPad: expected an integer, BigInt, or integer string.");
  }

  const sign = text.startsWith("-") ? "-" : "";
  const digits = sign ? text.slice(1) : text;
  return sign + digits.padStart(length - sign.length, "0");
}
