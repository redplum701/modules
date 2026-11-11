/**
 * combinatorics
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Counting formulas as exact BigInt values: factorial, permutations (nPk),
 *   combinations (nCk), and combinations with repetition. Uses binary
 *   splitting for large products and the exact multiplicative formula for
 *   binomial coefficients, so there is no overflow and no rounding.
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
 *   - Wikipedia. Factorial.
 *     https://en.wikipedia.org/wiki/Factorial
 *   - Wikipedia. Binomial coefficient (computing the value: the multiplicative formula).
 *     https://en.wikipedia.org/wiki/Binomial_coefficient
 *   - Wikipedia. Permutation (k-permutations of n).
 *     https://en.wikipedia.org/wiki/Permutation
 *   - Wikipedia. Binary splitting.
 *     https://en.wikipedia.org/wiki/Binary_splitting
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */

const MAX_FACTORIAL = 100000; // 100000! has 456,574 digits
const MAX_STEPS = 100000; // the most multiplications permutations and combinations will do

// Turns a number or BigInt argument into a non-negative BigInt.
function toBigIntArgument(value, name, fnName) {
  if (typeof value === "bigint") {
    if (value < 0n) throw new RangeError(`${fnName}: ${name} must not be negative.`);
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(`${fnName}: ${name} must be a safe integer (use a BigInt for larger values).`);
    }
    if (value < 0) throw new RangeError(`${fnName}: ${name} must not be negative.`);
    return BigInt(value);
  }
  throw new TypeError(`${fnName}: ${name} must be a number or BigInt.`);
}

// The product of every integer from low to high, with both ends included.
// Splitting the range in half keeps the numbers being multiplied about the
// same size, which is much faster than multiplying one by one.
function productOfRange(low, high) {
  if (low > high) return 1n;
  if (high - low < 8n) {
    let result = low;
    for (let i = low + 1n; i <= high; i += 1n) result *= i;
    return result;
  }
  const middle = (low + high) / 2n;
  return productOfRange(low, middle) * productOfRange(middle + 1n, high);
}

/**
 * The factorial n! = 1 x 2 x ... x n, with 0! = 1.
 *
 * @param {number|bigint} n - A non-negative integer, up to 100,000.
 * @returns {bigint}
 * @throws {TypeError} If n is not a number or BigInt.
 * @throws {RangeError} If n is negative, not a safe integer, or above 100,000.
 */
export function factorial(n) {
  const count = toBigIntArgument(n, "n", "factorial");
  if (count > BigInt(MAX_FACTORIAL)) {
    throw new RangeError(`factorial: n must be at most ${MAX_FACTORIAL}.`);
  }
  return productOfRange(1n, count);
}

/**
 * The number of ordered ways to pick k items from n: nPk = n! / (n - k)!
 * which is n x (n - 1) x ... x (n - k + 1). It is 0 when k is larger than n.
 *
 * @param {number|bigint} n - How many items there are.
 * @param {number|bigint} k - How many to pick (at most 100,000).
 * @returns {bigint}
 * @throws {TypeError} If an argument is not a number or BigInt.
 * @throws {RangeError} If an argument is negative or not a safe integer, or k is above 100,000.
 */
export function permutations(n, k) {
  const total = toBigIntArgument(n, "n", "permutations");
  const picked = toBigIntArgument(k, "k", "permutations");
  if (picked > total) return 0n;
  if (picked > BigInt(MAX_STEPS)) {
    throw new RangeError(`permutations: k must be at most ${MAX_STEPS}.`);
  }
  return productOfRange(total - picked + 1n, total);
}

/**
 * The number of ways to choose k items from n when order does not matter,
 * the binomial coefficient nCk = n! / (k! (n - k)!). It is 0 when k is larger than n.
 *
 * Computed exactly by the multiplicative formula. Each step gives a whole
 * number: after step i the running value is C(n - k + i, i).
 *
 * @param {number|bigint} n - How many items there are.
 * @param {number|bigint} k - How many to choose. min(k, n - k) must be at most 100,000.
 * @returns {bigint}
 * @throws {TypeError} If an argument is not a number or BigInt.
 * @throws {RangeError} If an argument is negative or not a safe integer, or min(k, n - k) is above 100,000.
 */
export function combinations(n, k) {
  const total = toBigIntArgument(n, "n", "combinations");
  let chosen = toBigIntArgument(k, "k", "combinations");
  if (chosen > total) return 0n;

  if (total - chosen < chosen) chosen = total - chosen; // C(n, k) = C(n, n - k): use the smaller side
  if (chosen > BigInt(MAX_STEPS)) {
    throw new RangeError(`combinations: min(k, n - k) must be at most ${MAX_STEPS}.`);
  }

  let result = 1n;
  for (let i = 1n; i <= chosen; i += 1n) {
    result = (result * (total - chosen + i)) / i; // always an exact division
  }
  return result;
}

/**
 * The number of ways to choose k items from n kinds when the same kind may
 * be chosen again and order does not matter ("multichoose"):
 * C(n + k - 1, k). With no kinds (n = 0) there is 1 way to choose nothing
 * and 0 ways to choose anything else.
 *
 * @param {number|bigint} n - How many kinds there are.
 * @param {number|bigint} k - How many to choose.
 * @returns {bigint}
 * @throws {TypeError} If an argument is not a number or BigInt.
 * @throws {RangeError} If an argument is negative or not a safe integer, or the work is too large.
 */
export function combinationsWithRepetition(n, k) {
  const kinds = toBigIntArgument(n, "n", "combinationsWithRepetition");
  const chosen = toBigIntArgument(k, "k", "combinationsWithRepetition");
  if (kinds === 0n) return chosen === 0n ? 1n : 0n;
  return combinations(kinds + chosen - 1n, chosen);
}
