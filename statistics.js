/**
 * statistics
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Basic statistics for an array of numbers: sum, mean, median, mode(s),
 *   variance, standard deviation, min, max, range, and percentiles (two
 *   methods), plus a summary that computes them together. Sums use
 *   compensated (Neumaier) addition and variance uses Welford's method, so
 *   results stay accurate with large or many numbers.
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
 *   - Wikipedia. Algorithms for calculating variance (Welford's online algorithm).
 *     https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
 *   - Wikipedia. Kahan summation algorithm (including the Neumaier variant).
 *     https://en.wikipedia.org/wiki/Kahan_summation_algorithm
 *   - Hyndman, R. J. and Fan, Y. Sample quantiles in statistical packages. The American Statistician, 50(4), 1996.
 *     https://doi.org/10.1080/00031305.1996.10473566
 *   - Wikipedia. Percentile.
 *     https://en.wikipedia.org/wiki/Percentile
 */

const PERCENTILE_METHODS = ["linear", "nearest-rank"];

// Checks the input: an array of finite numbers, with at least `minLength` items.
function readValues(values, fnName, minLength = 1) {
  if (!Array.isArray(values)) {
    throw new TypeError(`${fnName}: expected an array of numbers.`);
  }
  if (values.length < minLength) {
    throw new RangeError(
      minLength === 1
        ? `${fnName}: the array must not be empty.`
        : `${fnName}: the array needs at least ${minLength} numbers.`
    );
  }
  for (const value of values) {
    if (typeof value !== "number") {
      throw new TypeError(`${fnName}: every item must be a number.`);
    }
    if (!Number.isFinite(value)) {
      throw new RangeError(`${fnName}: every number must be finite (no NaN or Infinity).`);
    }
  }
}

// A sorted copy, as a typed array (a typed array sorts numbers as numbers).
function sortedCopy(values) {
  return Float64Array.from(values).sort();
}

function medianOfSorted(sorted) {
  const middle = sorted.length >> 1;
  if (sorted.length % 2 === 1) return sorted[middle];
  return sorted[middle - 1] + (sorted[middle] - sorted[middle - 1]) / 2; // avoids overflow of a + b
}

function percentileOfSorted(sorted, p, method) {
  const n = sorted.length;
  if (method === "nearest-rank") {
    // The smallest value such that at least p percent of the values are at or below it.
    const rank = Math.ceil(Number(((p * n) / 100).toPrecision(12))); // toPrecision hides tiny float errors
    return sorted[Math.max(rank, 1) - 1];
  }
  // "linear": the value at position (n - 1) * p / 100, between neighbors.
  const position = ((n - 1) * p) / 100;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function readPercent(p, fnName) {
  if (typeof p !== "number" || !(p >= 0 && p <= 100)) {
    throw new RangeError(`${fnName}: p must be a number from 0 to 100.`);
  }
}

function readMethod(options, fnName) {
  const { method = "linear" } = options;
  if (!PERCENTILE_METHODS.includes(method)) {
    throw new RangeError(`${fnName}: method must be one of ${PERCENTILE_METHODS.join(", ")}.`);
  }
  return method;
}

/**
 * The sum of the numbers, using Neumaier's compensated addition so that small
 * rounding errors do not pile up (0.1 added ten times gives exactly 1).
 *
 * @param {number[]} values - Finite numbers. An empty array gives 0.
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If a number is not finite.
 */
export function sum(values) {
  readValues(values, "sum", 0);
  let total = 0;
  let correction = 0;
  for (const value of values) {
    const next = total + value;
    // Keep what was lost when the smaller of the two was added to the larger.
    if (Math.abs(total) >= Math.abs(value)) correction += total - next + value;
    else correction += value - next + total;
    total = next;
  }
  return total + correction;
}

/**
 * The average: the sum divided by how many numbers there are.
 *
 * @param {number[]} values - Finite numbers (at least one).
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function mean(values) {
  readValues(values, "mean");
  return sum(values) / values.length;
}

/**
 * The middle value. For an even count, the average of the two middle values.
 *
 * @param {number[]} values - Finite numbers (at least one). Not changed.
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function median(values) {
  readValues(values, "median");
  return medianOfSorted(sortedCopy(values));
}

/**
 * The most frequent value or values. When several values tie for the highest
 * count, all of them are returned (and when every value is different, that
 * means all of them).
 *
 * @param {number[]} values - Finite numbers (at least one).
 * @returns {number[]} The modes, in increasing order.
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function mode(values) {
  readValues(values, "mode");
  const counts = new Map();
  let highest = 0;
  for (const value of values) {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);
    if (count > highest) highest = count;
  }
  return [...counts].filter(([, count]) => count === highest).map(([value]) => value).sort((a, b) => a - b);
}

/**
 * The smallest number.
 *
 * @param {number[]} values - Finite numbers (at least one).
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function min(values) {
  readValues(values, "min");
  let result = values[0];
  for (const value of values) if (value < result) result = value;
  return result;
}

/**
 * The largest number.
 *
 * @param {number[]} values - Finite numbers (at least one).
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function max(values) {
  readValues(values, "max");
  let result = values[0];
  for (const value of values) if (value > result) result = value;
  return result;
}

/**
 * The spread between the largest and smallest numbers.
 *
 * @param {number[]} values - Finite numbers (at least one).
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function range(values) {
  return max(values) - min(values);
}

/**
 * The variance, by Welford's method (one pass, no large cancelling sums).
 *
 * @param {number[]} values - Finite numbers.
 * @param {object} [options]
 * @param {boolean} [options.population=false] - false (default): the sample variance,
 *   dividing by n - 1 (needs at least 2 numbers). true: the population variance,
 *   dividing by n (needs at least 1).
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If there are too few numbers or a number is not finite.
 */
export function variance(values, options = {}) {
  const { population = false } = options;
  readValues(values, "variance", population ? 1 : 2);

  let count = 0;
  let average = 0;
  let sumOfSquares = 0; // the sum of squared distances from the running average
  for (const value of values) {
    count += 1;
    const delta = value - average;
    average += delta / count;
    sumOfSquares += delta * (value - average);
  }
  return sumOfSquares / (population ? count : count - 1);
}

/**
 * The standard deviation: the square root of the variance.
 *
 * @param {number[]} values - Finite numbers.
 * @param {object} [options]
 * @param {boolean} [options.population=false] - See variance.
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If there are too few numbers or a number is not finite.
 */
export function standardDeviation(values, options = {}) {
  return Math.sqrt(variance(values, options));
}

/**
 * A percentile: the value below which p percent of the numbers fall.
 *
 * Methods:
 *   "linear" (default): interpolates between neighbors, like Excel's
 *     PERCENTILE.INC and NumPy's default. p = 50 is the median.
 *   "nearest-rank": always returns one of the actual numbers (the smallest
 *     value with at least p percent of the numbers at or below it).
 *
 * @param {number[]} values - Finite numbers (at least one). Not changed.
 * @param {number} p - From 0 to 100.
 * @param {object} [options]
 * @param {"linear"|"nearest-rank"} [options.method="linear"]
 * @returns {number}
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty, a number is not finite, p is outside 0 to 100,
 *   or the method is unknown.
 */
export function percentile(values, p, options = {}) {
  readValues(values, "percentile");
  readPercent(p, "percentile");
  const method = readMethod(options, "percentile");
  return percentileOfSorted(sortedCopy(values), p, method);
}

/**
 * Several statistics in one pass over the sorted data.
 *
 * @param {number[]} values - Finite numbers (at least one).
 * @returns {{count: number, sum: number, mean: number, median: number, mode: number[],
 *   min: number, max: number, range: number, q1: number, q3: number,
 *   variance: number|null, standardDeviation: number|null}}
 *   q1 and q3 are the 25th and 75th percentiles (linear). variance and
 *   standardDeviation are the sample values, or null when there is only one number.
 * @throws {TypeError} If values is not an array of numbers.
 * @throws {RangeError} If values is empty or a number is not finite.
 */
export function summary(values) {
  readValues(values, "summary");
  const sorted = sortedCopy(values);
  const count = values.length;
  const sampleVariance = count > 1 ? variance(values) : null;

  return {
    count,
    sum: sum(values),
    mean: mean(values),
    median: medianOfSorted(sorted),
    mode: mode(values),
    min: sorted[0],
    max: sorted[count - 1],
    range: sorted[count - 1] - sorted[0],
    q1: percentileOfSorted(sorted, 25, "linear"),
    q3: percentileOfSorted(sorted, 75, "linear"),
    variance: sampleVariance,
    standardDeviation: sampleVariance === null ? null : Math.sqrt(sampleVariance),
  };
}
