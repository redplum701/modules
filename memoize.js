/**
 * memoize
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Remembers the results of a function so that calling it again with the same
 *   arguments returns the stored result. Builds cache keys from any arguments
 *   (objects are compared by content), and supports a size limit (least
 *   recently used items are dropped), a time limit, and async functions.
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
 *   - Wikipedia. Memoization.
 *     https://en.wikipedia.org/wiki/Memoization
 *   - Wikipedia. Cache replacement policies: Least recently used (LRU).
 *     https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)
 *   - MDN Web Docs. Map. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *   - MDN Web Docs. WeakMap. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
 */

// Objects, functions, and symbols that cannot be turned into text are given a
// number the first time they are seen, so the same one always gets the same key.
const objectIds = new WeakMap(); // objects and functions (not kept alive by this map)
const symbolIds = new Map(); // symbols can only be kept in a Map here
let nextId = 1;

function idOf(value) {
  const store = typeof value === "symbol" ? symbolIds : objectIds;
  if (!store.has(value)) store.set(value, nextId++);
  return store.get(value);
}

function isPlainObject(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Turns one argument into text. Every type has its own prefix, so the number 1,
// the string "1", and true never share a key.
function serialize(value, ancestors) {
  switch (typeof value) {
    case "undefined": return "u";
    case "boolean": return value ? "true" : "false";
    case "number": return Object.is(value, -0) ? "n:-0" : `n:${value}`; // 0 and -0 differ; NaN equals NaN
    case "bigint": return `i:${value}`;
    case "string": return `s:${JSON.stringify(value)}`;
    case "symbol":
    case "function": return `#${idOf(value)}`;
    default: break;
  }

  if (value === null) return "null";
  if (value instanceof Date) return `d:${value.getTime()}`;
  if (value instanceof RegExp) return `r:${JSON.stringify(String(value))}`;

  // Arrays and plain objects are compared by content.
  const isArray = Array.isArray(value);
  if (isArray || isPlainObject(value)) {
    if (ancestors.has(value)) {
      throw new TypeError("memoize: an argument contains a circular reference. Pass a resolver option.");
    }
    ancestors.add(value);
    const text = isArray
      ? `[${Array.from(value, (item) => serialize(item, ancestors)).join(",")}]`
      : `{${Object.keys(value)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${serialize(value[key], ancestors)}`)
          .join(",")}}`;
    ancestors.delete(value);
    return text;
  }

  // Map, Set, class instances, and so on are compared by identity.
  return `#${idOf(value)}`;
}

function defaultResolver(...args) {
  return `${args.length}(${args.map((arg) => serialize(arg, new Set())).join(",")})`;
}

/**
 * Wraps a function so its results are remembered.
 *
 * - Cache keys: by default, built from all the arguments. Primitives are
 *   compared by value and type (1 and "1" differ, NaN equals NaN, 0 and -0
 *   differ). Arrays, plain objects, Dates, and RegExps are compared by content
 *   (object key order does not matter). Other objects, functions, and symbols
 *   are compared by identity. `this` is not part of the key.
 * - Errors are not cached. The next call tries again.
 * - If the function returns a promise, the promise is cached (so calls that
 *   overlap share one run). If it rejects, it is removed from the cache.
 *
 * @param {Function} fn - The function to wrap.
 * @param {object} [options]
 * @param {Function} [options.resolver] - Returns the cache key from the
 *   arguments. Use it for circular arguments or custom rules, for example
 *   (user) => user.id.
 * @param {number} [options.maxSize=Infinity] - Most results to keep. When full,
 *   the least recently used one is dropped.
 * @param {number} [options.ttl=Infinity] - How long a result is kept, in
 *   milliseconds.
 * @returns {Function} The memoized function. It also has clear(), delete(...args),
 *   has(...args), and a size property.
 * @throws {TypeError} If fn or resolver is not a function.
 * @throws {RangeError} If maxSize or ttl is invalid.
 */
export function memoize(fn, options = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("memoize: expected a function.");
  }
  const { resolver, maxSize = Infinity, ttl = Infinity } = options;
  if (resolver !== undefined && typeof resolver !== "function") {
    throw new TypeError("memoize: resolver must be a function.");
  }
  if (maxSize !== Infinity && !(Number.isInteger(maxSize) && maxSize >= 1)) {
    throw new RangeError("memoize: maxSize must be a positive integer or Infinity.");
  }
  if (ttl !== Infinity && !(typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0)) {
    throw new RangeError("memoize: ttl must be a positive number or Infinity.");
  }

  const keyOf = resolver ?? defaultResolver;
  // key -> { value, expiresAt }. A Map remembers the order entries were added,
  // which is used to find the least recently used one.
  const cache = new Map();

  const isExpired = (entry) => Date.now() >= entry.expiresAt;

  function removeExpired() {
    if (ttl === Infinity) return;
    for (const [key, entry] of cache) {
      if (isExpired(entry)) cache.delete(key);
    }
  }

  function memoized(...args) {
    const key = keyOf(...args);

    const hit = cache.get(key);
    if (hit !== undefined) {
      if (!isExpired(hit)) {
        // Move the entry to the end, so it counts as the most recently used.
        cache.delete(key);
        cache.set(key, hit);
        return hit.value;
      }
      cache.delete(key);
    }

    const value = Reflect.apply(fn, this, args); // if this throws, nothing is cached
    const entry = { value, expiresAt: ttl === Infinity ? Infinity : Date.now() + ttl };
    cache.set(key, entry);

    while (cache.size > maxSize) {
      cache.delete(cache.keys().next().value); // the oldest entry
    }

    if (value !== null && value !== undefined && typeof value.then === "function") {
      // Do not remember a failed promise.
      Promise.resolve(value).then(undefined, () => {
        if (cache.get(key) === entry) cache.delete(key);
      });
    }
    return value;
  }

  /** Forgets every stored result. */
  memoized.clear = () => cache.clear();

  /** Forgets the result for these arguments. Returns true if there was one. */
  memoized.delete = (...args) => cache.delete(keyOf(...args));

  /** True if a result for these arguments is stored (and has not expired). */
  memoized.has = (...args) => {
    const entry = cache.get(keyOf(...args));
    return entry !== undefined && !isExpired(entry);
  };

  /** Number of stored results (expired ones are removed first). */
  Object.defineProperty(memoized, "size", {
    get() {
      removeExpired();
      return cache.size;
    },
  });

  return memoized;
}
