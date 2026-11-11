/**
 * base-converter
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts numbers between any two bases from 2 to 36, exactly: negative
 *   numbers, fractions (with a chosen number of digits and rounding), and
 *   numbers of any size (BigInt). Uses exact integer arithmetic throughout, so
 *   there is no floating-point error. This is the full version of the first
 *   base-conversion module.
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
 *   - Wikipedia. Positional notation.
 *     https://en.wikipedia.org/wiki/Positional_notation
 *   - Knuth, D. E. The Art of Computer Programming, Volume 2: Seminumerical Algorithms, Section 4.4 (Radix Conversion).
 *     https://www-cs-faculty.stanford.edu/~knuth/taocp.html
 *   - MDN Web Docs. BigInt.prototype.toString(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toString
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const MAX_PRECISION = 10000;
const MAX_EXPONENT = 10000;
const PREFIXES = { 2: "0b", 8: "0o", 16: "0x" };

function assertBase(base, name) {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new RangeError(`${name} must be an integer from 2 to 36.`);
  }
}

function digitValue(char) {
  return DIGITS.indexOf(char.toLowerCase());
}

// Joins digits into a BigInt. Digits are taken in chunks that fit safely in a
// Number, which is much faster than one BigInt multiplication per digit.
function digitsToBigInt(digits, base) {
  if (digits === "") return 0n;
  const chunkSize = Math.max(1, Math.floor(52 / Math.log2(base)));
  let result = 0n;
  for (let start = 0; start < digits.length; start += chunkSize) {
    const chunk = digits.slice(start, start + chunkSize);
    let value = 0;
    for (const char of chunk) value = value * base + digitValue(char);
    result = result * BigInt(base) ** BigInt(chunk.length) + BigInt(value);
  }
  return result;
}

// Reads text in a base as an exact fraction: value = sign * numerator / denominator.
function parseInBase(text, base, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: the number must be a string.`);
  }

  let body = text.trim();
  let sign = 1;
  if (body[0] === "-" || body[0] === "+") {
    if (body[0] === "-") sign = -1;
    body = body.slice(1);
  }

  // A prefix is accepted only where its letter is not a digit of that base.
  const prefix = PREFIXES[base];
  if (prefix && body.slice(0, 2).toLowerCase() === prefix && body.length > 2) {
    body = body.slice(2);
  }

  const parts = body.split(".");
  if (parts.length > 2) {
    throw new RangeError(`${fnName}: "${text}" has more than one point.`);
  }
  const [integerPart, fractionPart = ""] = parts;
  if (integerPart === "" && fractionPart === "") {
    throw new RangeError(`${fnName}: "${text}" has no digits.`);
  }

  for (const char of integerPart + fractionPart) {
    const value = digitValue(char);
    if (value === -1 || value >= base) {
      throw new RangeError(`${fnName}: "${char}" is not a digit in base ${base}.`);
    }
  }

  return {
    sign,
    numerator: digitsToBigInt(integerPart + fractionPart, base),
    denominator: BigInt(base) ** BigInt(fractionPart.length),
  };
}

// Reads a decimal number or string, with an optional exponent, as an exact fraction.
function parseDecimal(value, fnName) {
  if (typeof value === "bigint") {
    return { sign: value < 0n ? -1 : 1, numerator: value < 0n ? -value : value, denominator: 1n };
  }

  let text;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError(`${fnName}: the number must be finite.`);
    }
    text = String(value); // the shortest decimal that reads back as this number
  } else if (typeof value === "string") {
    text = value.trim();
  } else {
    throw new TypeError(`${fnName}: expected a number, BigInt, or decimal string.`);
  }

  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!match || (match[2] === "" && (match[3] === undefined || match[3] === ""))) {
    throw new RangeError(`${fnName}: "${text}" is not a decimal number.`);
  }

  const [, signText, integerPart, fractionPart = "", exponentText = "0"] = match;
  const exponent = Number(exponentText);
  if (Math.abs(exponent) > MAX_EXPONENT) {
    throw new RangeError(`${fnName}: the exponent is too large.`);
  }

  // value = digits / 10^(fraction digits) * 10^exponent
  let numerator = BigInt(integerPart + fractionPart || "0");
  let denominator = 10n ** BigInt(fractionPart.length);
  if (exponent >= 0) numerator *= 10n ** BigInt(exponent);
  else denominator *= 10n ** BigInt(-exponent);

  return { sign: signText === "-" ? -1 : 1, numerator, denominator };
}

function readOptions(options, fnName) {
  const { precision = 20, rounding = "nearest", uppercase = false, prefix = false } = options;
  if (!Number.isInteger(precision) || precision < 0 || precision > MAX_PRECISION) {
    throw new RangeError(`${fnName}: precision must be an integer from 0 to ${MAX_PRECISION}.`);
  }
  if (rounding !== "nearest" && rounding !== "truncate") {
    throw new RangeError(`${fnName}: rounding must be "nearest" or "truncate".`);
  }
  if (typeof uppercase !== "boolean" || typeof prefix !== "boolean") {
    throw new TypeError(`${fnName}: uppercase and prefix must be booleans.`);
  }
  return { precision, rounding, uppercase, prefix };
}

// Writes the fraction sign * numerator / denominator in the target base.
function format({ sign, numerator, denominator }, base, { precision, rounding, uppercase, prefix }) {
  let digits;
  let fraction = "";

  if (denominator === 1n) {
    digits = numerator.toString(base);
  } else {
    // Scale so that `precision` digits after the point become part of a whole number.
    const scale = BigInt(base) ** BigInt(precision);
    let scaled = (numerator * scale) / denominator;
    const remainder = (numerator * scale) % denominator;
    if (rounding === "nearest" && remainder * 2n >= denominator) scaled += 1n;

    digits = scaled.toString(base);
    if (precision > 0) {
      digits = digits.padStart(precision + 1, "0");
      fraction = digits.slice(-precision).replace(/0+$/, ""); // drop trailing zeros
      digits = digits.slice(0, -precision);
    }
    if (scaled === 0n) sign = 1; // never write "-0"
  }

  const isZero = /^0*$/.test(digits) && fraction === "";
  let body = digits + (fraction ? `.${fraction}` : "");
  if (uppercase) body = body.toUpperCase();
  const mark = prefix && PREFIXES[base] ? PREFIXES[base] : "";
  return (sign < 0 && !isZero ? "-" : "") + mark + body;
}

/**
 * Converts a number written in one base to another base.
 *
 * Everything is exact: the text is read as an exact fraction and converted
 * with integer arithmetic. If the result has more than `precision` digits
 * after the point (for example 0.1 in base 2, which never ends), it is cut
 * to `precision` digits.
 *
 * Accepted input: an optional sign, digits (0-9, a-z, either case), and at
 * most one point ("10.1", ".5", "5."). A prefix matching the base (0b for
 * base 2, 0o for base 8, 0x for base 16) is allowed. No spaces or underscores
 * inside the number, and no exponents.
 *
 * @param {string} text - The number, written in `fromBase`.
 * @param {number} fromBase - 2 to 36.
 * @param {number} toBase - 2 to 36.
 * @param {object} [options]
 * @param {number} [options.precision=20] - Most digits after the point (0 to 10000).
 * @param {"nearest"|"truncate"} [options.rounding="nearest"] - How to cut extra digits.
 * @param {boolean} [options.uppercase=false] - Use A-Z instead of a-z.
 * @param {boolean} [options.prefix=false] - Add 0b, 0o, or 0x for base 2, 8, or 16.
 * @returns {string} The number in `toBase`. Trailing zeros after the point are dropped.
 * @throws {TypeError} If text is not a string, or an option has the wrong type.
 * @throws {RangeError} If a base or option is out of range, or the text is not a valid number in its base.
 */
export function convertBase(text, fromBase, toBase, options = {}) {
  assertBase(fromBase, "fromBase");
  assertBase(toBase, "toBase");
  const settings = readOptions(options, "convertBase");
  return format(parseInBase(text, fromBase, "convertBase"), toBase, settings);
}

/**
 * Writes a decimal number (or BigInt) in another base.
 *
 * A number is taken as the shortest decimal it prints as, so 0.1 is exactly
 * one tenth (not the slightly different value stored inside the computer).
 * Strings may use exponents ("1e21").
 *
 * @param {number|bigint|string} value - A finite number, a BigInt, or a decimal string.
 * @param {number} base - 2 to 36.
 * @param {object} [options] - Same options as convertBase.
 * @returns {string}
 * @throws {TypeError} If value has an unsupported type, or an option has the wrong type.
 * @throws {RangeError} If the base or an option is out of range, or the value is not a finite decimal number.
 */
export function toBase(value, base, options = {}) {
  assertBase(base, "base");
  const settings = readOptions(options, "toBase");
  return format(parseDecimal(value, "toBase"), base, settings);
}

/**
 * Reads a number written in a base.
 *
 * @param {string} text - The number (see convertBase for the accepted forms).
 * @param {number} base - 2 to 36.
 * @param {object} [options]
 * @param {"number"|"bigint"|"decimal"} [options.as="number"] - What to return:
 *   "number": a JavaScript number (large or long values are rounded to the nearest double);
 *   "bigint": a BigInt (the number must be a whole number);
 *   "decimal": an exact decimal string, cut to `precision` digits after the point.
 * @param {number} [options.precision=20] - For "decimal" only.
 * @returns {number|bigint|string}
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If the base or an option is out of range, the text is not valid in its
 *   base, or `as` is "bigint" and the number has a fractional part.
 */
export function fromBase(text, base, options = {}) {
  assertBase(base, "base");
  const { as = "number", precision = 20 } = options;
  if (!["number", "bigint", "decimal"].includes(as)) {
    throw new RangeError('fromBase: as must be "number", "bigint", or "decimal".');
  }

  const parsed = parseInBase(text, base, "fromBase");
  const { sign, numerator, denominator } = parsed;

  if (as === "bigint") {
    if (numerator % denominator !== 0n) {
      throw new RangeError(`fromBase: "${text}" has a fractional part, so it is not a whole number.`);
    }
    return BigInt(sign) * (numerator / denominator);
  }

  if (as === "decimal") {
    return format(parsed, 10, readOptions({ precision }, "fromBase"));
  }

  if (denominator === 1n) return sign * Number(numerator) + 0; // + 0 turns -0 into 0
  // Go through a long decimal so the result is the nearest double.
  const decimal = format(parsed, 10, { precision: 40, rounding: "nearest", uppercase: false, prefix: false });
  return Number(decimal) + 0; // + 0 turns -0 into 0
}

/**
 * Checks whether text is a valid number in a base (same rules as convertBase).
 * Never throws for the text: non-strings return false.
 *
 * @param {*} text - Anything.
 * @param {number} base - 2 to 36.
 * @returns {boolean}
 * @throws {RangeError} If base is not an integer from 2 to 36.
 */
export function isValidInBase(text, base) {
  assertBase(base, "base");
  if (typeof text !== "string") return false;
  try {
    parseInBase(text, base, "isValidInBase");
    return true;
  } catch {
    return false;
  }
}
