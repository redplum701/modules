/**
 * clamp-lerp
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Range limiting and linear interpolation: clamp a number into a range,
 *   interpolate between two values, find where a value sits between two
 *   values, and remap a value from one range to another.
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
 *   - Wikipedia. Linear interpolation.
 *     https://en.wikipedia.org/wiki/Linear_interpolation
 *   - MDN Web Docs. Math.min(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
 *   - MDN Web Docs. Math.max(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
 */

function assertNumber(value, name, fnName) {
  if (typeof value !== "number") {
    throw new TypeError(`${fnName}: ${name} must be a number.`);
  }
  if (Number.isNaN(value)) {
    throw new RangeError(`${fnName}: ${name} must not be NaN.`);
  }
}

function assertFinite(value, name, fnName) {
  assertNumber(value, name, fnName);
  if (!Number.isFinite(value)) {
    throw new RangeError(`${fnName}: ${name} must be finite.`);
  }
}

/**
 * Limits a number to a range.
 *
 * @param {number} value - The number to limit.
 * @param {number} min - Lower bound (may be -Infinity).
 * @param {number} max - Upper bound (may be Infinity).
 * @returns {number} min if value < min, max if value > max, otherwise value.
 * @throws {RangeError} If min is greater than max, or any argument is NaN.
 */
export function clamp(value, min, max) {
  assertNumber(value, "value", "clamp");
  assertNumber(min, "min", "clamp");
  assertNumber(max, "max", "clamp");
  if (min > max) {
    throw new RangeError("clamp: min must be less than or equal to max.");
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values. Not clamped: t below 0 or above 1
 * extrapolates beyond the two values.
 *
 * @param {number} start - Value when t is 0.
 * @param {number} end - Value when t is 1.
 * @param {number} t - Position, usually from 0 to 1.
 * @returns {number} start + (end - start) * t
 */
export function lerp(start, end, t) {
  assertFinite(start, "start", "lerp");
  assertFinite(end, "end", "lerp");
  assertFinite(t, "t", "lerp");
  // This form returns exactly `end` when t is 1, unlike start + (end - start) * t.
  return start * (1 - t) + end * t;
}

/**
 * The opposite of lerp: finds t for a value between start and end.
 * Not clamped.
 *
 * @param {number} start - Value at t = 0.
 * @param {number} end - Value at t = 1.
 * @param {number} value - The value to locate.
 * @returns {number} (value - start) / (end - start)
 * @throws {RangeError} If start and end are equal.
 */
export function inverseLerp(start, end, value) {
  assertFinite(start, "start", "inverseLerp");
  assertFinite(end, "end", "inverseLerp");
  assertFinite(value, "value", "inverseLerp");
  if (start === end) {
    throw new RangeError("inverseLerp: start and end must be different.");
  }
  return (value - start) / (end - start);
}

/**
 * Maps a value from one range to another. Not clamped.
 *
 * @param {number} value - The value in the input range.
 * @param {number} inMin - Input range start.
 * @param {number} inMax - Input range end.
 * @param {number} outMin - Output range start.
 * @param {number} outMax - Output range end.
 * @returns {number}
 */
export function remap(value, inMin, inMax, outMin, outMax) {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}
