/**
 * rounding
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Rounds numbers to a given number of decimal places (or to tens, hundreds,
 *   etc.) with a selectable rounding mode, including banker's rounding.
 *   Works on the decimal digits JavaScript prints, so 1.005 rounds to 1.01.
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
 *   - Wikipedia. Rounding.
 *     https://en.wikipedia.org/wiki/Rounding
 *   - MDN Web Docs. Math.round(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */

/**
 * Supported rounding modes.
 *
 * Ties (exactly halfway, like 2.5 when rounding to a whole number):
 *   "half-away"        away from zero      2.5 -> 3,  -2.5 -> -3  (default)
 *   "half-toward-zero" toward zero         2.5 -> 2,  -2.5 -> -2
 *   "half-even"        to the even digit   2.5 -> 2,   3.5 -> 4   (banker's rounding)
 *   "half-up"          toward +Infinity    2.5 -> 3,  -2.5 -> -2  (same as Math.round)
 *
 * Directed (ignore the halfway point):
 *   "ceil"  toward +Infinity    "floor" toward -Infinity
 *   "trunc" toward zero         "away"  away from zero
 */
export const ROUNDING_MODES = [
  "half-away",
  "half-toward-zero",
  "half-even",
  "half-up",
  "ceil",
  "floor",
  "trunc",
  "away",
];

const MAX_DIGITS = 100;
const MAX_EXPONENT = 400;
const DECIMAL_PATTERN = /^([+-]?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i;

// Splits a number or numeric string into sign, integer mantissa, and scale,
// where value = mantissa / 10^scale. BigInt keeps every digit exact.
function parseDecimal(value) {
  let text;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("roundTo: value must be finite.");
    }
    text = String(value);
  } else if (typeof value === "string") {
    text = value.trim();
  } else {
    throw new TypeError("roundTo: value must be a number or numeric string.");
  }

  const match = DECIMAL_PATTERN.exec(text);
  if (!match) {
    throw new RangeError(`roundTo: "${value}" is not a decimal number.`);
  }

  const [, sign, integerPart, fractionPart = "", exponent = "0"] = match;
  if (Math.abs(Number(exponent)) > MAX_EXPONENT) {
    throw new RangeError("roundTo: exponent is too large.");
  }

  let mantissa = BigInt(integerPart + fractionPart);
  let scale = fractionPart.length - Number(exponent);
  if (scale < 0) {
    mantissa *= 10n ** BigInt(-scale);
    scale = 0;
  }
  return { negative: sign === "-", mantissa, scale };
}

// Builds a number from an integer that stands for integer / 10^places.
function toNumber(negative, integer, places) {
  let text = integer.toString();
  if (places > 0) {
    text = text.padStart(places + 1, "0");
    text = text.slice(0, -places) + "." + text.slice(-places);
  } else if (places < 0) {
    text += "0".repeat(-places);
  }
  const result = Number(text);
  return negative && integer > 0n ? -result : result; // never return -0
}

/**
 * Rounds a number to a given number of decimal places.
 *
 * @param {number|string} value - A finite number or a decimal string.
 * @param {number} [digits=0] - Decimal places. Negative values round to tens,
 *   hundreds, etc. (-2 rounds to the nearest 100). Range: -100 to 100.
 * @param {string} [mode="half-away"] - One of ROUNDING_MODES.
 * @returns {number} The rounded number.
 * @throws {TypeError} If value is not a number or string.
 * @throws {RangeError} If value, digits, or mode is invalid.
 */
export function roundTo(value, digits = 0, mode = "half-away") {
  if (!Number.isInteger(digits) || Math.abs(digits) > MAX_DIGITS) {
    throw new RangeError(`roundTo: digits must be an integer from -${MAX_DIGITS} to ${MAX_DIGITS}.`);
  }
  if (!ROUNDING_MODES.includes(mode)) {
    throw new RangeError(`roundTo: unknown mode "${mode}".`);
  }

  const { negative, mantissa, scale } = parseDecimal(value);

  // Already has no more decimal places than requested: nothing to round.
  if (scale <= digits) {
    return toNumber(negative, mantissa, scale);
  }

  const divisor = 10n ** BigInt(scale - digits);
  let quotient = mantissa / divisor;
  const remainder = mantissa % divisor;

  // Compare the dropped part with exactly one half: -1 (less), 0 (tie), 1 (more).
  const doubled = remainder * 2n;
  const half = doubled < divisor ? -1 : doubled > divisor ? 1 : 0;
  const hasRemainder = remainder > 0n;

  let increment;
  switch (mode) {
    case "half-away":
      increment = half >= 0;
      break;
    case "half-toward-zero":
      increment = half > 0;
      break;
    case "half-even":
      increment = half > 0 || (half === 0 && quotient % 2n === 1n);
      break;
    case "half-up":
      increment = half > 0 || (half === 0 && !negative);
      break;
    case "ceil":
      increment = hasRemainder && !negative;
      break;
    case "floor":
      increment = hasRemainder && negative;
      break;
    case "away":
      increment = hasRemainder;
      break;
    default: // "trunc"
      increment = false;
  }

  if (increment) quotient += 1n;
  return toNumber(negative, quotient, digits);
}
