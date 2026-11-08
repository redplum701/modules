/**
 * rotate
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Rotates the elements of an array by n positions and returns a new array.
 *   Positive n moves elements to the left (the first elements wrap around to
 *   the end); negative n moves them to the right.
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
 *   - Wikipedia. Circular shift.
 *     https://en.wikipedia.org/wiki/Circular_shift
 *   - MDN Web Docs. Array.prototype.slice(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
 *   - MDN Web Docs. Remainder (%). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 */

/**
 * Rotates an array and returns a new array. The original is not changed.
 *
 * Positive n: elements move left, so the first n elements go to the end.
 *   rotate([1, 2, 3, 4, 5], 2)  -> [3, 4, 5, 1, 2]
 * Negative n: elements move right, so the last elements go to the front.
 *   rotate([1, 2, 3, 4, 5], -1) -> [5, 1, 2, 3, 4]
 *
 * @param {Array} array - The array to rotate.
 * @param {number} n - Number of positions (any integer, any size).
 * @returns {Array} A new, rotated array.
 * @throws {TypeError} If array is not an array.
 * @throws {RangeError} If n is not an integer.
 */
export function rotate(array, n) {
  if (!Array.isArray(array)) {
    throw new TypeError("rotate: expected an array.");
  }
  if (!Number.isInteger(n)) {
    throw new RangeError("rotate: n must be an integer.");
  }
  if (array.length === 0) return [];

  // JavaScript's % keeps the sign of n (-1 % 5 is -1), so shift into 0..length-1.
  const offset = ((n % array.length) + array.length) % array.length;
  return array.slice(offset).concat(array.slice(0, offset));
}
