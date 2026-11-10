/**
 * uuid-v4
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Generates version 4 (random) UUIDs from cryptographic random numbers, and
 *   checks whether a string is a valid UUID of any version. Built by hand from
 *   16 random bytes, following RFC 9562.
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
 *   - Davis, K., Peabody, B., and Leach, P. RFC 9562: Universally Unique IDentifiers (UUIDs). IETF, 2024.
 *     https://www.rfc-editor.org/rfc/rfc9562
 *   - MDN Web Docs. Crypto: getRandomValues() method. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 *   - MDN Web Docs. Crypto: randomUUID() method. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
 */

// "00" to "ff", looked up by byte value.
const HEX = Array.from({ length: 256 }, (_, byte) => byte.toString(16).padStart(2, "0"));

const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function defaultGetRandomValues(array) {
  const webCrypto = globalThis.crypto;
  if (!webCrypto || typeof webCrypto.getRandomValues !== "function") {
    throw new Error("Web Crypto (crypto.getRandomValues) is not available in this environment.");
  }
  return webCrypto.getRandomValues(array);
}

/**
 * Creates a random (version 4) UUID, such as
 * "3b241101-e2bb-4255-8caf-4136c566a962".
 *
 * Layout (RFC 9562): 16 random bytes, where 4 bits are fixed to say
 * "version 4" and 2 bits are fixed to say "RFC variant". That leaves 122
 * random bits.
 *
 * @param {object} [options]
 * @param {(array: Uint8Array) => void} [options.getRandomValues] - Fills the
 *   array with random bytes. Defaults to crypto.getRandomValues. Replace it
 *   only for testing.
 * @returns {string} Lowercase, in the form 8-4-4-4-12.
 * @throws {TypeError} If getRandomValues is not a function.
 * @throws {Error} If Web Crypto is not available.
 */
export function uuidV4(options = {}) {
  const getRandomValues = options.getRandomValues ?? defaultGetRandomValues;
  if (typeof getRandomValues !== "function") {
    throw new TypeError("uuidV4: getRandomValues must be a function.");
  }

  const bytes = new Uint8Array(16);
  getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4: top 4 bits of byte 6 are 0100
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant: top 2 bits of byte 8 are 10

  const hex = Array.from(bytes, (byte) => HEX[byte]);
  return (
    hex.slice(0, 4).join("") + "-" +
    hex.slice(4, 6).join("") + "-" +
    hex.slice(6, 8).join("") + "-" +
    hex.slice(8, 10).join("") + "-" +
    hex.slice(10, 16).join("")
  );
}

/**
 * Checks whether a string is a valid UUID in the standard 8-4-4-4-12 form.
 * Accepts versions 1 to 8 with the RFC variant, in upper or lower case.
 * The Nil UUID (all zeros) and Max UUID (all f) are accepted only when no
 * version is requested. Never throws for the value: non-strings return false.
 *
 * Braces, "urn:uuid:" prefixes, and missing hyphens are not accepted.
 *
 * @param {*} value - Anything.
 * @param {object} [options]
 * @param {number} [options.version] - Require this version (1 to 8).
 * @returns {boolean}
 * @throws {RangeError} If options.version is given but is not an integer from 1 to 8.
 */
export function isUuid(value, options = {}) {
  const { version } = options;
  if (version !== undefined && !(Number.isInteger(version) && version >= 1 && version <= 8)) {
    throw new RangeError("isUuid: version must be an integer from 1 to 8.");
  }

  if (typeof value !== "string" || !UUID_FORMAT.test(value)) return false;

  const lower = value.toLowerCase();
  if (lower === NIL_UUID || lower === MAX_UUID) return version === undefined;

  const actualVersion = Number.parseInt(lower[14], 16); // first digit of the 3rd group
  if (actualVersion < 1 || actualVersion > 8) return false;
  if (!"89ab".includes(lower[19])) return false; // first digit of the 4th group: RFC variant
  return version === undefined || version === actualVersion;
}

/**
 * Checks whether a string is a valid version 4 UUID.
 *
 * @param {*} value - Anything.
 * @returns {boolean}
 */
export function isUuidV4(value) {
  return isUuid(value, { version: 4 });
}
