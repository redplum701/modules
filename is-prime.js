/**
 * is-prime
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Checks whether a single number is prime. Uses the deterministic
 *   Miller-Rabin test with the first 13 primes as bases, which is exact for
 *   every integer below 3,317,044,064,679,887,385,961,981. Works with numbers
 *   and BigInt.
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
 *   - Wikipedia. Miller-Rabin primality test.
 *     https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
 *   - Sorenson, J. and Webster, J. Strong pseudoprimes to twelve prime bases. Mathematics of Computation, 86 (2017).
 *     https://arxiv.org/abs/1509.00864
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */

// Testing these 13 bases is enough to be exact below this limit
// (Sorenson and Webster, 2017).
const BASES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n];
const LIMIT = 3317044064679887385961981n;

// Computes (base ** exponent) % modulus without building a giant number.
function modPow(base, exponent, modulus) {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus;
    exponent >>= 1n;
    base = (base * base) % modulus;
  }
  return result;
}

function millerRabin(n) {
  if (n < 2n) return false;

  // Handle small primes and their multiples first.
  for (const prime of BASES) {
    if (n === prime) return true;
    if (n % prime === 0n) return false;
  }

  // Write n - 1 as d * 2^s with d odd.
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s += 1;
  }

  for (const base of BASES) {
    let x = modPow(base, d, n);
    if (x === 1n || x === n - 1n) continue;

    let isComposite = true;
    for (let round = 1; round < s; round += 1) {
      x = (x * x) % n;
      if (x === n - 1n) {
        isComposite = false;
        break;
      }
    }
    if (isComposite) return false;
  }
  return true;
}

/**
 * Checks whether a number is prime.
 *
 * @param {number|bigint} n - An integer. Numbers must be safe integers
 *   (use BigInt for anything larger). Non-integers return false.
 * @returns {boolean} True if n is prime.
 * @throws {TypeError} If n is not a number or BigInt.
 * @throws {RangeError} If n is an unsafe integer number, or is
 *   3,317,044,064,679,887,385,961,981 or larger.
 */
export function isPrime(n) {
  if (typeof n === "number") {
    if (!Number.isInteger(n)) return false; // NaN, Infinity, and 2.5 are not prime
    if (!Number.isSafeInteger(n)) {
      throw new RangeError("isPrime: unsafe integer. Pass a BigInt instead.");
    }
    return millerRabin(BigInt(n));
  }

  if (typeof n === "bigint") {
    if (n >= LIMIT) {
      throw new RangeError("isPrime: value is too large for the deterministic test.");
    }
    return millerRabin(n);
  }

  throw new TypeError("isPrime: expected a number or BigInt.");
}
