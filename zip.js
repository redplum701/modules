/**
 * zip
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Combines several arrays element by element into an array of tuples:
 *   zip stops at the shortest array, zipLongest continues to the longest
 *   (filling gaps with undefined), and unzip reverses the operation.
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
 *   - Python Software Foundation. zip() (built-in functions).
 *     https://docs.python.org/3/library/functions.html#zip
 *   - Python Software Foundation. itertools.zip_longest.
 *     https://docs.python.org/3/library/itertools.html#itertools.zip_longest
 *   - MDN Web Docs. Array.from(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
 */

function assertArrays(arrays, fnName) {
  for (const array of arrays) {
    if (!Array.isArray(array)) {
      throw new TypeError(`${fnName}: every argument must be an array.`);
    }
  }
}

// Builds `length` tuples, taking item i from each array.
function buildTuples(arrays, length) {
  return Array.from({ length }, (_, index) => arrays.map((array) => array[index]));
}

/**
 * Combines arrays element by element. Stops at the shortest array.
 *
 * @param {...Array} arrays - Any number of arrays.
 * @returns {Array[]} An array of tuples. Returns [] if no arrays are given.
 * @throws {TypeError} If an argument is not an array.
 */
export function zip(...arrays) {
  assertArrays(arrays, "zip");
  if (arrays.length === 0) return [];
  const shortest = arrays.reduce((min, array) => Math.min(min, array.length), Infinity);
  return buildTuples(arrays, shortest);
}

/**
 * Combines arrays element by element. Continues to the longest array and
 * fills missing items with undefined.
 *
 * @param {...Array} arrays - Any number of arrays.
 * @returns {Array[]} An array of tuples. Returns [] if no arrays are given.
 * @throws {TypeError} If an argument is not an array.
 */
export function zipLongest(...arrays) {
  assertArrays(arrays, "zipLongest");
  if (arrays.length === 0) return [];
  const longest = arrays.reduce((max, array) => Math.max(max, array.length), 0);
  return buildTuples(arrays, longest);
}

/**
 * The opposite of zip: splits an array of tuples back into separate arrays.
 *
 * @param {Array[]} tuples - An array of arrays, e.g. [[1, "a"], [2, "b"]].
 * @returns {Array[]} e.g. [[1, 2], ["a", "b"]]. Stops at the shortest tuple.
 * @throws {TypeError} If tuples is not an array of arrays.
 */
export function unzip(tuples) {
  if (!Array.isArray(tuples)) {
    throw new TypeError("unzip: expected an array of arrays.");
  }
  return zip(...tuples);
}
