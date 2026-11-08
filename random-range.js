/**
 * random-range
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Random integers and floats within a range. Integers include both ends;
 *   floats include the minimum but not the maximum. Accepts an optional
 *   random source so it can be paired with a seeded generator later.
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
 *   - MDN Web Docs. Math.random(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *   - MDN Web Docs. Math.floor(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
 *   - MDN Web Docs. Number.isSafeInteger(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
 */

// Calls the random source and checks that it returns a number from 0 up to
// (but not including) 1, like Math.random() does.
function nextRandom(random, fnName) {
  if (typeof random !== "function") {
    throw new TypeError(`${fnName}: random must be a function.`);
  }
  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw new RangeError(`${fnName}: random() must return a number from 0 up to, but not including, 1.`);
  }
  return value;
}

/**
 * Returns a random integer from min to max, including both ends.
 *
 * @param {number} min - Lowest possible value (safe integer).
 * @param {number} max - Highest possible value (safe integer, >= min).
 * @param {() => number} [random=Math.random] - Random source returning [0, 1).
 * @returns {number}
 * @throws {RangeError} If min or max is not a safe integer, min > max,
 *   or the range is too wide.
 */
export function randomInt(min, max, random = Math.random) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new RangeError("randomInt: min and max must be safe integers.");
  }
  if (min > max) {
    throw new RangeError("randomInt: min must be less than or equal to max.");
  }

  const size = max - min + 1;
  if (!Number.isSafeInteger(size)) {
    throw new RangeError("randomInt: the range is too wide.");
  }
  return Math.floor(nextRandom(random, "randomInt") * size) + min;
}

/**
 * Returns a random float from min up to, but not including, max.
 * If min equals max, returns min.
 *
 * @param {number} min - Lowest possible value (finite).
 * @param {number} max - Upper limit (finite, >= min).
 * @param {() => number} [random=Math.random] - Random source returning [0, 1).
 * @returns {number}
 * @throws {RangeError} If min or max is not finite, or min > max.
 */
export function randomFloat(min, max, random = Math.random) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError("randomFloat: min and max must be finite numbers.");
  }
  if (min > max) {
    throw new RangeError("randomFloat: min must be less than or equal to max.");
  }
  return min + nextRandom(random, "randomFloat") * (max - min);
}
