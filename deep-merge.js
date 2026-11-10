/**
 * deep-merge
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Merges objects recursively into a new object. Plain objects are merged key
 *   by key, arrays are replaced, concatenated, united, or merged by index, and
 *   the result shares no objects or arrays with the inputs. Safe against
 *   prototype pollution, and circular input is rejected.
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
 *   - Lodash. _.merge.
 *     https://lodash.com/docs/#merge
 *   - MDN Web Docs. Object.keys(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 *   - MDN Web Docs. Object.defineProperty(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 *   - OWASP. Prototype Pollution Prevention Cheat Sheet.
 *     https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html
 */

const ARRAY_STRATEGIES = ["replace", "concat", "union", "index"];

function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// defineProperty makes a real own property even for the key "__proto__",
// where a plain assignment would change the prototype instead.
function define(object, key, value) {
  Object.defineProperty(object, key, { value, enumerable: true, writable: true, configurable: true });
}

// A circular reference means an object that contains itself. The objects being
// walked are tracked separately for each side, so the same (shared) object may
// safely appear on both sides, such as in deepMerge(x, x).
function newContext() {
  return { target: new Set(), source: new Set() };
}

function enter(container, open) {
  if (open.has(container)) {
    throw new TypeError("deepMerge: circular reference found.");
  }
  open.add(container);
}

// Copies arrays and plain objects deeply. Everything else (Date, Map, class
// instances, functions...) is kept as the same reference.
function clone(value, ancestors) {
  const isArray = Array.isArray(value);
  if (!isArray && !isPlainObject(value)) return value;

  enter(value, ancestors);
  let copy;
  if (isArray) {
    copy = Array.from(value, (item) => clone(item, ancestors));
  } else {
    copy = {};
    for (const key of Object.keys(value)) define(copy, key, clone(value[key], ancestors));
  }
  ancestors.delete(value);
  return copy;
}

function mergeArrays(target, source, options, context) {
  switch (options.arrays) {
    case "concat":
      return [...clone(target, context.target), ...clone(source, context.source)];
    case "union": {
      const seen = new Set();
      return [...clone(target, context.target), ...clone(source, context.source)].filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      });
    }
    case "index": {
      const length = Math.max(target.length, source.length);
      enter(target, context.target);
      enter(source, context.source);
      const merged = Array.from({ length }, (_, i) => {
        if (i >= target.length) return clone(source[i], context.source);
        if (i >= source.length) return clone(target[i], context.target);
        return merge(target[i], source[i], options, context);
      });
      context.target.delete(target);
      context.source.delete(source);
      return merged;
    }
    default: // "replace"
      return clone(source, context.source);
  }
}

function merge(target, source, options, context) {
  if (source === undefined && options.skipUndefined) return clone(target, context.target);

  if (isPlainObject(target) && isPlainObject(source)) {
    enter(target, context.target);
    enter(source, context.source);

    const sourceKeys = new Set(Object.keys(source));
    const result = {};
    for (const key of Object.keys(target)) {
      define(
        result,
        key,
        sourceKeys.has(key)
          ? merge(target[key], source[key], options, context)
          : clone(target[key], context.target)
      );
    }
    for (const key of sourceKeys) {
      if (Object.hasOwn(result, key)) continue; // already merged above
      if (source[key] === undefined && options.skipUndefined) continue;
      define(result, key, clone(source[key], context.source));
    }

    context.target.delete(target);
    context.source.delete(source);
    return result;
  }

  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source, options, context);
  }

  return clone(source, context.source); // anything else: the source wins
}

function readOptions(options) {
  const { arrays = "replace", skipUndefined = true } = options;
  if (!ARRAY_STRATEGIES.includes(arrays)) {
    throw new RangeError(`deepMerge: arrays must be one of ${ARRAY_STRATEGIES.join(", ")}.`);
  }
  if (typeof skipUndefined !== "boolean") {
    throw new TypeError("deepMerge: skipUndefined must be a boolean.");
  }
  return { arrays, skipUndefined };
}

/**
 * Merges two values into a new one. The inputs are not changed, and the
 * result shares no plain objects or arrays with them.
 *
 * Rules:
 *   - Two plain objects: merged key by key, recursively.
 *   - Two arrays: combined by options.arrays (see below).
 *   - Anything else: the source value wins (null and other falsy values too).
 *   - An undefined source value is skipped, unless skipUndefined is false.
 *   - Only own enumerable string keys are read. Dates, Maps, class instances,
 *     and functions are not merged inside; they are copied by reference.
 *
 * @param {*} target - The base value.
 * @param {*} source - The value merged on top.
 * @param {object} [options]
 * @param {"replace"|"concat"|"union"|"index"} [options.arrays="replace"] -
 *   replace: the source array replaces the target array.
 *   concat: target items, then source items.
 *   union: like concat, without repeats (compared like Set does, so objects by reference).
 *   index: items at the same position are merged; the longer array's extra items are kept.
 * @param {boolean} [options.skipUndefined=true] - Ignore undefined in the source.
 * @returns {*} The merged value.
 * @throws {TypeError} If the input has a circular reference, or an option has the wrong type.
 * @throws {RangeError} If options.arrays is unknown.
 */
export function deepMerge(target, source, options = {}) {
  return merge(target, source, readOptions(options), newContext());
}

/**
 * Merges a list of values, left to right, into a new one.
 *
 * @param {Array} values - The values to merge. An empty list gives {}.
 * @param {object} [options] - Same options as deepMerge.
 * @returns {*}
 * @throws {TypeError} If values is not an array.
 */
export function deepMergeAll(values, options = {}) {
  if (!Array.isArray(values)) {
    throw new TypeError("deepMergeAll: expected an array.");
  }
  const settings = readOptions(options);
  if (values.length === 0) return {};
  return values.reduce((result, value) => merge(result, value, settings, newContext()), undefined);
}
