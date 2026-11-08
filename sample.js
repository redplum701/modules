/**
 * sample
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Picks one random element from an array with equal probability. Accepts an
 *   optional random source so it can be paired with a seeded generator.
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
 *   - Wikipedia. Discrete uniform distribution.
 *     https://en.wikipedia.org/wiki/Discrete_uniform_distribution
 */

/**
 * Picks one random element from an array. Every element has the same chance,
 * and the array is not changed.
 *
 * @param {Array} array - The array to pick from.
 * @param {() => number} [random=Math.random] - Random source returning [0, 1).
 * @returns {*} A random element, or undefined if the array is empty.
 * @throws {TypeError} If array is not an array or random is not a function.
 * @throws {RangeError} If random() returns something outside [0, 1).
 */
export function sample(array, random = Math.random) {
  if (!Array.isArray(array)) {
    throw new TypeError("sample: expected an array.");
  }
  if (typeof random !== "function") {
    throw new TypeError("sample: random must be a function.");
  }
  if (array.length === 0) return undefined;

  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw new RangeError("sample: random() must return a number from 0 up to, but not including, 1.");
  }

  // value is in [0, 1), so the index is always from 0 to length - 1.
  return array[Math.floor(value * array.length)];
}
