/**
 * weighted-random
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Weighted random choice: pick items so that an item with weight 3 is three
 *   times as likely as an item with weight 1. A one-off weightedChoice, a
 *   reusable picker (binary search over running totals), and weighted sampling
 *   without repeats. The core of fortune-telling slips and gacha drops.
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
 *   - Wikipedia. Fitness proportionate selection (roulette wheel selection).
 *     https://en.wikipedia.org/wiki/Fitness_proportionate_selection
 *   - Efraimidis, P. S. and Spirakis, P. G. Weighted random sampling with a reservoir. Information Processing Letters, 97(5), 2006.
 *     https://doi.org/10.1016/j.ipl.2005.11.003
 *   - Wikipedia. Binary search algorithm.
 *     https://en.wikipedia.org/wiki/Binary_search_algorithm
 *   - MDN Web Docs. Math.random(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */

function nextRandom(random, fnName) {
  if (typeof random !== "function") {
    throw new TypeError(`${fnName}: random must be a function.`);
  }
  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw new RangeError(`${fnName}: random() must return a number from 0 up to, but not including, 1.`);
  }
  return value;
}

// Checks the items and works out one weight per item.
function readWeights(items, weights, fnName) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new RangeError(`${fnName}: items must be a non-empty array.`);
  }

  let list;
  if (typeof weights === "function") {
    list = items.map((item, index) => weights(item, index));
  } else if (Array.isArray(weights)) {
    if (weights.length !== items.length) {
      throw new RangeError(`${fnName}: weights must have one weight for each item.`);
    }
    list = weights;
  } else {
    throw new TypeError(`${fnName}: weights must be an array of numbers, or a function (item, index) => number.`);
  }

  let total = 0;
  for (const weight of list) {
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`${fnName}: every weight must be a finite number, 0 or more.`);
    }
    total += weight;
  }
  if (!(total > 0) || !Number.isFinite(total)) {
    throw new RangeError(`${fnName}: the weights must add up to more than 0 (and be finite).`);
  }
  return { list: Float64Array.from(list), total };
}

// Running totals: cumulative[i] is the sum of the weights up to and including item i.
function cumulativeOf(list) {
  const cumulative = new Float64Array(list.length);
  let running = 0;
  for (let i = 0; i < list.length; i += 1) {
    running += list[i];
    cumulative[i] = running;
  }
  return cumulative;
}

// Picks the first item whose running total is above a random point in [0, total).
// Items with weight 0 can never be picked: their running total equals the one before.
function pickIndex(cumulative, list, total, random, fnName) {
  const target = nextRandom(random, fnName) * total;

  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (cumulative[middle] > target) high = middle;
    else low = middle + 1;
  }

  if (cumulative[low] <= target) {
    // Rounding put the target at the very end: use the last item that has a weight.
    let last = list.length - 1;
    while (list[last] === 0) last -= 1;
    return last;
  }
  return low;
}

/**
 * Picks one item at random, in proportion to its weight.
 *
 * With weights [1, 3], the second item comes out three times as often as the
 * first. Items with weight 0 are never picked.
 *
 * @param {Array} items - The items to choose from (at least one).
 * @param {number[]|((item: *, index: number) => number)} weights - A weight for each item
 *   (finite numbers, 0 or more, adding up to more than 0), or a function that gives an item's weight.
 * @param {object} [options]
 * @param {() => number} [options.random=Math.random] - Uniform random source returning [0, 1).
 * @returns {*} One of the items.
 * @throws {RangeError} If items is empty, the weights do not match or are invalid, or random() returns
 *   a number outside [0, 1).
 * @throws {TypeError} If weights or random has the wrong type.
 */
export function weightedChoice(items, weights, options = {}) {
  const { random = Math.random } = options;
  const { list, total } = readWeights(items, weights, "weightedChoice");
  return items[pickIndex(cumulativeOf(list), list, total, random, "weightedChoice")];
}

/**
 * Prepares a weighted picker for repeated use. The running totals are worked
 * out once, and every pick is a binary search (O(log n)), so it is the way to
 * go when you pick many times from the same list.
 *
 * @param {Array} items - The items to choose from (at least one).
 * @param {number[]|((item: *, index: number) => number)} weights - See weightedChoice.
 * @param {object} [options]
 * @param {() => number} [options.random=Math.random] - Uniform random source returning [0, 1).
 * @returns {{pick: () => *, pickMany: (count: number) => Array, probabilities: () => number[],
 *   size: number, totalWeight: number}}
 *   pick(): one item. pickMany(count): count items (the same item can come up again).
 *   probabilities(): each item's chance, adding up to 1.
 * @throws {RangeError} If items is empty, or the weights do not match or are invalid.
 * @throws {TypeError} If weights or random has the wrong type.
 */
export function createWeightedPicker(items, weights, options = {}) {
  const { random = Math.random } = options;
  const { list, total } = readWeights(items, weights, "createWeightedPicker");
  const cumulative = cumulativeOf(list);
  const snapshot = [...items]; // later changes to the caller's array do not matter

  return {
    size: snapshot.length,
    totalWeight: total,
    pick() {
      return snapshot[pickIndex(cumulative, list, total, random, "pick")];
    },
    pickMany(count) {
      if (!Number.isInteger(count) || count < 0 || count > 10_000_000) {
        throw new RangeError("pickMany: count must be an integer from 0 to 10,000,000.");
      }
      return Array.from({ length: count }, () => snapshot[pickIndex(cumulative, list, total, random, "pickMany")]);
    },
    probabilities() {
      return Array.from(list, (weight) => weight / total);
    },
  };
}

/**
 * Picks several different items at random, in proportion to their weights,
 * without picking the same item twice (weighted sampling without replacement,
 * by the Efraimidis-Spirakis method). Heavier items tend to come first.
 *
 * Only items with a weight above 0 can be picked, so `count` must not be
 * larger than the number of those.
 *
 * @param {Array} items - The items to choose from.
 * @param {number[]|((item: *, index: number) => number)} weights - See weightedChoice.
 * @param {number} count - How many different items to pick.
 * @param {object} [options]
 * @param {() => number} [options.random=Math.random] - Uniform random source returning [0, 1).
 * @returns {Array} The picked items, in the order they were drawn.
 * @throws {RangeError} If items is empty, the weights are invalid, or count is not an integer from 0 to
 *   the number of items with a positive weight.
 * @throws {TypeError} If weights or random has the wrong type.
 */
export function weightedSample(items, weights, count, options = {}) {
  const { random = Math.random } = options;
  const { list } = readWeights(items, weights, "weightedSample");

  const candidates = [];
  list.forEach((weight, index) => {
    if (weight > 0) candidates.push({ index, weight });
  });
  if (!Number.isInteger(count) || count < 0 || count > candidates.length) {
    throw new RangeError(`weightedSample: count must be an integer from 0 to ${candidates.length} (the items with a weight above 0).`);
  }

  // Each item gets the key ln(u) / weight for a random u from (0, 1]; the items with the
  // largest keys are the sample. A bigger weight pushes the key toward 0 (the largest).
  const keyed = candidates.map(({ index, weight }) => ({
    index,
    key: Math.log(1 - nextRandom(random, "weightedSample")) / weight,
  }));
  keyed.sort((a, b) => b.key - a.key);
  return keyed.slice(0, count).map(({ index }) => items[index]);
}
