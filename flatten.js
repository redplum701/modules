/**
 * flatten
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Flattens nested arrays into a single array, down to a chosen depth (or all
 *   the way with Infinity). Uses a loop instead of recursion, so very deep
 *   nesting cannot overflow the call stack, and detects circular references.
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
 *   - MDN Web Docs. Array.prototype.flat(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 *   - MDN Web Docs. Array.isArray(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
 *   - Wikipedia. Depth-first search.
 *     https://en.wikipedia.org/wiki/Depth-first_search
 */

/**
 * Flattens nested arrays.
 *
 * @param {Array} array - The array to flatten.
 * @param {number} [depth=1] - How many levels to flatten. 0 copies the array,
 *   Infinity flattens everything.
 * @returns {Array} A new array. Empty slots in sparse arrays are skipped.
 * @throws {TypeError} If array is not an array, or it contains a circular reference.
 * @throws {RangeError} If depth is not a non-negative integer or Infinity.
 */
export function flatten(array, depth = 1) {
  if (!Array.isArray(array)) {
    throw new TypeError("flatten: expected an array.");
  }
  if (depth !== Infinity && !(Number.isInteger(depth) && depth >= 0)) {
    throw new RangeError("flatten: depth must be a non-negative integer or Infinity.");
  }

  const result = [];

  // Instead of calling flatten() on itself, keep a stack of the arrays we are
  // in the middle of reading. Each entry remembers where to continue.
  const stack = [{ items: array, index: 0 }];
  const inProgress = new Set([array]); // arrays on the stack, to spot cycles

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];

    if (frame.index >= frame.items.length) {
      stack.pop();
      inProgress.delete(frame.items);
      continue;
    }

    const index = frame.index;
    frame.index += 1;
    if (!(index in frame.items)) continue; // skip empty slots

    const item = frame.items[index];

    // stack.length is how deep we are: 1 at the top level.
    if (Array.isArray(item) && stack.length <= depth) {
      if (inProgress.has(item)) {
        throw new TypeError("flatten: circular reference found.");
      }
      inProgress.add(item);
      stack.push({ items: item, index: 0 });
    } else {
      result.push(item);
    }
  }

  return result;
}
