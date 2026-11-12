/**
 * crc32
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   The CRC-32 checksum used by ZIP, gzip, PNG, and Ethernet (the "IEEE"
 *   polynomial), plus CRC-32C (the "Castagnoli" polynomial used by iSCSI and
 *   many storage systems). Table-driven, works on strings (as UTF-8) and bytes,
 *   and can continue from an earlier checksum to process data in chunks.
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
 *   - Wikipedia. Cyclic redundancy check.
 *     https://en.wikipedia.org/wiki/Cyclic_redundancy_check
 *   - Deutsch, P. RFC 1952: GZIP file format specification 4.3 (CRC-32 algorithm).
 *     https://www.rfc-editor.org/rfc/rfc1952
 *   - W3C. Portable Network Graphics (PNG) Specification: Annex D, sample CRC implementation.
 *     https://www.w3.org/TR/png/#D-CRCAppendix
 *   - Sheinwald, J., Satran, J., Thaler, P., and Cavanna, V. RFC 3720: Internet Small Computer Systems Interface (iSCSI) (CRC-32C).
 *     https://www.rfc-editor.org/rfc/rfc3720
 *   - MDN Web Docs. TextEncoder. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
 */

// The generator polynomials, written in the "reflected" (bit-reversed) form that
// the byte-at-a-time table method uses.
const POLYNOMIALS = {
  ieee: 0xedb88320, // CRC-32: ZIP, gzip, PNG, Ethernet
  castagnoli: 0x82f63b78, // CRC-32C: iSCSI, ext4, many databases
};

const tables = {}; // one lookup table per polynomial, built the first time it is needed

// Table entry n is the CRC of the single byte n, worked out one bit at a time.
function buildTable(polynomial) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? polynomial ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
}

// Gets the bytes of a string (as UTF-8), a typed array, a DataView, or an ArrayBuffer.
function toBytes(input, fnName) {
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new TypeError(`${fnName}: expected a string, typed array, DataView, or ArrayBuffer.`);
}

function compute(input, previous, polynomialName, fnName) {
  const bytes = toBytes(input, fnName);
  if (!Number.isInteger(previous) || previous < 0 || previous > 0xffffffff) {
    throw new RangeError(`${fnName}: previous must be an unsigned 32-bit integer (0 to 4294967295).`);
  }

  tables[polynomialName] ??= buildTable(POLYNOMIALS[polynomialName]);
  const table = tables[polynomialName];

  // The CRC starts from all ones and is flipped again at the end. Starting from
  // an earlier finished CRC means flipping it back first.
  let crc = previous ^ 0xffffffff;
  for (const byte of bytes) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * The CRC-32 checksum (the IEEE polynomial used by ZIP, gzip, and PNG).
 *
 * crc32("123456789") is 0xcbf43926.
 *
 * To checksum data in pieces, pass the previous result as `previous`:
 * crc32(b, crc32(a)) equals crc32(a followed by b).
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text (hashed as UTF-8), or bytes.
 * @param {number} [previous=0] - The CRC of the data before this chunk (0 for the start).
 * @returns {number} An unsigned 32-bit integer.
 * @throws {TypeError} If input has an unsupported type.
 * @throws {RangeError} If previous is not an unsigned 32-bit integer.
 */
export function crc32(input, previous = 0) {
  return compute(input, previous, "ieee", "crc32");
}

/**
 * CRC-32 as 8 lowercase hexadecimal digits.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @param {number} [previous=0] - The CRC of the data before this chunk.
 * @returns {string} For example "cbf43926".
 * @throws {TypeError} If input has an unsupported type.
 * @throws {RangeError} If previous is not an unsigned 32-bit integer.
 */
export function crc32Hex(input, previous = 0) {
  return crc32(input, previous).toString(16).padStart(8, "0");
}

/**
 * The CRC-32C checksum (the Castagnoli polynomial used by iSCSI and many
 * storage systems). It detects more kinds of errors than CRC-32 for the same size.
 *
 * crc32c("123456789") is 0xe3069283.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text (hashed as UTF-8), or bytes.
 * @param {number} [previous=0] - The CRC-32C of the data before this chunk.
 * @returns {number} An unsigned 32-bit integer.
 * @throws {TypeError} If input has an unsupported type.
 * @throws {RangeError} If previous is not an unsigned 32-bit integer.
 */
export function crc32c(input, previous = 0) {
  return compute(input, previous, "castagnoli", "crc32c");
}

/**
 * CRC-32C as 8 lowercase hexadecimal digits.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @param {number} [previous=0] - The CRC-32C of the data before this chunk.
 * @returns {string} For example "e3069283".
 * @throws {TypeError} If input has an unsupported type.
 * @throws {RangeError} If previous is not an unsigned 32-bit integer.
 */
export function crc32cHex(input, previous = 0) {
  return crc32c(input, previous).toString(16).padStart(8, "0");
}
