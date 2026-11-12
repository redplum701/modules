/**
 * priority-queue
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A priority queue built on a binary heap: add items in any order and always
 *   take out the one that comes first. Add and remove take O(log n), and the
 *   next item can be read in O(1). Items with equal priority come out in the
 *   order they were added. Supports any comparison, so it works as a min-heap,
 *   max-heap, or by any key.
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
 *   - Wikipedia. Binary heap.
 *     https://en.wikipedia.org/wiki/Binary_heap
 *   - Wikipedia. Priority queue.
 *     https://en.wikipedia.org/wiki/Priority_queue
 *   - Floyd, R. W. Algorithm 245: Treesort. Communications of the ACM, 7(12), 1964 (building a heap in linear time).
 *     https://doi.org/10.1145/355588.365103
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 */

// The default order: smaller values first (works for numbers and strings).
function defaultCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * A priority queue (a binary heap).
 *
 * The comparison function decides which item comes first: compare(a, b) returns a
 * negative number if a should come out before b, a positive number if after, and 0
 * if they tie. This is the same rule as Array.prototype.sort.
 *
 * @example
 * const tasks = new PriorityQueue({ compare: (a, b) => a.due - b.due });
 * tasks.push({ name: "write", due: 3 });
 * tasks.push({ name: "email", due: 1 });
 * tasks.pop().name; // "email"
 */
export class PriorityQueue {
  #heap = []; // entries { value, order }, arranged as a binary heap
  #compare;
  #stable;
  #counter = 0; // numbers the entries, so ties come out first in, first out

  /**
   * @param {object} [options]
   * @param {(a: *, b: *) => number} [options.compare] - The order. Default: smaller
   *   values first (a min-heap). For a max-heap use (a, b) => b - a.
   * @param {boolean} [options.stable=true] - When two items tie, take the one added first.
   *   false skips that tie-break (ties come out in any order).
   * @param {Iterable} [options.items] - Items to start with (built in linear time).
   * @throws {TypeError} If compare is not a function, stable is not a boolean, or items is not iterable.
   */
  constructor(options = {}) {
    const { compare = defaultCompare, stable = true, items } = options;
    if (typeof compare !== "function") {
      throw new TypeError("PriorityQueue: compare must be a function.");
    }
    if (typeof stable !== "boolean") {
      throw new TypeError("PriorityQueue: stable must be a boolean.");
    }
    this.#compare = compare;
    this.#stable = stable;

    if (items !== undefined) {
      if (items === null || typeof items[Symbol.iterator] !== "function") {
        throw new TypeError("PriorityQueue: items must be iterable.");
      }
      for (const value of items) this.#heap.push({ value, order: this.#counter++ });
      // Floyd's method: fix the heap from the last parent upward.
      for (let i = (this.#heap.length >> 1) - 1; i >= 0; i -= 1) this.#siftDown(i);
    }
  }

  /**
   * Builds a queue from an iterable.
   *
   * @param {Iterable} items - The items.
   * @param {object} [options] - The constructor options (compare, stable).
   * @returns {PriorityQueue}
   */
  static from(items, options = {}) {
    return new PriorityQueue({ ...options, items });
  }

  /** How many items are in the queue. */
  get size() {
    return this.#heap.length;
  }

  /** True if the queue is empty. */
  get isEmpty() {
    return this.#heap.length === 0;
  }

  // Does entry `a` come out before entry `b`?
  #before(a, b) {
    const result = this.#compare(a.value, b.value);
    return result < 0 || (result === 0 && this.#stable && a.order < b.order);
  }

  #swap(i, j) {
    [this.#heap[i], this.#heap[j]] = [this.#heap[j], this.#heap[i]];
  }

  #siftUp(index) {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.#before(this.#heap[i], this.#heap[parent])) break;
      this.#swap(i, parent);
      i = parent;
    }
  }

  #siftDown(index) {
    const length = this.#heap.length;
    let i = index;
    for (;;) {
      const left = 2 * i + 1;
      const right = left + 1;
      let first = i;
      if (left < length && this.#before(this.#heap[left], this.#heap[first])) first = left;
      if (right < length && this.#before(this.#heap[right], this.#heap[first])) first = right;
      if (first === i) return;
      this.#swap(i, first);
      i = first;
    }
  }

  /**
   * Adds an item.
   *
   * @param {*} value - Anything the comparison function can order.
   * @returns {number} The new size.
   */
  push(value) {
    this.#heap.push({ value, order: this.#counter++ });
    this.#siftUp(this.#heap.length - 1);
    return this.#heap.length;
  }

  /**
   * Adds several items.
   *
   * @param {Iterable} items - The items.
   * @returns {number} The new size.
   * @throws {TypeError} If items is not iterable.
   */
  pushAll(items) {
    if (items === null || items === undefined || typeof items[Symbol.iterator] !== "function") {
      throw new TypeError("pushAll: expected an iterable.");
    }
    for (const value of items) this.push(value);
    return this.#heap.length;
  }

  /**
   * Removes and returns the item that comes first.
   *
   * @returns {*} The item, or undefined if the queue is empty.
   */
  pop() {
    if (this.#heap.length === 0) return undefined;
    const top = this.#heap[0];
    const last = this.#heap.pop();
    if (this.#heap.length > 0) {
      this.#heap[0] = last;
      this.#siftDown(0);
    }
    return top.value;
  }

  /**
   * Returns the item that comes first, without removing it.
   *
   * @returns {*} The item, or undefined if the queue is empty.
   */
  peek() {
    return this.#heap.length === 0 ? undefined : this.#heap[0].value;
  }

  /** Removes every item. */
  clear() {
    this.#heap = [];
  }

  /**
   * Removes the items one by one, in order, until the queue is empty. The queue
   * is emptied as you go; stop early and the rest stay in the queue.
   *
   * @yields {*}
   */
  *drain() {
    while (this.#heap.length > 0) yield this.pop();
  }

  /**
   * All items in order, without changing the queue (it works on a copy).
   *
   * @returns {Array}
   */
  toSortedArray() {
    const copy = new PriorityQueue({ compare: this.#compare, stable: this.#stable });
    copy.#heap = this.#heap.map((entry) => ({ ...entry })); // a heap copied as it is stays a heap
    copy.#counter = this.#counter;
    return [...copy.drain()];
  }
}
