/**
 * chunk
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Splits an array into smaller arrays of a given size. The last chunk may be
 *   shorter.
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
 *   - Lodash. _.chunk.
 *     https://lodash.com/docs/#chunk
 *   - MDN Web Docs. Array.prototype.slice(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
 *   - MDN Web Docs. Number.isInteger(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 */

/**
 * Splits an array into chunks of a given size.
 *
 * @param {Array} array - The array to split.
 * @param {number} size - Items per chunk. A positive integer.
 * @returns {Array[]} A new array of new arrays. The last chunk may be shorter.
 *   An empty array gives [].
 * @throws {TypeError} If array is not an array or size is not a number.
 * @throws {RangeError} If size is not a positive integer.
 */
export function chunk(array, size) {
  if (!Array.isArray(array)) {
    throw new TypeError("chunk: expected an array.");
  }
  if (typeof size !== "number") {
    throw new TypeError("chunk: size must be a number.");
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("chunk: size must be a positive integer.");
  }

  const chunks = [];
  for (let start = 0; start < array.length; start += size) {
    chunks.push(array.slice(start, start + size));
  }
  return chunks;
}
