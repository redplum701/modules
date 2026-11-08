/**
 * shuffle
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Randomly reorders an array with the Fisher-Yates algorithm, so every
 *   ordering is equally likely. Provides a copying version (shuffle) and an
 *   in-place version (shuffleInPlace), both with a pluggable random source.
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
 *   - Wikipedia. Fisher-Yates shuffle.
 *     https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *   - Durstenfeld, R. Algorithm 235: Random permutation. Communications of the ACM 7(7), 1964.
 *     https://doi.org/10.1145/364520.364540
 *   - MDN Web Docs. Math.random(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */

function assertArray(array, fnName) {
  if (!Array.isArray(array)) {
    throw new TypeError(`${fnName}: expected an array.`);
  }
}

// Calls the random source and checks the result is in [0, 1), like Math.random().
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
 * Shuffles an array in place (the array itself is changed).
 *
 * Fisher-Yates: walk from the last position to the second, and swap each
 * item with a randomly chosen item at or before it. Every ordering is
 * equally likely when `random` is uniform.
 *
 * @param {Array} array - The array to shuffle.
 * @param {() => number} [random=Math.random] - Random source returning [0, 1).
 * @returns {Array} The same array, shuffled.
 * @throws {TypeError} If array is not an array or random is not a function.
 * @throws {RangeError} If random() returns something outside [0, 1).
 */
export function shuffleInPlace(array, random = Math.random) {
  assertArray(array, "shuffleInPlace");

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRandom(random, "shuffleInPlace") * (i + 1)); // 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Returns a shuffled copy. The original array is not changed.
 * Empty slots in sparse arrays become undefined in the copy.
 *
 * @param {Array} array - The array to shuffle.
 * @param {() => number} [random=Math.random] - Random source returning [0, 1).
 * @returns {Array} A new, shuffled array.
 * @throws {TypeError} If array is not an array or random is not a function.
 * @throws {RangeError} If random() returns something outside [0, 1).
 */
export function shuffle(array, random = Math.random) {
  assertArray(array, "shuffle");
  return shuffleInPlace(Array.from(array), random);
}
