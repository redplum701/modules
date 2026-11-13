/**
 * seeded-random
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Random number generators that give the same sequence for the same seed:
 *   mulberry32, xorshift128, and sfc32. Gives floats from 0 up to 1, unbiased
 *   integers in a range, 53-bit floats, and lets you save, restore, and copy the
 *   generator's state. The returned function can be used anywhere a Math.random
 *   replacement is accepted. NOT for security.
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
 *   - Ettinger, T. mulberry32 (a small 32-bit generator).
 *     https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 *   - Marsaglia, G. Xorshift RNGs. Journal of Statistical Software, 8(14), 2003.
 *     https://doi.org/10.18637/jss.v008.i14
 *   - Wikipedia. Xorshift.
 *     https://en.wikipedia.org/wiki/Xorshift
 *   - Steele, G. L., Lea, D., and Flood, C. H. Fast splittable pseudorandom number generators (SplitMix, used here to spread a seed). OOPSLA 2014.
 *     https://doi.org/10.1145/2660193.2660195
 *   - Doty-Humphrey, C. PractRand (the home of the sfc generators).
 *     https://pracrand.sourceforge.net/
 */

export const ALGORITHMS = Object.freeze(["mulberry32", "xorshift128", "sfc32"]);

const TWO_POW_32 = 4294967296;

// A 32-bit hash of text (FNV-1a over UTF-8), used to turn a string seed into a number.
function hashText(text) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// A seed can be a whole number, any other finite number, a BigInt, or a string.
// Small whole numbers are used as they are, so mulberry32 matches other
// implementations of mulberry32 for the same integer seed.
function seedToUint32(seed) {
  if (typeof seed === "number") {
    if (!Number.isFinite(seed)) throw new RangeError("createSeededRandom: the seed must be a finite number.");
    if (Number.isInteger(seed) && Math.abs(seed) < 2 ** 31) return seed >>> 0;
    return hashText(String(seed));
  }
  if (typeof seed === "bigint" || typeof seed === "string") return hashText(String(seed));
  throw new TypeError("createSeededRandom: the seed must be a number, BigInt, or string.");
}

// SplitMix32: turns one number into a stream of well-mixed numbers. It is used
// to fill the larger states of xorshift128 and sfc32 from a single seed.
function splitMix32(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x9e3779b9) | 0;
    let t = state ^ (state >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t ^= t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return (t ^ (t >>> 15)) >>> 0;
  };
}

// Each core has next() (a 32-bit unsigned number), getState(), and setState().
function mulberry32Core(seed) {
  let a = seed | 0;
  return {
    stateLength: 1,
    next() {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return (t ^ (t >>> 14)) >>> 0;
    },
    getState: () => [a >>> 0],
    setState(state) {
      a = state[0] | 0;
    },
  };
}

function xorshift128Core(seed) {
  const mix = splitMix32(seed);
  let [x, y, z, w] = [mix() | 0, mix() | 0, mix() | 0, mix() | 0];
  if ((x | y | z | w) === 0) x = 1; // the state must never be all zero

  return {
    stateLength: 4,
    next() {
      const t = x ^ (x << 11);
      x = y;
      y = z;
      z = w;
      w = (w ^ (w >>> 19)) ^ (t ^ (t >>> 8));
      return w >>> 0;
    },
    getState: () => [x >>> 0, y >>> 0, z >>> 0, w >>> 0],
    setState(state) {
      [x, y, z, w] = state.map((value) => value | 0);
    },
  };
}

function sfc32Core(seed) {
  let [a, b, c, d] = [0x9e3779b9 | 0, 0x243f6a88 | 0, 0xb7e15162 | 0, seed | 0];

  const core = {
    stateLength: 4,
    next() {
      const sum = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      const result = (sum + d) | 0;
      c = (c + result) | 0;
      return result >>> 0;
    },
    getState: () => [a >>> 0, b >>> 0, c >>> 0, d >>> 0],
    setState(state) {
      [a, b, c, d] = state.map((value) => value | 0);
    },
  };
  for (let i = 0; i < 15; i += 1) core.next(); // warm up: the first few outputs are a little weak
  return core;
}

const CORES = { mulberry32: mulberry32Core, xorshift128: xorshift128Core, sfc32: sfc32Core };

/**
 * Makes a seeded random number generator. The same seed (and algorithm) always
 * gives the same sequence, on every machine.
 *
 * The result is a function: call it to get a number from 0 up to (but not
 * including) 1, the same range as Math.random(). It also has methods (below),
 * so it can be passed to any code that accepts a `random` function, such as
 * `shuffle`, `sample`, `random-range`, and `gaussian-random`.
 *
 * Algorithms (all 32-bit and very fast, but none is secure):
 *   "mulberry32"  1 word of state, period 2^32. Small and good enough for games and tests (default).
 *   "xorshift128" 4 words of state, period 2^128 - 1.
 *   "sfc32"       4 words of state, passes strong statistical test suites.
 *
 * Do NOT use these generators for passwords, tokens, or anything an attacker
 * could exploit. Use crypto.getRandomValues for that.
 *
 * @param {number|bigint|string} seed - The seed. A whole number between -2^31 and 2^31 is
 *   used as it is; any other number, a BigInt, or a string is hashed to a 32-bit number first.
 * @param {object} [options]
 * @param {"mulberry32"|"xorshift128"|"sfc32"} [options.algorithm="mulberry32"]
 * @returns {(() => number) & {
 *   nextUint32: () => number,
 *   nextFloat53: () => number,
 *   nextInt: (min: number, max: number) => number,
 *   getState: () => number[],
 *   setState: (state: number[]) => void,
 *   clone: () => Function,
 *   algorithm: string
 * }}
 * @throws {TypeError} If the seed has an unsupported type.
 * @throws {RangeError} If the seed is not finite, or the algorithm is unknown.
 */
export function createSeededRandom(seed, options = {}) {
  const { algorithm = "mulberry32" } = options;
  if (!ALGORITHMS.includes(algorithm)) {
    throw new RangeError(`createSeededRandom: algorithm must be one of ${ALGORITHMS.join(", ")}.`);
  }
  const core = CORES[algorithm](seedToUint32(seed));

  const random = () => core.next() / TWO_POW_32;

  /** The next 32-bit unsigned integer (0 to 4,294,967,295). */
  random.nextUint32 = () => core.next();

  /**
   * A float from 0 up to 1 with 53 bits of precision (it uses two steps of the
   * generator), which is as fine as a JavaScript number can be.
   */
  random.nextFloat53 = () => {
    const high = core.next() >>> 5; // 27 bits
    const low = core.next() >>> 6; // 26 bits
    return (high * 67108864 + low) / 9007199254740992;
  };

  /**
   * A whole number from min to max, both included, with every value equally
   * likely (numbers that would favor small values are thrown away and redrawn).
   *
   * @param {number} min - A safe integer.
   * @param {number} max - A safe integer, at least min. The range may hold at most 2^32 numbers.
   * @returns {number}
   * @throws {RangeError} If min or max is not a safe integer, min is above max, or the range is too wide.
   */
  random.nextInt = (min, max) => {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
      throw new RangeError("nextInt: min and max must be safe integers.");
    }
    if (min > max) throw new RangeError("nextInt: min must be less than or equal to max.");
    const size = max - min + 1;
    if (size > TWO_POW_32) throw new RangeError("nextInt: the range must hold at most 4294967296 numbers.");

    const limit = Math.floor(TWO_POW_32 / size) * size; // values from here up are redrawn
    let value;
    do {
      value = core.next();
    } while (value >= limit);
    return min + (value % size);
  };

  /** The generator's state, as an array of unsigned 32-bit integers. */
  random.getState = () => core.getState();

  /**
   * Restores a state from getState() (of the same algorithm).
   *
   * @param {number[]} state - The saved state.
   * @throws {TypeError} If state is not an array of the right length.
   * @throws {RangeError} If a value is not an unsigned 32-bit integer, or an xorshift128 state is all zero.
   */
  random.setState = (state) => {
    if (!Array.isArray(state) || state.length !== core.stateLength) {
      throw new TypeError(`setState: expected an array of ${core.stateLength} number(s).`);
    }
    if (!state.every((value) => Number.isInteger(value) && value >= 0 && value <= 0xffffffff)) {
      throw new RangeError("setState: every value must be an unsigned 32-bit integer.");
    }
    if (algorithm === "xorshift128" && state.every((value) => value === 0)) {
      throw new RangeError("setState: an xorshift128 state must not be all zero.");
    }
    core.setState(state);
  };

  /** A new generator that continues from the same point, independently of this one. */
  random.clone = () => {
    const copy = createSeededRandom(0, { algorithm });
    copy.setState(core.getState());
    return copy;
  };

  random.algorithm = algorithm;
  return random;
}
