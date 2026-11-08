/**
 * partition
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Splits an array into two arrays using a test function: the items that pass
 *   and the items that fail. The original order is kept in both.
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
 *   - Rust Project. Iterator::partition.
 *     https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.partition
 *   - MDN Web Docs. Array.prototype.filter(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 *   - MDN Web Docs. Array.prototype.forEach(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 */

/**
 * Splits an array in two with a single pass.
 *
 * @param {Array} array - The array to split.
 * @param {(value: *, index: number, array: Array) => *} predicate - Test function.
 *   A truthy result puts the item in the first array, a falsy result in the second.
 * @returns {[Array, Array]} [itemsThatPass, itemsThatFail]. New arrays; the
 *   original is not changed.
 * @throws {TypeError} If array is not an array or predicate is not a function.
 */
export function partition(array, predicate) {
  if (!Array.isArray(array)) {
    throw new TypeError("partition: expected an array.");
  }
  if (typeof predicate !== "function") {
    throw new TypeError("partition: predicate must be a function.");
  }

  const passed = [];
  const failed = [];

  // forEach skips empty slots in sparse arrays, just like filter does.
  array.forEach((value, index) => {
    if (predicate(value, index, array)) {
      passed.push(value);
    } else {
      failed.push(value);
    }
  });

  return [passed, failed];
}
