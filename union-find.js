/**
 * union-find
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Union-Find (disjoint-set union): keeps track of which items are in the same
 *   group while groups are merged. UnionFind works with items 0 to n-1;
 *   KeyedUnionFind works with any keys (strings, objects...). Uses path
 *   halving and union by size, so each operation is nearly constant time.
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
 *   - Wikipedia. Disjoint-set data structure.
 *     https://en.wikipedia.org/wiki/Disjoint-set_data_structure
 *   - Tarjan, R. E. Efficiency of a good but not linear set union algorithm. Journal of the ACM, 22(2), 1975.
 *     https://doi.org/10.1145/321879.321884
 *   - MDN Web Docs. Int32Array. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 */

const MAX_SIZE = 50_000_000;
const MIN_CAPACITY = 16;

/**
 * Union-Find for the items 0, 1, 2, ... n - 1.
 *
 * Every item starts in a group of its own. union(a, b) merges the groups of
 * a and b; connected(a, b) tells whether they are in the same group.
 *
 * @example
 * const groups = new UnionFind(5);
 * groups.union(0, 1);
 * groups.union(3, 4);
 * groups.connected(0, 1); // true
 * groups.connected(1, 3); // false
 * groups.count;           // 3 groups: {0,1}, {2}, {3,4}
 */
export class UnionFind {
  #parent; // parent[i] is the item above i in its tree; a root is its own parent
  #sizes; // sizes[root] is how many items the tree holds
  #length = 0;
  #count = 0;

  /**
   * @param {number} [length=0] - How many items to start with (0 up to 50,000,000).
   * @throws {RangeError} If length is not an integer from 0 to 50,000,000.
   */
  constructor(length = 0) {
    if (!Number.isInteger(length) || length < 0 || length > MAX_SIZE) {
      throw new RangeError(`UnionFind: length must be an integer from 0 to ${MAX_SIZE}.`);
    }
    const capacity = Math.max(length, MIN_CAPACITY);
    this.#parent = new Int32Array(capacity);
    this.#sizes = new Int32Array(capacity);
    for (let i = 0; i < length; i += 1) {
      this.#parent[i] = i;
      this.#sizes[i] = 1;
    }
    this.#length = length;
    this.#count = length;
  }

  /** How many items there are. */
  get length() {
    return this.#length;
  }

  /** How many separate groups there are. */
  get count() {
    return this.#count;
  }

  #check(item) {
    if (!Number.isInteger(item) || item < 0 || item >= this.#length) {
      throw new RangeError(`UnionFind: the item must be an integer from 0 to ${this.#length - 1}.`);
    }
  }

  /**
   * Adds a new item in a group of its own.
   *
   * @returns {number} The new item's number (the old length).
   * @throws {RangeError} If there are already 50,000,000 items.
   */
  add() {
    if (this.#length >= MAX_SIZE) {
      throw new RangeError(`UnionFind: cannot hold more than ${MAX_SIZE} items.`);
    }
    if (this.#length === this.#parent.length) {
      const capacity = Math.min(this.#parent.length * 2, MAX_SIZE);
      const parent = new Int32Array(capacity);
      const sizes = new Int32Array(capacity);
      parent.set(this.#parent);
      sizes.set(this.#sizes);
      this.#parent = parent;
      this.#sizes = sizes;
    }
    const item = this.#length;
    this.#parent[item] = item;
    this.#sizes[item] = 1;
    this.#length += 1;
    this.#count += 1;
    return item;
  }

  /**
   * Finds the representative item of the group that contains `item`. Two items
   * are in the same group exactly when they have the same representative.
   * The representative can change when groups are merged.
   *
   * @param {number} item - An integer from 0 to length - 1.
   * @returns {number}
   * @throws {RangeError} If item is not a valid item number.
   */
  find(item) {
    this.#check(item);
    let current = item;
    while (this.#parent[current] !== current) {
      // Path halving: point each visited item at its grandparent, which keeps the trees flat.
      this.#parent[current] = this.#parent[this.#parent[current]];
      current = this.#parent[current];
    }
    return current;
  }

  /**
   * Merges the groups of two items.
   *
   * @param {number} a - An item number.
   * @param {number} b - An item number.
   * @returns {boolean} true if two different groups were merged, false if the
   *   items were already in the same group.
   * @throws {RangeError} If an item is not a valid item number.
   */
  union(a, b) {
    let rootA = this.find(a);
    let rootB = this.find(b);
    if (rootA === rootB) return false;

    if (this.#sizes[rootA] < this.#sizes[rootB]) [rootA, rootB] = [rootB, rootA]; // the smaller tree goes under the bigger
    this.#parent[rootB] = rootA;
    this.#sizes[rootA] += this.#sizes[rootB];
    this.#count -= 1;
    return true;
  }

  /**
   * Tells whether two items are in the same group.
   *
   * @param {number} a - An item number.
   * @param {number} b - An item number.
   * @returns {boolean}
   * @throws {RangeError} If an item is not a valid item number.
   */
  connected(a, b) {
    return this.find(a) === this.find(b);
  }

  /**
   * How many items are in the group that contains `item`.
   *
   * @param {number} item - An item number.
   * @returns {number}
   * @throws {RangeError} If item is not a valid item number.
   */
  componentSize(item) {
    return this.#sizes[this.find(item)];
  }

  /**
   * Lists the groups. Each group is an array of its items in increasing order,
   * and the groups are ordered by their smallest item.
   *
   * @returns {number[][]}
   */
  groups() {
    const byRoot = new Map();
    for (let item = 0; item < this.#length; item += 1) {
      const root = this.find(item);
      if (byRoot.has(root)) byRoot.get(root).push(item);
      else byRoot.set(root, [item]);
    }
    return [...byRoot.values()];
  }
}

/**
 * Union-Find for any kinds of keys: strings, numbers, objects... Keys are
 * compared like Map keys. Items are added when they are first mentioned.
 *
 * @example
 * const friends = new KeyedUnionFind();
 * friends.union("Mei", "Sam");
 * friends.union("Sam", "Ana");
 * friends.connected("Mei", "Ana"); // true
 */
export class KeyedUnionFind {
  #ids = new Map(); // key -> item number
  #keys = []; // item number -> key
  #sets = new UnionFind(0);

  /** How many keys there are. */
  get length() {
    return this.#keys.length;
  }

  /** How many separate groups there are. */
  get count() {
    return this.#sets.count;
  }

  /**
   * Adds a key in a group of its own, if it is not there yet.
   *
   * @param {*} key - Any value.
   * @returns {boolean} true if the key was new.
   */
  add(key) {
    if (this.#ids.has(key)) return false;
    this.#ids.set(key, this.#sets.add());
    this.#keys.push(key);
    return true;
  }

  /**
   * Tells whether the key has been added.
   *
   * @param {*} key - Any value.
   * @returns {boolean}
   */
  has(key) {
    return this.#ids.has(key);
  }

  #idOf(key) {
    if (!this.#ids.has(key)) {
      throw new RangeError("KeyedUnionFind: the key has not been added.");
    }
    return this.#ids.get(key);
  }

  /**
   * Finds the representative key of the group that contains `key`.
   *
   * @param {*} key - A key that has been added.
   * @returns {*} A key of that group.
   * @throws {RangeError} If the key has not been added.
   */
  find(key) {
    return this.#keys[this.#sets.find(this.#idOf(key))];
  }

  /**
   * Merges the groups of two keys. A key that has not been added yet is added first.
   *
   * @param {*} a - Any value.
   * @param {*} b - Any value.
   * @returns {boolean} true if two different groups were merged.
   */
  union(a, b) {
    this.add(a);
    this.add(b);
    return this.#sets.union(this.#idOf(a), this.#idOf(b));
  }

  /**
   * Tells whether two keys are in the same group. A key that has not been
   * added is not connected to anything.
   *
   * @param {*} a - Any value.
   * @param {*} b - Any value.
   * @returns {boolean}
   */
  connected(a, b) {
    if (!this.#ids.has(a) || !this.#ids.has(b)) return false;
    return this.#sets.connected(this.#ids.get(a), this.#ids.get(b));
  }

  /**
   * How many keys are in the group that contains `key`.
   *
   * @param {*} key - A key that has been added.
   * @returns {number}
   * @throws {RangeError} If the key has not been added.
   */
  componentSize(key) {
    return this.#sets.componentSize(this.#idOf(key));
  }

  /**
   * Lists the groups. Inside a group, keys are in the order they were added,
   * and the groups are ordered by their earliest key.
   *
   * @returns {Array[]}
   */
  groups() {
    return this.#sets.groups().map((ids) => ids.map((id) => this.#keys[id]));
  }
}
