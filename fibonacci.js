/**
 * fibonacci
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Fibonacci numbers of any size as BigInt, computed in logarithmic time with
 *   the fast doubling method, with a result cache. Also gives the first n
 *   terms, an endless generator, negative indices, and a test for whether a
 *   number is a Fibonacci number.
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
 *   - Wikipedia. Fibonacci sequence.
 *     https://en.wikipedia.org/wiki/Fibonacci_sequence
 *   - Nayuki. Fast Fibonacci algorithms.
 *     https://www.nayuki.io/page/fast-fibonacci-algorithms
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 *   - MDN Web Docs. Generator functions (function*). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
 */

const MAX_INDEX = 5_000_000; // F(5,000,000) has about a million digits
const MAX_SAFE_INDEX = 78; // F(78) = 8944394323791464 is the last one below 2^53
const MAX_TERMS = 100000;
const CACHE_LIMIT = 1000;

const cache = new Map(); // index -> BigInt, oldest entries dropped first

// Fast doubling: from F(k) and F(k + 1), the pair for 2k and 2k + 1 is
//   F(2k)     = F(k) * (2 * F(k + 1) - F(k))
//   F(2k + 1) = F(k)^2 + F(k + 1)^2
// so only about log2(n) steps are needed. Walk the bits of n from the top.
function compute(n) {
  let a = 0n; // F(k)
  let b = 1n; // F(k + 1)
  for (let bit = 31 - Math.clz32(n); bit >= 0; bit -= 1) {
    const doubled = a * (2n * b - a); // F(2k)
    const next = a * a + b * b; // F(2k + 1)
    if ((n >> bit) & 1) {
      a = next;
      b = doubled + next;
    } else {
      a = doubled;
      b = next;
    }
  }
  return a;
}

function readIndex(n, fnName) {
  const index = typeof n === "bigint" ? Number(n) : n;
  if (typeof index !== "number" || !Number.isSafeInteger(index)) {
    throw new RangeError(`${fnName}: the index must be an integer.`);
  }
  if (Math.abs(index) > MAX_INDEX) {
    throw new RangeError(`${fnName}: the index must be between -${MAX_INDEX} and ${MAX_INDEX}.`);
  }
  return index;
}

/**
 * Returns the n-th Fibonacci number as a BigInt: F(0) = 0, F(1) = 1, F(2) = 1,
 * F(3) = 2, and so on.
 *
 * Negative indices follow the usual extension F(-n) = (-1)^(n+1) * F(n):
 * F(-1) = 1, F(-2) = -1, F(-3) = 2.
 *
 * Results are cached, so repeated calls are instant.
 *
 * @param {number|bigint} n - The index, from -5,000,000 to 5,000,000.
 * @returns {bigint}
 * @throws {RangeError} If n is not an integer within range.
 */
export function fibonacci(n) {
  const index = readIndex(n, "fibonacci");
  const magnitude = Math.abs(index);

  let value = cache.get(magnitude);
  if (value === undefined) {
    value = compute(magnitude);
    cache.set(magnitude, value);
    if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value); // drop the oldest
  }

  // For negative even indices the sign flips.
  return index < 0 && magnitude % 2 === 0 ? -value : value;
}

/**
 * Returns the n-th Fibonacci number as an ordinary number.
 *
 * @param {number|bigint} n - The index, from -78 to 78.
 * @returns {number}
 * @throws {RangeError} If |n| is above 78 (the value would not fit exactly in a number),
 *   or n is not an integer.
 */
export function fibonacciNumber(n) {
  const index = readIndex(n, "fibonacciNumber");
  if (Math.abs(index) > MAX_SAFE_INDEX) {
    throw new RangeError(`fibonacciNumber: |n| must be at most ${MAX_SAFE_INDEX}. Use fibonacci() for a BigInt.`);
  }
  return Number(fibonacci(index)) + 0; // + 0 turns -0 into 0
}

/**
 * Returns the first `count` Fibonacci numbers, starting from F(0).
 *
 * @param {number} count - How many terms (0 to 100,000).
 * @returns {bigint[]} For example, count 6 gives [0n, 1n, 1n, 2n, 3n, 5n].
 * @throws {RangeError} If count is not an integer from 0 to 100,000.
 */
export function fibonacciSequence(count) {
  if (!Number.isInteger(count) || count < 0 || count > MAX_TERMS) {
    throw new RangeError(`fibonacciSequence: count must be an integer from 0 to ${MAX_TERMS}.`);
  }
  const terms = [];
  let [a, b] = [0n, 1n];
  for (let i = 0; i < count; i += 1) {
    terms.push(a);
    [a, b] = [b, a + b];
  }
  return terms;
}

/**
 * An endless generator of Fibonacci numbers: 0n, 1n, 1n, 2n, 3n, 5n, ...
 * Stop it yourself (with break or take).
 *
 * @yields {bigint}
 */
export function* fibonacciGenerator() {
  let [a, b] = [0n, 1n];
  for (;;) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// The integer square root of a non-negative BigInt, by Newton's method.
function integerSquareRoot(value) {
  if (value < 2n) return value;
  let x = 1n << BigInt(Math.ceil(value.toString(2).length / 2)); // a first guess that is too large
  for (;;) {
    const next = (x + value / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
}

function isPerfectSquare(value) {
  const root = integerSquareRoot(value);
  return root * root === value;
}

/**
 * Checks whether a number is a Fibonacci number. It uses the fact that n is
 * a Fibonacci number exactly when 5n^2 + 4 or 5n^2 - 4 is a perfect square.
 *
 * @param {number|bigint} value - A whole number. Negative numbers and
 *   non-integers are not Fibonacci numbers.
 * @returns {boolean}
 * @throws {TypeError} If value is not a number or BigInt.
 * @throws {RangeError} If value is an unsafe integer number (use a BigInt instead).
 */
export function isFibonacci(value) {
  let n;
  if (typeof value === "bigint") {
    n = value;
  } else if (typeof value === "number") {
    if (!Number.isInteger(value)) return false; // NaN, Infinity, and 2.5
    if (!Number.isSafeInteger(value)) {
      throw new RangeError("isFibonacci: unsafe integer. Pass a BigInt instead.");
    }
    n = BigInt(value);
  } else {
    throw new TypeError("isFibonacci: expected a number or BigInt.");
  }

  if (n < 0n) return false;
  const squared = 5n * n * n;
  return isPerfectSquare(squared + 4n) || (squared >= 4n && isPerfectSquare(squared - 4n));
}
