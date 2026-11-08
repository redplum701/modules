/**
 * unique
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Removes duplicates from an array, keeping the first occurrence of each
 *   item. An optional key function lets you compare items by a property or any
 *   computed value.
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
 *   - MDN Web Docs. Set. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *   - MDN Web Docs. Equality comparisons and sameness. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
 *   - MDN Web Docs. Array.prototype.forEach(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 */

/**
 * Removes duplicates, keeping the first occurrence of each item.
 *
 * Items (or keys) are compared the way Set compares them (SameValueZero):
 * NaN equals NaN, 0 equals -0, objects are compared by reference, and
 * 1 is different from "1".
 *
 * @param {Array} array - The array to clean.
 * @param {(value: *, index: number, array: Array) => *} [getKey] - Optional.
 *   Returns the value to compare instead of the item itself.
 * @returns {Array} A new array. Empty slots in sparse arrays are skipped.
 * @throws {TypeError} If array is not an array or getKey is not a function.
 */
export function unique(array, getKey) {
  if (!Array.isArray(array)) {
    throw new TypeError("unique: expected an array.");
  }
  if (getKey !== undefined && typeof getKey !== "function") {
    throw new TypeError("unique: getKey must be a function.");
  }

  const seen = new Set();
  const result = [];

  array.forEach((value, index) => {
    const key = getKey ? getKey(value, index, array) : value;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  });

  return result;
}
