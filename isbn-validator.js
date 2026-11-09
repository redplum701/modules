/**
 * isbn-validator
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Validates ISBN-10 and ISBN-13 numbers by their check digit, accepts common
 *   written forms (with hyphens, spaces, a leading "ISBN", full-width
 *   characters), and converts between the two formats.
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
 *   - International ISBN Agency. ISBN Users' Manual, International Standard Book Number (ISO 2108).
 *     https://www.isbn-international.org/content/isbn-users-manual
 *   - Wikipedia. International Standard Book Number.
 *     https://en.wikipedia.org/wiki/ISBN
 *   - MDN Web Docs. String.prototype.normalize(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */

// Hyphens, dashes, the prolonged sound mark ー (often typed by mistake), and spaces.
const SEPARATORS = /[\s\-\u2010-\u2015\u2212\u30FC]/g;
const BODY = /^[\dXx\s\-\u2010-\u2015\u2212\u30FC]+$/;

// ISBN-10 check digit for the first 9 digits: weights 10, 9, ... 2, then
// pick the digit that makes the weighted sum a multiple of 11. 10 is written "X".
function isbn10CheckDigit(first9) {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += (10 - i) * Number(first9[i]);
  }
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? "X" : String(check);
}

// ISBN-13 check digit for the first 12 digits: weights 1, 3, 1, 3, ...
function isbn13CheckDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return String((10 - (sum % 10)) % 10);
}

// Removes "ISBN", "ISBN-10:", "ISBN13:" and the like, then returns 10 or 13
// characters (digits, with a possible X at the end), or null.
function cleanIsbn(input) {
  let text = input.normalize("NFKC").trim();
  text = text.replace(/^ISBN-?(?:10|13)\s*:\s*/i, "").replace(/^ISBN\s*:?\s*/i, "");
  if (!BODY.test(text)) return null;

  const compact = text.replace(SEPARATORS, "").toUpperCase();
  if (/^\d{9}[\dX]$/.test(compact) || /^\d{13}$/.test(compact)) return compact;
  return null;
}

/**
 * Reads an ISBN and checks its check digit.
 *
 * Hyphen positions are not checked, only the digits and the check digit.
 *
 * @param {string} input - "4-87311-336-9", "ISBN 978-0-306-40615-7", "080442957X", etc.
 * @returns {{type: 10|13, digits: string, isbn10: string|null, isbn13: string} | null}
 *   null if the input is not a valid ISBN.
 *   type: 10 or 13, as written.
 *   digits: the number as written, without separators (X in uppercase).
 *   isbn10: the ISBN-10 form, or null for 979-prefixed ISBN-13 numbers.
 *   isbn13: the ISBN-13 form.
 * @throws {TypeError} If input is not a string.
 */
export function parseIsbn(input) {
  if (typeof input !== "string") {
    throw new TypeError("parseIsbn: expected a string.");
  }

  const digits = cleanIsbn(input);
  if (digits === null) return null;

  if (digits.length === 10) {
    if (isbn10CheckDigit(digits.slice(0, 9)) !== digits[9]) return null;
    const first12 = "978" + digits.slice(0, 9);
    return { type: 10, digits, isbn10: digits, isbn13: first12 + isbn13CheckDigit(first12) };
  }

  if (isbn13CheckDigit(digits.slice(0, 12)) !== digits[12]) return null;
  const isbn10 = digits.startsWith("978")
    ? digits.slice(3, 12) + isbn10CheckDigit(digits.slice(3, 12))
    : null; // only 978 numbers have an ISBN-10 form
  return { type: 13, digits, isbn10, isbn13: digits };
}

/**
 * Checks whether a string is a valid ISBN-10 or ISBN-13.
 * Never throws: non-strings return false.
 *
 * @param {*} input - Anything.
 * @returns {boolean}
 */
export function isValidIsbn(input) {
  return typeof input === "string" && parseIsbn(input) !== null;
}

/**
 * Converts a valid ISBN-10 or ISBN-13 to a plain 13-digit ISBN-13.
 *
 * @param {string} input - A valid ISBN in any common written form.
 * @returns {string|null} 13 digits, or null if the ISBN is not valid.
 * @throws {TypeError} If input is not a string.
 */
export function toIsbn13(input) {
  const parsed = parseIsbn(input);
  return parsed === null ? null : parsed.isbn13;
}

/**
 * Converts a valid ISBN-13 (or ISBN-10) to a plain 10-character ISBN-10.
 *
 * @param {string} input - A valid ISBN in any common written form.
 * @returns {string|null} 10 characters (the last may be X), or null if the
 *   ISBN is not valid or starts with 979 (those have no ISBN-10 form).
 * @throws {TypeError} If input is not a string.
 */
export function toIsbn10(input) {
  const parsed = parseIsbn(input);
  return parsed === null ? null : parsed.isbn10;
}
