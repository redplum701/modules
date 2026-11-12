/**
 * sieve-of-eratosthenes
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Lists prime numbers with the Sieve of Eratosthenes: all primes up to a
 *   limit, all primes in a range (segmented sieve, so the range can sit far
 *   above zero), a prime count, and the n-th prime. The sieve stores only
 *   odd numbers, so it uses half the memory of a plain sieve.
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
 *   - Wikipedia. Sieve of Eratosthenes.
 *     https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
 *   - Wikipedia. Prime number theorem: approximations for the nth prime number.
 *     https://en.wikipedia.org/wiki/Prime_number_theorem#Approximations_for_the_nth_prime_number
 *   - MDN Web Docs. Uint8Array. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
 */

const MAX_LIMIT = 100_000_000; // the largest limit for a full sieve (about 50 MB of flags)
const MAX_RANGE = 20_000_000; // the most numbers primesBetween will look at in one call

function assertInteger(value, name, fnName) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${fnName}: ${name} must be a non-negative safe integer.`);
  }
}

// Builds the sieve. Only odd numbers are stored: flag i stands for 2 * i + 3.
// A flag of 1 means "composite" (not prime).
function buildSieve(limit) {
  const size = limit < 3 ? 0 : (limit - 1) >> 1; // how many odd numbers from 3 to limit
  const composite = new Uint8Array(size);

  for (let i = 0; ; i += 1) {
    const prime = 2 * i + 3;
    if (prime * prime > limit) break;
    if (composite[i]) continue;
    // Cross out the multiples of this prime, starting at its square.
    for (let j = (prime * prime - 3) >> 1; j < size; j += prime) {
      composite[j] = 1;
    }
  }
  return composite;
}

/**
 * Lists every prime number up to a limit (the limit itself is included).
 *
 * @param {number} limit - A non-negative integer, up to 100,000,000.
 * @returns {number[]} Primes in increasing order. Empty if limit is below 2.
 * @throws {RangeError} If limit is not an integer from 0 to 100,000,000.
 */
export function primesUpTo(limit) {
  assertInteger(limit, "limit", "primesUpTo");
  if (limit > MAX_LIMIT) {
    throw new RangeError(`primesUpTo: limit must be at most ${MAX_LIMIT}.`);
  }
  if (limit < 2) return [];

  const composite = buildSieve(limit);
  const primes = [2];
  for (let i = 0; i < composite.length; i += 1) {
    if (!composite[i]) primes.push(2 * i + 3);
  }
  return primes;
}

/**
 * Counts the primes up to a limit (the limit itself is included). It does not
 * build the list, so it uses less memory than primesUpTo(limit).length.
 *
 * @param {number} limit - A non-negative integer, up to 100,000,000.
 * @returns {number}
 * @throws {RangeError} If limit is not an integer from 0 to 100,000,000.
 */
export function countPrimes(limit) {
  assertInteger(limit, "limit", "countPrimes");
  if (limit > MAX_LIMIT) {
    throw new RangeError(`countPrimes: limit must be at most ${MAX_LIMIT}.`);
  }
  if (limit < 2) return 0;

  const composite = buildSieve(limit);
  let count = 1; // the prime 2
  for (let i = 0; i < composite.length; i += 1) {
    if (!composite[i]) count += 1;
  }
  return count;
}

/**
 * Returns the n-th prime, counting from 1: nthPrime(1) is 2, nthPrime(2) is 3.
 *
 * It sieves up to a known upper bound for the n-th prime
 * (n * (ln n + ln ln n), valid for n >= 6).
 *
 * @param {number} n - A positive integer (up to about 5,400,000).
 * @returns {number}
 * @throws {RangeError} If n is not a positive integer, or the n-th prime is too large to sieve.
 */
export function nthPrime(n) {
  assertInteger(n, "n", "nthPrime");
  if (n < 1) {
    throw new RangeError("nthPrime: n must be 1 or more.");
  }
  if (n < 6) return [2, 3, 5, 7, 11][n - 1];

  const bound = Math.ceil(n * (Math.log(n) + Math.log(Math.log(n))));
  if (bound > MAX_LIMIT) {
    throw new RangeError(`nthPrime: n is too large (the sieve limit is ${MAX_LIMIT}).`);
  }

  const composite = buildSieve(bound);
  let found = 1; // the prime 2 is the first
  for (let i = 0; i < composite.length; i += 1) {
    if (!composite[i]) {
      found += 1;
      if (found === n) return 2 * i + 3;
    }
  }
  throw new Error("nthPrime: internal error (the upper bound was too small).");
}

/**
 * Lists the primes from low to high, both ends included, with a segmented
 * sieve. It works for ranges far above zero (up to 9,007,199,254,740,991) as
 * long as the range itself is at most 20,000,000 numbers wide.
 *
 * @param {number} low - First number of the range (a non-negative safe integer).
 * @param {number} high - Last number of the range (a safe integer, at least low).
 * @returns {number[]} Primes in increasing order.
 * @throws {RangeError} If an argument is not a non-negative safe integer, low is
 *   above high, or the range is wider than 20,000,000 numbers.
 */
export function primesBetween(low, high) {
  assertInteger(low, "low", "primesBetween");
  assertInteger(high, "high", "primesBetween");
  if (low > high) {
    throw new RangeError("primesBetween: low must not be above high.");
  }
  if (high - low + 1 > MAX_RANGE) {
    throw new RangeError(`primesBetween: the range must hold at most ${MAX_RANGE} numbers.`);
  }
  if (high < 2) return [];

  // Any composite number up to `high` has a prime factor of at most sqrt(high).
  let root = Math.floor(Math.sqrt(high));
  while (root * root > high) root -= 1;
  while ((root + 1) * (root + 1) <= high) root += 1;

  const flags = new Uint8Array(high - low + 1); // 1 means "not prime"
  for (const prime of primesUpTo(root)) {
    // The first multiple of `prime` that is at or above `low`, but not below prime squared.
    const firstMultiple = low + ((prime - (low % prime)) % prime);
    for (let multiple = Math.max(prime * prime, firstMultiple); multiple <= high; multiple += prime) {
      flags[multiple - low] = 1;
    }
  }

  const primes = [];
  for (let i = 0; i < flags.length; i += 1) {
    if (!flags[i] && low + i >= 2) primes.push(low + i);
  }
  return primes;
}
