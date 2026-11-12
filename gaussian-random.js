/**
 * gaussian-random
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Normally distributed (bell-curve) random numbers, using the Box-Muller
 *   transform or Marsaglia's polar method. Gives single values, arrays, and a
 *   generator that uses both numbers of each pair. Takes any uniform random
 *   source, so it works with a seeded generator for repeatable results.
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
 *   - Box, G. E. P. and Muller, M. E. A note on the generation of random normal deviates. The Annals of Mathematical Statistics, 29(2), 1958.
 *     https://doi.org/10.1214/aoms/1177706645
 *   - Marsaglia, G. and Bray, T. A. A convenient method for generating normal variables. SIAM Review, 6(3), 1964.
 *     https://doi.org/10.1137/1006063
 *   - Wikipedia. Box-Muller transform.
 *     https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 *   - MDN Web Docs. Math.random(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */

const METHODS = ["box-muller", "polar"];
const MAX_COUNT = 10_000_000;

function readOptions(options, fnName) {
  const { mean = 0, stdDev = 1, random = Math.random, method = "box-muller" } = options;
  if (typeof mean !== "number" || !Number.isFinite(mean)) {
    throw new RangeError(`${fnName}: mean must be a finite number.`);
  }
  if (typeof stdDev !== "number" || !Number.isFinite(stdDev) || stdDev < 0) {
    throw new RangeError(`${fnName}: stdDev must be a finite number, 0 or more.`);
  }
  if (typeof random !== "function") {
    throw new TypeError(`${fnName}: random must be a function.`);
  }
  if (!METHODS.includes(method)) {
    throw new RangeError(`${fnName}: method must be one of ${METHODS.join(", ")}.`);
  }
  return { mean, stdDev, random, method };
}

// Calls the random source and checks that it returns a number from 0 up to
// (but not including) 1, like Math.random() does.
function uniform(random, fnName) {
  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw new RangeError(`${fnName}: random() must return a number from 0 up to, but not including, 1.`);
  }
  return value;
}

// Box-Muller: two uniform numbers become two independent standard normal numbers.
function boxMullerPair(random, fnName) {
  const u1 = 1 - uniform(random, fnName); // from (0, 1], so the logarithm below is never of 0
  const u2 = uniform(random, fnName);
  const radius = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

// Marsaglia's polar method: the same result without trigonometry, by picking a
// random point inside the unit circle (and trying again if it falls outside).
function polarPair(random, fnName) {
  for (;;) {
    const u = 2 * uniform(random, fnName) - 1;
    const v = 2 * uniform(random, fnName) - 1;
    const s = u * u + v * v;
    if (s > 0 && s < 1) {
      const factor = Math.sqrt((-2 * Math.log(s)) / s);
      return [u * factor, v * factor];
    }
  }
}

const PAIRS = { "box-muller": boxMullerPair, polar: polarPair };

/**
 * One normally distributed random number.
 *
 * @param {object} [options]
 * @param {number} [options.mean=0] - The center of the bell curve.
 * @param {number} [options.stdDev=1] - The spread (standard deviation). About 68% of values fall
 *   within one stdDev of the mean, and about 95% within two. 0 always gives the mean.
 * @param {() => number} [options.random=Math.random] - Uniform random source returning [0, 1).
 * @param {"box-muller"|"polar"} [options.method="box-muller"] - How to make the numbers.
 * @returns {number}
 * @throws {TypeError} If random is not a function.
 * @throws {RangeError} If an option is out of range, or random() returns something outside [0, 1).
 */
export function randomNormal(options = {}) {
  const { mean, stdDev, random, method } = readOptions(options, "randomNormal");
  return mean + stdDev * PAIRS[method](random, "randomNormal")[0]; // the second number of the pair is not used
}

/**
 * An array of normally distributed random numbers. Both numbers of every
 * pair are used, so it needs only about half as many random numbers as
 * calling randomNormal() in a loop.
 *
 * @param {number} count - How many numbers (0 to 10,000,000).
 * @param {object} [options] - The same options as randomNormal.
 * @returns {number[]}
 * @throws {RangeError} If count is not an integer from 0 to 10,000,000, or an option is out of range.
 * @throws {TypeError} If random is not a function.
 */
export function randomNormals(count, options = {}) {
  if (!Number.isInteger(count) || count < 0 || count > MAX_COUNT) {
    throw new RangeError(`randomNormals: count must be an integer from 0 to ${MAX_COUNT}.`);
  }
  const { mean, stdDev, random, method } = readOptions(options, "randomNormals");

  const values = [];
  while (values.length < count) {
    const [first, second] = PAIRS[method](random, "randomNormals");
    values.push(mean + stdDev * first);
    if (values.length < count) values.push(mean + stdDev * second);
  }
  return values;
}

/**
 * Makes a generator of normally distributed numbers that remembers the second
 * number of each pair, so no random numbers are wasted.
 *
 * @param {object} [options] - The same options as randomNormal.
 * @returns {{next: () => number, reset: () => void}}
 *   next(): the next number. reset(): forget the remembered number (the next call starts a new pair).
 * @throws {TypeError} If random is not a function.
 * @throws {RangeError} If an option is out of range.
 */
export function createGaussian(options = {}) {
  const { mean, stdDev, random, method } = readOptions(options, "createGaussian");
  let spare = null;

  return {
    next() {
      if (spare !== null) {
        const value = spare;
        spare = null;
        return mean + stdDev * value;
      }
      const [first, second] = PAIRS[method](random, "createGaussian");
      spare = second;
      return mean + stdDev * first;
    },
    reset() {
      spare = null;
    },
  };
}
