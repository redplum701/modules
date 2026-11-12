/**
 * lru-cache
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A least-recently-used (LRU) cache: a key-value store with a size limit that
 *   drops the item that has gone longest without being used. Optional
 *   per-item expiry time, an eviction callback, and constant-time get, set,
 *   and delete. Built on the insertion order of a Map.
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
 *   - Wikipedia. Cache replacement policies: Least recently used (LRU).
 *     https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)
 *   - MDN Web Docs. Map (iteration in insertion order). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 *   - Isaacs. node-lru-cache (a full-featured library, for comparison).
 *     https://github.com/isaacs/node-lru-cache
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 */

/**
 * A least-recently-used cache.
 *
 * "Used" means read with get() or written with set(). When the cache is full
 * and a new key is added, the key that was used longest ago is dropped.
 *
 * @example
 * const cache = new LruCache({ maxSize: 2 });
 * cache.set("a", 1);
 * cache.set("b", 2);
 * cache.get("a");      // 1 (now "b" is the least recently used)
 * cache.set("c", 3);   // drops "b"
 * cache.has("b");      // false
 */
export class LruCache {
  // A Map remembers the order keys were added. Re-adding a key on every use
  // keeps the least recently used key first and the most recently used last.
  #entries = new Map(); // key -> { value, expiresAt }
  #maxSize;
  #ttl;
  #onEvict;

  /**
   * @param {object} options
   * @param {number} options.maxSize - The most items to keep (a positive integer).
   * @param {number} [options.ttl=Infinity] - How long an item lives, in milliseconds,
   *   counted from when it was set. Infinity: never expires.
   * @param {(key: *, value: *, reason: "capacity"|"expired") => void} [options.onEvict]
   *   Called when an item is dropped to make room, or found expired. Not called for
   *   delete(), clear(), or when set() replaces a value.
   * @throws {RangeError} If maxSize is not a positive integer, or ttl is not a positive number.
   * @throws {TypeError} If options is missing, or onEvict is not a function.
   */
  constructor(options) {
    if (typeof options !== "object" || options === null) {
      throw new TypeError("LruCache: options with maxSize are required.");
    }
    const { maxSize, ttl = Infinity, onEvict } = options;
    if (!Number.isInteger(maxSize) || maxSize < 1) {
      throw new RangeError("LruCache: maxSize must be a positive integer.");
    }
    if (ttl !== Infinity && !(typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0)) {
      throw new RangeError("LruCache: ttl must be a positive number or Infinity.");
    }
    if (onEvict !== undefined && typeof onEvict !== "function") {
      throw new TypeError("LruCache: onEvict must be a function.");
    }
    this.#maxSize = maxSize;
    this.#ttl = ttl;
    this.#onEvict = onEvict;
  }

  /** The most items the cache keeps. */
  get maxSize() {
    return this.#maxSize;
  }

  /**
   * How many items are stored. This can include items that have expired but
   * have not been noticed yet; call purgeExpired() to remove those.
   */
  get size() {
    return this.#entries.size;
  }

  #isExpired(entry) {
    return Date.now() >= entry.expiresAt;
  }

  // Removes an expired entry and reports it. Returns true if the entry was expired.
  #dropIfExpired(key, entry) {
    if (!this.#isExpired(entry)) return false;
    this.#entries.delete(key);
    if (this.#onEvict) this.#onEvict(key, entry.value, "expired");
    return true;
  }

  /**
   * Reads a value and marks the key as the most recently used.
   *
   * @param {*} key - Any value (compared like Map keys).
   * @returns {*} The value, or undefined if the key is missing or expired.
   *   (Use has() to tell a missing key from a stored undefined.)
   */
  get(key) {
    const entry = this.#entries.get(key);
    if (entry === undefined || this.#dropIfExpired(key, entry)) return undefined;

    this.#entries.delete(key); // move the key to the end: the most recently used
    this.#entries.set(key, entry);
    return entry.value;
  }

  /**
   * Reads a value WITHOUT marking it as used. Useful for looking without disturbing the order.
   *
   * @param {*} key - Any value.
   * @returns {*} The value, or undefined if the key is missing or expired.
   */
  peek(key) {
    const entry = this.#entries.get(key);
    if (entry === undefined || this.#dropIfExpired(key, entry)) return undefined;
    return entry.value;
  }

  /**
   * Tells whether a key is stored and not expired. Does not mark it as used.
   *
   * @param {*} key - Any value.
   * @returns {boolean}
   */
  has(key) {
    const entry = this.#entries.get(key);
    return entry !== undefined && !this.#dropIfExpired(key, entry);
  }

  /**
   * Stores a value and marks the key as the most recently used. If the cache
   * is full, the least recently used item is dropped.
   *
   * @param {*} key - Any value.
   * @param {*} value - Anything, including undefined.
   * @param {object} [options]
   * @param {number} [options.ttl] - Lifetime for this item in milliseconds, instead of
   *   the cache's ttl.
   * @returns {this} The cache, for chaining.
   * @throws {RangeError} If ttl is not a positive number or Infinity.
   */
  set(key, value, options = {}) {
    const { ttl = this.#ttl } = options;
    if (ttl !== Infinity && !(typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0)) {
      throw new RangeError("LruCache.set: ttl must be a positive number or Infinity.");
    }

    this.#entries.delete(key); // so that a re-set key moves to the end
    this.#entries.set(key, { value, expiresAt: ttl === Infinity ? Infinity : Date.now() + ttl });

    while (this.#entries.size > this.#maxSize) {
      const [oldestKey, oldest] = this.#entries.entries().next().value; // the first entry is the least recently used
      this.#entries.delete(oldestKey);
      if (this.#onEvict) this.#onEvict(oldestKey, oldest.value, "capacity");
    }
    return this;
  }

  /**
   * Removes a key.
   *
   * @param {*} key - Any value.
   * @returns {boolean} true if the key was stored.
   */
  delete(key) {
    return this.#entries.delete(key);
  }

  /** Removes every item. */
  clear() {
    this.#entries.clear();
  }

  /**
   * Removes every expired item now.
   *
   * @returns {number} How many were removed.
   */
  purgeExpired() {
    let removed = 0;
    for (const [key, entry] of [...this.#entries]) {
      if (this.#dropIfExpired(key, entry)) removed += 1;
    }
    return removed;
  }

  /**
   * The keys, most recently used first. Expired items are skipped. Reading
   * does not change the order.
   *
   * @returns {Array}
   */
  keys() {
    return this.entries().map(([key]) => key);
  }

  /**
   * The values, most recently used first. Expired items are skipped.
   *
   * @returns {Array}
   */
  values() {
    return this.entries().map(([, value]) => value);
  }

  /**
   * The [key, value] pairs, most recently used first. Expired items are skipped.
   *
   * @returns {Array<[*, *]>}
   */
  entries() {
    const live = [];
    for (const [key, entry] of this.#entries) {
      if (!this.#isExpired(entry)) live.push([key, entry.value]);
    }
    return live.reverse();
  }

  /** Goes through the [key, value] pairs, most recently used first. */
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
