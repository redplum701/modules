/**
 * group-by
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Groups the items of an array (or any iterable) by a key: groupBy returns a
 *   plain lookup object, groupByMap returns a Map that keeps the original key
 *   types. Works like the standard Object.groupBy and Map.groupBy, in older
 *   environments too.
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
 *   - MDN Web Docs. Object.groupBy(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
 *   - MDN Web Docs. Map.groupBy(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy
 *   - TC39. Array grouping proposal.
 *     https://github.com/tc39/proposal-array-grouping
 *   - Lodash. _.groupBy.
 *     https://lodash.com/docs/#groupBy
 */

// Accepts a function (item, index) => key, or a property name.
function toSelector(keySelector, fnName) {
  if (typeof keySelector === "function") return keySelector;
  if (typeof keySelector === "string") {
    return (item) => (item === null || item === undefined ? undefined : item[keySelector]);
  }
  throw new TypeError(`${fnName}: the key must be a function or a property name.`);
}

function assertIterable(items, fnName) {
  if (items === null || items === undefined || typeof items[Symbol.iterator] !== "function") {
    throw new TypeError(`${fnName}: expected an array or other iterable.`);
  }
}

// Object keys are strings or symbols: anything else is turned into a string.
function toPropertyKey(key) {
  return typeof key === "symbol" ? key : String(key);
}

/**
 * Groups items into an object of arrays.
 *
 * Keys become strings (or stay symbols), as with any object key, so 1 and "1"
 * share a group. Use groupByMap to keep key types apart. Items stay in their
 * original order inside each group. The result has no prototype, like the
 * standard Object.groupBy, so a group named "constructor" or "__proto__"
 * is harmless. Note that JavaScript lists integer-like keys ("1", "2") first,
 * in numeric order.
 *
 * @param {Iterable} items - An array or other iterable.
 * @param {Function|string} keySelector - (item, index) => key, or a property name.
 * @returns {Object<string|symbol, Array>}
 * @throws {TypeError} If items is not iterable, or keySelector is not a function or string.
 */
export function groupBy(items, keySelector) {
  assertIterable(items, "groupBy");
  const select = toSelector(keySelector, "groupBy");

  const groups = Object.create(null);
  let index = 0;
  for (const item of items) {
    const key = toPropertyKey(select(item, index));
    index += 1;

    if (Object.hasOwn(groups, key)) groups[key].push(item);
    else groups[key] = [item];
  }
  return groups;
}

/**
 * Groups items into a Map of arrays. Keys keep their type and are compared
 * like Map keys (1 and "1" differ, NaN equals NaN), and the groups are in the
 * order each key first appeared.
 *
 * @param {Iterable} items - An array or other iterable.
 * @param {Function|string} keySelector - (item, index) => key, or a property name.
 * @returns {Map<*, Array>}
 * @throws {TypeError} If items is not iterable, or keySelector is not a function or string.
 */
export function groupByMap(items, keySelector) {
  assertIterable(items, "groupByMap");
  const select = toSelector(keySelector, "groupByMap");

  const groups = new Map();
  let index = 0;
  for (const item of items) {
    const key = select(item, index);
    index += 1;

    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}
