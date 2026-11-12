/**
 * fnv1a
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   The FNV-1a hash (Fowler-Noll-Vo), a very small and fast non-cryptographic
 *   hash: 32-bit as a number and 64-bit as a BigInt, with hexadecimal
 *   versions. Strings are hashed as UTF-8, so the result is the same in every
 *   language and environment. Good for hash tables, bucketing, and quick
 *   fingerprints. NOT for passwords or security.
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
 *   - Wikipedia. Fowler-Noll-Vo hash function.
 *     https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 *   - Eastlake, D., Hansen, T., Fowler, G., Vo, K.-P., and Noll, L. C. The FNV Non-Cryptographic Hash Algorithm (IETF Internet-Draft).
 *     https://datatracker.ietf.org/doc/html/draft-eastlake-fnv-17
 *   - MDN Web Docs. Math.imul(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
 *   - MDN Web Docs. TextEncoder. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
 */

// The constants from the FNV specification.
const OFFSET_32 = 0x811c9dc5;
const PRIME_32 = 0x01000193;
const OFFSET_64 = 0xcbf29ce484222325n;
const PRIME_64 = 0x100000001b3n;
const MASK_64 = 0xffffffffffffffffn;

// Gets the bytes of a string (as UTF-8), a typed array, a DataView, or an ArrayBuffer.
function toBytes(input, fnName) {
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new TypeError(`${fnName}: expected a string, typed array, DataView, or ArrayBuffer.`);
}

/**
 * The 32-bit FNV-1a hash.
 *
 * For each byte: XOR it into the hash, then multiply the hash by the FNV prime
 * (keeping 32 bits). A string is hashed as its UTF-8 bytes.
 *
 * fnv1a32("") is 2166136261, and fnv1a32("a") is 0xe40c292c.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @returns {number} An unsigned 32-bit integer (0 to 4,294,967,295).
 * @throws {TypeError} If input has an unsupported type.
 */
export function fnv1a32(input) {
  const bytes = toBytes(input, "fnv1a32");
  let hash = OFFSET_32;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, PRIME_32); // a 32-bit multiplication that drops the overflow
  }
  return hash >>> 0; // read the 32 bits as an unsigned number
}

/**
 * The 32-bit FNV-1a hash as 8 lowercase hexadecimal digits.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @returns {string} For example "e40c292c".
 * @throws {TypeError} If input has an unsupported type.
 */
export function fnv1a32Hex(input) {
  return fnv1a32(input).toString(16).padStart(8, "0");
}

/**
 * The 64-bit FNV-1a hash, as a BigInt.
 *
 * fnv1a64("a") is 0xaf63dc4c8601ec8cn.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @returns {bigint} An unsigned 64-bit integer.
 * @throws {TypeError} If input has an unsupported type.
 */
export function fnv1a64(input) {
  const bytes = toBytes(input, "fnv1a64");
  let hash = OFFSET_64;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * PRIME_64) & MASK_64; // keep 64 bits
  }
  return hash;
}

/**
 * The 64-bit FNV-1a hash as 16 lowercase hexadecimal digits.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @returns {string} For example "af63dc4c8601ec8c".
 * @throws {TypeError} If input has an unsupported type.
 */
export function fnv1a64Hex(input) {
  return fnv1a64(input).toString(16).padStart(16, "0");
}
