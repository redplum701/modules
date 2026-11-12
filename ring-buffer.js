/**
 * ring-buffer
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A fixed-size circular buffer (ring buffer): a queue with a set capacity
 *   that never grows. When it is full, the oldest item is overwritten (the
 *   default, good for "the last N items") or the new item is refused. Add and
 *   remove are constant time.
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
 *   - Wikipedia. Circular buffer.
 *     https://en.wikipedia.org/wiki/Circular_buffer
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 *   - MDN Web Docs. Iteration protocols. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */

const MAX_CAPACITY = 100_000_000;

/**
 * A fixed-size circular buffer.
 *
 * Items are kept in the order they were added. "Oldest" is the item added
 * first and "newest" the item added last.
 *
 * @example
 * const lastThree = new RingBuffer(3);
 * [1, 2, 3, 4, 5].forEach((n) => lastThree.push(n));
 * lastThree.toArray(); // [3, 4, 5]
 */
export class RingBuffer {
  #items; // the storage, always `capacity` slots long
  #head = 0; // the slot of the oldest item
  #size = 0;
  #capacity;
  #overwrite;
  #onEvict;

  /**
   * @param {number} capacity - How many items fit (a positive integer, up to 100,000,000).
   * @param {object} [options]
   * @param {boolean} [options.overwrite=true] - When full: true drops the oldest item to
   *   make room; false refuses the new item (push returns false).
   * @param {(item: *) => void} [options.onEvict] - Called with each item that is dropped
   *   because the buffer was full (only when overwrite is true).
   * @throws {RangeError} If capacity is not a positive integer up to 100,000,000.
   * @throws {TypeError} If an option has the wrong type.
   */
  constructor(capacity, options = {}) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_CAPACITY) {
      throw new RangeError(`RingBuffer: capacity must be an integer from 1 to ${MAX_CAPACITY}.`);
    }
    const { overwrite = true, onEvict } = options;
    if (typeof overwrite !== "boolean") {
      throw new TypeError("RingBuffer: overwrite must be a boolean.");
    }
    if (onEvict !== undefined && typeof onEvict !== "function") {
      throw new TypeError("RingBuffer: onEvict must be a function.");
    }

    this.#capacity = capacity;
    this.#overwrite = overwrite;
    this.#onEvict = onEvict;
    this.#items = new Array(capacity);
  }

  /**
   * Makes a buffer from the items of an iterable, oldest first.
   *
   * @param {Iterable} items - The items to add.
   * @param {object} [options] - The constructor options, plus:
   * @param {number} [options.capacity] - Default: the number of items (at least 1).
   *   If there are more items than the capacity, the last ones are kept (or, with
   *   overwrite false, the first ones).
   * @returns {RingBuffer}
   * @throws {TypeError} If items is not iterable.
   */
  static from(items, options = {}) {
    if (items === null || items === undefined || typeof items[Symbol.iterator] !== "function") {
      throw new TypeError("RingBuffer.from: expected an iterable.");
    }
    const list = [...items];
    const { capacity = Math.max(list.length, 1), ...rest } = options;
    const buffer = new RingBuffer(capacity, rest);
    for (const item of list) buffer.push(item);
    return buffer;
  }

  /** How many items fit. */
  get capacity() {
    return this.#capacity;
  }

  /** How many items are in the buffer now. */
  get size() {
    return this.#size;
  }

  /** True if there are no items. */
  get isEmpty() {
    return this.#size === 0;
  }

  /** True if the buffer holds `capacity` items. */
  get isFull() {
    return this.#size === this.#capacity;
  }

  /**
   * Adds an item as the newest. If the buffer is full, the oldest item is
   * dropped (overwrite mode) or the item is refused (otherwise).
   *
   * @param {*} item - Anything, including undefined.
   * @returns {boolean} true if the item was added; false if it was refused.
   */
  push(item) {
    if (this.#size === this.#capacity) {
      if (!this.#overwrite) return false;

      const dropped = this.#items[this.#head];
      this.#items[this.#head] = item; // the new item takes the oldest item's slot
      this.#head = (this.#head + 1) % this.#capacity;
      if (this.#onEvict) this.#onEvict(dropped);
      return true;
    }

    this.#items[(this.#head + this.#size) % this.#capacity] = item;
    this.#size += 1;
    return true;
  }

  /**
   * Adds several items, oldest first.
   *
   * @param {Iterable} items - The items to add.
   * @returns {number} How many were added (all of them unless the buffer refuses items when full).
   * @throws {TypeError} If items is not iterable.
   */
  pushAll(items) {
    if (items === null || items === undefined || typeof items[Symbol.iterator] !== "function") {
      throw new TypeError("pushAll: expected an iterable.");
    }
    let added = 0;
    for (const item of items) {
      if (this.push(item)) added += 1;
    }
    return added;
  }

  /**
   * Removes and returns the oldest item.
   *
   * @returns {*} The item, or undefined if the buffer is empty.
   */
  shift() {
    if (this.#size === 0) return undefined;
    const item = this.#items[this.#head];
    this.#items[this.#head] = undefined; // let the garbage collector have it
    this.#head = (this.#head + 1) % this.#capacity;
    this.#size -= 1;
    return item;
  }

  /**
   * Removes and returns the newest item.
   *
   * @returns {*} The item, or undefined if the buffer is empty.
   */
  pop() {
    if (this.#size === 0) return undefined;
    const slot = (this.#head + this.#size - 1) % this.#capacity;
    const item = this.#items[slot];
    this.#items[slot] = undefined;
    this.#size -= 1;
    return item;
  }

  /**
   * Reads an item without removing it. 0 is the oldest; a negative index counts
   * from the newest (-1 is the newest).
   *
   * @param {number} index - An integer.
   * @returns {*} The item, or undefined if there is no item at that position.
   * @throws {TypeError} If index is not an integer.
   */
  at(index) {
    if (!Number.isInteger(index)) {
      throw new TypeError("at: index must be an integer.");
    }
    const position = index < 0 ? index + this.#size : index;
    if (position < 0 || position >= this.#size) return undefined;
    return this.#items[(this.#head + position) % this.#capacity];
  }

  /** The oldest item, or undefined if empty. Does not remove it. */
  peek() {
    return this.at(0);
  }

  /** The newest item, or undefined if empty. Does not remove it. */
  peekLast() {
    return this.at(-1);
  }

  /** Removes every item. */
  clear() {
    this.#items.fill(undefined);
    this.#head = 0;
    this.#size = 0;
  }

  /**
   * The items as an array, oldest first.
   *
   * @returns {Array}
   */
  toArray() {
    return Array.from(this);
  }

  /** Goes through the items, oldest first. */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.#size; i += 1) {
      yield this.#items[(this.#head + i) % this.#capacity];
    }
  }
}
