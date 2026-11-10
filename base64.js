/**
 * base64
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Base64 encoding and decoding that is safe for any text (UTF-8) and for raw
 *   bytes, with the standard alphabet or the URL-safe one, with or without
 *   padding. Written by hand, so it does not depend on btoa/atob (which break
 *   on non-Latin text) or on Node's Buffer.
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
 *   - Josefsson, S. RFC 4648: The Base16, Base32, and Base64 Data Encodings. IETF, 2006.
 *     https://www.rfc-editor.org/rfc/rfc4648
 *   - MDN Web Docs. Base64 (glossary): the Unicode problem. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa#unicode_strings
 *   - MDN Web Docs. TextEncoder. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
 *   - MDN Web Docs. TextDecoder. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
 */

const STANDARD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL_SAFE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Character -> 6-bit value. Both alphabets are understood when decoding.
const DECODE_TABLE = new Map();
for (let i = 0; i < 64; i += 1) {
  DECODE_TABLE.set(STANDARD[i], i);
  DECODE_TABLE.set(URL_SAFE[i], i);
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

/**
 * Encodes text or bytes as Base64.
 *
 * Strings are encoded as UTF-8 first, so any text works, including Japanese
 * and emoji. (A lone surrogate is encoded as U+FFFD.)
 *
 * @param {string|ArrayBuffer|ArrayBufferView} input - Text, or bytes.
 * @param {object} [options]
 * @param {boolean} [options.urlSafe=false] - Use "-" and "_" instead of "+"
 *   and "/" (safe in URLs and file names).
 * @param {boolean} [options.padding=true] - End with "=" signs so the length
 *   is a multiple of 4. Use false for JWT-style Base64URL.
 * @returns {string}
 * @throws {TypeError} If input has an unsupported type.
 */
export function encodeBase64(input, options = {}) {
  const { urlSafe = false, padding = true } = options;
  const bytes = toBytes(input, "encodeBase64");
  const alphabet = urlSafe ? URL_SAFE : STANDARD;

  const parts = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const remaining = bytes.length - i;
    // Join up to 3 bytes into one 24-bit number, then cut it into four 6-bit pieces.
    const chunk = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);

    parts.push(alphabet[(chunk >> 18) & 63], alphabet[(chunk >> 12) & 63]);
    parts.push(remaining > 1 ? alphabet[(chunk >> 6) & 63] : padding ? "=" : "");
    parts.push(remaining > 2 ? alphabet[chunk & 63] : padding ? "=" : "");
  }
  return parts.join("");
}

// Reads Base64 text. Returns { bytes } or { error }.
function readBase64(text) {
  let body = text.replace(/\s/g, ""); // line breaks and spaces are ignored (MIME style)

  const padding = /=*$/.exec(body)[0].length;
  if (padding > 2) return { error: "too many '=' padding characters" };
  body = body.slice(0, body.length - padding);

  for (const char of body) {
    if (!DECODE_TABLE.has(char)) return { error: `invalid character "${char}"` };
  }
  if (body.length % 4 === 1) return { error: "invalid length" }; // one leftover character cannot hold a byte
  if (padding > 0 && (body.length + padding) % 4 !== 0) return { error: "wrong amount of '=' padding" };

  const bytes = new Uint8Array(Math.floor((body.length * 3) / 4));
  let byteIndex = 0;
  for (let i = 0; i < body.length; i += 4) {
    // Join up to four 6-bit pieces into a 24-bit number, then cut it into bytes.
    const group = [0, 1, 2, 3].map((k) => (i + k < body.length ? DECODE_TABLE.get(body[i + k]) : 0));
    const chunk = (group[0] << 18) | (group[1] << 12) | (group[2] << 6) | group[3];

    if (byteIndex < bytes.length) bytes[byteIndex++] = (chunk >> 16) & 255;
    if (byteIndex < bytes.length) bytes[byteIndex++] = (chunk >> 8) & 255;
    if (byteIndex < bytes.length) bytes[byteIndex++] = chunk & 255;
  }
  return { bytes };
}

/**
 * Decodes Base64 (standard or URL-safe, with or without padding) to bytes.
 * Spaces and line breaks are ignored.
 *
 * @param {string} text - Base64 text.
 * @returns {Uint8Array}
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If text is not valid Base64.
 */
export function decodeBase64ToBytes(text) {
  if (typeof text !== "string") {
    throw new TypeError("decodeBase64ToBytes: expected a string.");
  }
  const result = readBase64(text);
  if (result.error) {
    throw new RangeError(`decodeBase64ToBytes: ${result.error}.`);
  }
  return result.bytes;
}

/**
 * Decodes Base64 to text, reading the bytes as UTF-8.
 *
 * @param {string} text - Base64 text (standard or URL-safe, padding optional).
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If text is not valid Base64, or the bytes are not valid UTF-8.
 */
export function decodeBase64(text) {
  if (typeof text !== "string") {
    throw new TypeError("decodeBase64: expected a string.");
  }
  const result = readBase64(text);
  if (result.error) {
    throw new RangeError(`decodeBase64: ${result.error}.`);
  }

  try {
    // ignoreBOM keeps a leading byte order mark instead of silently removing it.
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(result.bytes);
  } catch {
    throw new RangeError("decodeBase64: the decoded bytes are not valid UTF-8. Use decodeBase64ToBytes for binary data.");
  }
}

/**
 * Checks whether a string is valid Base64 (standard or URL-safe, padding
 * optional, whitespace ignored). Never throws: non-strings return false.
 *
 * @param {*} text - Anything.
 * @returns {boolean}
 */
export function isBase64(text) {
  return typeof text === "string" && !readBase64(text).error;
}
