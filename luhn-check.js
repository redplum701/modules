/**
 * luhn-check
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   The Luhn algorithm (mod 10 check): validates numbers such as payment card
 *   numbers, and calculates the check digit for a number that does not have
 *   one yet. It catches typos; it is not a security feature.
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
 *   - Wikipedia. Luhn algorithm.
 *     https://en.wikipedia.org/wiki/Luhn_algorithm
 *   - Luhn, H. P. Computer for Verifying Numbers. US Patent 2,950,048, 1960.
 *     https://patents.google.com/patent/US2950048A
 *   - MDN Web Docs. Number.isSafeInteger(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
 */

// Reads the input as a string of digits, or returns null.
// Strings may contain spaces and hyphens between digits ("4111 1111 1111 1111").
// Numbers and BigInts work too, but a string is safer: a number loses leading
// zeros, and numbers above 2^53 lose digits.
function toDigits(input) {
  if (typeof input === "bigint") {
    return input >= 0n ? input.toString() : null;
  }
  if (typeof input === "number") {
    return Number.isSafeInteger(input) && input >= 0 ? String(input) : null;
  }
  if (typeof input === "string") {
    // Digits, optionally separated by spaces or hyphens. A separator at the
    // start or end (such as a minus sign) is not allowed.
    const text = input.trim();
    return /^\d+(?:[\s-]+\d+)*$/.test(text) ? text.replace(/[\s-]/g, "") : null;
  }
  return null;
}

// Adds up the digits, doubling every second one counted from the right.
// `doubleFirst` says whether the rightmost digit is doubled.
function luhnSum(digits, doubleFirst) {
  let sum = 0;
  let double = doubleFirst;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let value = Number(digits[i]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9; // same as adding the two digits of the result
    }
    sum += value;
    double = !double;
  }
  return sum;
}

/**
 * Checks a number with the Luhn algorithm.
 *
 * At least 2 digits are needed (one digit plus the check digit).
 *
 * @param {string|number|bigint} input - For example "4111 1111 1111 1111".
 *   Spaces and hyphens in strings are ignored.
 * @returns {boolean} False for anything that is not a digit string, too.
 *   Never throws.
 */
export function isValidLuhn(input) {
  const digits = toDigits(input);
  if (digits === null || digits.length < 2) return false;
  return luhnSum(digits, false) % 10 === 0;
}

/**
 * Calculates the Luhn check digit for a number that does not have one yet.
 *
 * luhnCheckDigit("7992739871") is 3, because 79927398713 is a valid number.
 *
 * @param {string|number|bigint} payload - The number without its check digit.
 * @returns {number} A digit from 0 to 9.
 * @throws {TypeError} If payload is not a string, number, or BigInt.
 * @throws {RangeError} If payload is not made of digits.
 */
export function luhnCheckDigit(payload) {
  if (typeof payload !== "string" && typeof payload !== "number" && typeof payload !== "bigint") {
    throw new TypeError("luhnCheckDigit: expected a string, number, or BigInt.");
  }
  const digits = toDigits(payload);
  if (digits === null || digits.length === 0) {
    throw new RangeError("luhnCheckDigit: payload must be made of digits.");
  }
  // The check digit will sit on the far right, so the current rightmost digit
  // becomes the second from the right and is doubled.
  return (10 - (luhnSum(digits, true) % 10)) % 10;
}

/**
 * Returns the number with its Luhn check digit added at the end.
 *
 * @param {string|number|bigint} payload - The number without its check digit.
 * @returns {string} Digits only (spaces and hyphens are removed).
 * @throws {TypeError} If payload is not a string, number, or BigInt.
 * @throws {RangeError} If payload is not made of digits.
 */
export function addLuhnCheckDigit(payload) {
  const check = luhnCheckDigit(payload);
  return toDigits(payload) + String(check);
}
