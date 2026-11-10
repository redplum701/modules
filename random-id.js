/**
 * random-id
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Generates random IDs from a chosen set of characters, using the Web Crypto
 *   random number generator (crypto.getRandomValues). Every character is
 *   equally likely: unbiased rejection sampling avoids the "modulo bias" of the
 *   common randomValue % alphabetSize shortcut.
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
 *   - MDN Web Docs. Crypto: getRandomValues() method. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 *   - Wikipedia. Rejection sampling.
 *     https://en.wikipedia.org/wiki/Rejection_sampling
 *   - Wikipedia. Fisher-Yates shuffle: modulo bias.
 *     https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias
 *   - Ai, A. Nano ID (a similar, popular ID generator, for comparison).
 *     https://github.com/ai/nanoid
 */

/**
 * Ready-made character sets.
 */
export const CHARSETS = Object.freeze({
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", // 62
  "url-safe": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", // 64
  numeric: "0123456789", // 10
  lowercase: "abcdefghijklmnopqrstuvwxyz", // 26
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // 26
  "lowercase-alphanumeric": "0123456789abcdefghijklmnopqrstuvwxyz", // 36
  hex: "0123456789abcdef", // 16
  // No 0 O 1 I l, so people can read IDs aloud or copy them by eye.
  unambiguous: "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", // 57
});

const MAX_LENGTH = 100000;
const MAX_ALPHABET_SIZE = 65536;
const MAX_VALUES_PER_CALL = 16384; // crypto.getRandomValues allows 65,536 bytes per call
const UINT32_RANGE = 0x100000000; // 2 ** 32

function defaultGetRandomValues(array) {
  const webCrypto = globalThis.crypto;
  if (!webCrypto || typeof webCrypto.getRandomValues !== "function") {
    throw new Error("Web Crypto (crypto.getRandomValues) is not available in this environment.");
  }
  return webCrypto.getRandomValues(array);
}

// Works out which characters may be used, from the options.
function resolveAlphabet({ charset, alphabet }) {
  if (charset !== undefined && alphabet !== undefined) {
    throw new TypeError("randomId: pass either charset or alphabet, not both.");
  }

  let symbols;
  if (alphabet !== undefined) {
    if (typeof alphabet !== "string") {
      throw new TypeError("randomId: alphabet must be a string.");
    }
    symbols = Array.from(alphabet); // by code point, so emoji count as one symbol
  } else {
    const name = charset ?? "alphanumeric";
    if (!Object.hasOwn(CHARSETS, name)) {
      throw new RangeError(`randomId: unknown charset "${name}".`);
    }
    symbols = Array.from(CHARSETS[name]);
  }

  if (symbols.length < 2 || symbols.length > MAX_ALPHABET_SIZE) {
    throw new RangeError(`randomId: the alphabet needs 2 to ${MAX_ALPHABET_SIZE} characters.`);
  }
  if (new Set(symbols).size !== symbols.length) {
    throw new RangeError("randomId: the alphabet must not repeat a character.");
  }
  return symbols;
}

/**
 * Creates a random ID.
 *
 * Each character is chosen with equal probability. Random 32-bit numbers
 * that fall in the uneven leftover range at the top are thrown away, so no
 * character is favored.
 *
 * With the default 62-character alphabet, each character adds about 5.95
 * bits of randomness, so 21 characters give about 125 bits.
 *
 * @param {number} [length=21] - Number of characters (1 to 100000).
 * @param {object} [options]
 * @param {string} [options.charset="alphanumeric"] - A key of CHARSETS.
 * @param {string} [options.alphabet] - Your own characters (2 to 65536, no repeats).
 *   Use instead of charset.
 * @param {(array: Uint32Array) => void} [options.getRandomValues] - Fills the
 *   array with random 32-bit numbers. Defaults to crypto.getRandomValues.
 *   Replace it only for testing.
 * @returns {string}
 * @throws {TypeError} If an argument has the wrong type.
 * @throws {RangeError} If length or the alphabet is out of range.
 * @throws {Error} If Web Crypto is not available.
 */
export function randomId(length = 21, options = {}) {
  if (typeof length !== "number") {
    throw new TypeError("randomId: length must be a number.");
  }
  if (!Number.isInteger(length) || length < 1 || length > MAX_LENGTH) {
    throw new RangeError(`randomId: length must be an integer from 1 to ${MAX_LENGTH}.`);
  }

  const symbols = resolveAlphabet(options);
  const getRandomValues = options.getRandomValues ?? defaultGetRandomValues;
  if (typeof getRandomValues !== "function") {
    throw new TypeError("randomId: getRandomValues must be a function.");
  }

  // Only numbers below `limit` are used. `limit` is the largest multiple of
  // the alphabet size that fits in 32 bits, so value % size is uniform.
  const size = symbols.length;
  const limit = Math.floor(UINT32_RANGE / size) * size;

  const characters = [];
  while (characters.length < length) {
    const buffer = new Uint32Array(Math.min(MAX_VALUES_PER_CALL, length - characters.length + 8));
    getRandomValues(buffer);

    for (const value of buffer) {
      if (value >= limit) continue; // rejected, to avoid modulo bias
      characters.push(symbols[value % size]);
      if (characters.length === length) break;
    }
  }
  return characters.join("");
}
