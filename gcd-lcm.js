/**
 * gcd-lcm
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Greatest common divisor (GCD) and least common multiple (LCM) for any
 *   number of integers. Works with numbers and BigInt, and ignores signs.
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
 *   - Wikipedia. Euclidean algorithm.
 *     https://en.wikipedia.org/wiki/Euclidean_algorithm
 *   - Wikipedia. Least common multiple.
 *     https://en.wikipedia.org/wiki/Least_common_multiple
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */

// Converts every argument to a BigInt so big values stay exact.
function toBigInts(values, fnName) {
  if (values.length === 0) {
    throw new TypeError(`${fnName}: expected at least one integer.`);
  }

  return values.map((value) => {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
    throw new TypeError(`${fnName}: expected safe integers or BigInts.`);
  });
}

// Converts the result back: BigInt in -> BigInt out, numbers in -> number out.
function fromBigInt(result, values, fnName) {
  if (values.some((value) => typeof value === "bigint")) return result;
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError(`${fnName}: result is too large for a number. Pass BigInts instead.`);
  }
  return Number(result);
}

function abs(n) {
  return n < 0n ? -n : n;
}

// Euclidean algorithm for two non-negative BigInts.
function gcdPair(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Greatest common divisor of one or more integers.
 *
 * @param {...(number|bigint)} values - Safe integers or BigInts.
 * @returns {number|bigint} Always >= 0. BigInt if any input is a BigInt.
 * @throws {TypeError} If there are no arguments or an argument is not an integer.
 */
export function gcd(...values) {
  const numbers = toBigInts(values, "gcd");
  const result = numbers.map(abs).reduce(gcdPair);
  return fromBigInt(result, values, "gcd");
}

/**
 * Least common multiple of one or more integers.
 * If any input is 0, the result is 0.
 *
 * @param {...(number|bigint)} values - Safe integers or BigInts.
 * @returns {number|bigint} Always >= 0. BigInt if any input is a BigInt.
 * @throws {TypeError} If there are no arguments or an argument is not an integer.
 * @throws {RangeError} If a number result is larger than Number.MAX_SAFE_INTEGER.
 */
export function lcm(...values) {
  const numbers = toBigInts(values, "lcm");
  const result = numbers.map(abs).reduce((a, b) => {
    if (a === 0n || b === 0n) return 0n;
    return (a / gcdPair(a, b)) * b; // divide first to keep numbers small
  });
  return fromBigInt(result, values, "lcm");
}
