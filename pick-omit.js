/**
 * pick-omit
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Creates a new object with only the chosen keys (pick) or without the chosen
 *   keys (omit). Shallow copy of own enumerable properties; the original is
 *   never changed.
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
 *   - MDN Web Docs. Object.defineProperty(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 *   - MDN Web Docs. Reflect.ownKeys(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys
 *   - MDN Web Docs. Object.prototype.propertyIsEnumerable(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable
 */

function assertObject(object, fnName) {
  if (typeof object !== "object" || object === null) {
    throw new TypeError(`${fnName}: expected an object.`);
  }
}

// Keys must be strings, symbols, or numbers (numbers become strings).
function normalizeKeys(keys, fnName) {
  if (!Array.isArray(keys)) {
    throw new TypeError(`${fnName}: keys must be an array.`);
  }
  return keys.map((key) => {
    if (typeof key === "string" || typeof key === "symbol") return key;
    if (typeof key === "number") return String(key);
    throw new TypeError(`${fnName}: each key must be a string, symbol, or number.`);
  });
}

function isOwnEnumerable(object, key) {
  return Object.prototype.propertyIsEnumerable.call(object, key);
}

// defineProperty creates a real own property even for a key like "__proto__",
// where a normal assignment would change the prototype instead.
function setOwn(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}

/**
 * Returns a new object with only the listed keys.
 * Keys that are missing (or not own enumerable properties) are skipped.
 *
 * @param {object} object - The source object.
 * @param {Array<string|symbol|number>} keys - Keys to keep.
 * @returns {object} A new plain object. Property order follows `keys`.
 * @throws {TypeError} If object is not an object or keys is not an array.
 */
export function pick(object, keys) {
  assertObject(object, "pick");
  const result = {};
  for (const key of normalizeKeys(keys, "pick")) {
    if (isOwnEnumerable(object, key)) {
      setOwn(result, key, object[key]);
    }
  }
  return result;
}

/**
 * Returns a new object without the listed keys.
 *
 * @param {object} object - The source object.
 * @param {Array<string|symbol|number>} keys - Keys to leave out.
 * @returns {object} A new plain object with the remaining own enumerable properties.
 * @throws {TypeError} If object is not an object or keys is not an array.
 */
export function omit(object, keys) {
  assertObject(object, "omit");
  const omitted = new Set(normalizeKeys(keys, "omit"));
  const result = {};
  for (const key of Reflect.ownKeys(object)) {
    if (!omitted.has(key) && isOwnEnumerable(object, key)) {
      setOwn(result, key, object[key]);
    }
  }
  return result;
}
