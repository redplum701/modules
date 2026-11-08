/**
 * is-empty
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Checks whether a value is empty: null, undefined, an empty string, an empty
 *   array, Map, Set, or typed array, or a plain object with no own enumerable
 *   properties. Numbers, booleans, functions, and other objects are never empty.
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
 *   - MDN Web Docs. Object.keys(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 *   - MDN Web Docs. Reflect.ownKeys(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys
 *   - MDN Web Docs. ArrayBuffer.isView(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView
 */

// A plain object is one made with {} or Object.create(null),
// not a Date, RegExp, class instance, and so on.
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Checks whether a value is empty.
 *
 * Empty values:
 *   null, undefined, "" (and whitespace-only strings with `trim`),
 *   [], new Map(), new Set(), empty typed arrays, and {} (no own enumerable
 *   string or symbol keys).
 *
 * Never empty: numbers (including 0 and NaN), booleans, functions,
 * and objects such as Date, RegExp, and class instances.
 *
 * @param {*} value - Anything.
 * @param {object} [options]
 * @param {boolean} [options.trim=false] - Treat whitespace-only strings as empty.
 * @returns {boolean}
 */
export function isEmpty(value, options = {}) {
  const { trim = false } = options;

  if (value === null || value === undefined) return true;

  if (typeof value === "string") {
    return (trim ? value.trim() : value).length === 0;
  }

  if (Array.isArray(value)) return value.length === 0;

  // Typed arrays (Uint8Array, etc.) have a length. DataView does not.
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) return value.size === 0;

  if (isPlainObject(value)) {
    return !Reflect.ownKeys(value).some((key) =>
      Object.prototype.propertyIsEnumerable.call(value, key)
    );
  }

  return false;
}
