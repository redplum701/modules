/**
 * fraction
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Exact fraction arithmetic with BigInt: add, subtract, multiply, divide,
 *   powers, comparison, and rounding, always reduced to lowest terms with the
 *   sign on the numerator. Fractions can be made from integers, decimals
 *   ("0.125"), strings ("3/4", "1 1/2"), and numbers. No floating-point
 *   error and no overflow.
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
 *   - Wikipedia. Fraction (mathematics).
 *     https://en.wikipedia.org/wiki/Fraction
 *   - Wikipedia. Euclidean algorithm (greatest common divisor).
 *     https://en.wikipedia.org/wiki/Euclidean_algorithm
 *   - MDN Web Docs. BigInt. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 */

const MAX_POWER = 100000;

function gcd(a, b) {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

function toBigInt(value, name) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(`Fraction: ${name} must be a safe integer (use a BigInt for larger values).`);
    }
    return BigInt(value);
  }
  throw new TypeError(`Fraction: ${name} must be an integer (a number or BigInt).`);
}

// Reads "3/4", "-3/4", "1 1/2" (a mixed number), "7", "0.125", "-1.5e-3" as a Fraction.
function parse(text) {
  const trimmed = text.trim();

  const ratio = /^([+-]?)(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(trimmed);
  if (ratio) {
    const [, sign, whole = "0", top, bottom] = ratio;
    if (BigInt(bottom) === 0n) throw new RangeError("Fraction: the denominator must not be zero.");
    const numerator = BigInt(whole) * BigInt(bottom) + BigInt(top);
    return new Fraction(sign === "-" ? -numerator : numerator, BigInt(bottom));
  }

  const decimal = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(trimmed);
  if (decimal && (decimal[2] !== "" || (decimal[3] !== undefined && decimal[3] !== ""))) {
    const [, sign, integerPart, fractionPart = "", exponentText = "0"] = decimal;
    const exponent = Number(exponentText);
    if (Math.abs(exponent) > 10000) throw new RangeError("Fraction: the exponent is too large.");

    let numerator = BigInt(integerPart + fractionPart || "0");
    let denominator = 10n ** BigInt(fractionPart.length);
    if (exponent >= 0) numerator *= 10n ** BigInt(exponent);
    else denominator *= 10n ** BigInt(-exponent);
    return new Fraction(sign === "-" ? -numerator : numerator, denominator);
  }

  throw new RangeError(`Fraction: cannot read "${text}" (use forms like "3/4", "1 1/2", "0.125", or "7").`);
}

const bitLength = (value) => (value === 0n ? 0 : value.toString(2).length);

/**
 * An exact fraction. Instances never change: every operation returns a new
 * Fraction. The fraction is always in lowest terms, the denominator is
 * positive, and the sign is carried by the numerator.
 *
 * @example
 * Fraction.of(1, 2).add(Fraction.of(1, 3)).toString(); // "5/6"
 * Fraction.from("0.75").toString();                    // "3/4"
 */
export class Fraction {
  #numerator;
  #denominator;

  /**
   * @param {number|bigint} numerator - An integer (a safe integer or BigInt).
   * @param {number|bigint} [denominator=1] - A non-zero integer.
   * @throws {TypeError} If an argument is not an integer type.
   * @throws {RangeError} If a number is not a safe integer, or the denominator is zero.
   */
  constructor(numerator, denominator = 1n) {
    let top = toBigInt(numerator, "numerator");
    let bottom = toBigInt(denominator, "denominator");
    if (bottom === 0n) {
      throw new RangeError("Fraction: the denominator must not be zero.");
    }
    if (bottom < 0n) {
      top = -top;
      bottom = -bottom;
    }
    const divisor = gcd(top, bottom);
    if (divisor > 1n) {
      top /= divisor;
      bottom /= divisor;
    }
    this.#numerator = top;
    this.#denominator = bottom;
    Object.freeze(this);
  }

  /**
   * Makes a fraction from a numerator and denominator (the same as `new Fraction(...)`).
   *
   * @param {number|bigint} numerator - An integer.
   * @param {number|bigint} [denominator=1] - A non-zero integer.
   * @returns {Fraction}
   */
  static of(numerator, denominator = 1n) {
    return new Fraction(numerator, denominator);
  }

  /**
   * Makes a fraction from almost any value:
   *   - a Fraction: returned as it is;
   *   - an integer number or BigInt: that integer;
   *   - a number with decimals: the shortest decimal it prints as, so 0.1 is
   *     exactly 1/10 (not the slightly different value stored in the computer);
   *   - a string: "3/4", "-3/4", "1 1/2", "7", "0.125", or "1.5e-3".
   *
   * @param {Fraction|number|bigint|string} value - The value.
   * @returns {Fraction}
   * @throws {TypeError} If the value has an unsupported type.
   * @throws {RangeError} If a number is not finite, or a string cannot be read, or a denominator is zero.
   */
  static from(value) {
    if (value instanceof Fraction) return value;
    if (typeof value === "bigint") return new Fraction(value);
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new RangeError("Fraction.from: the number must be finite.");
      }
      return parse(String(value));
    }
    if (typeof value === "string") return parse(value);
    throw new TypeError("Fraction.from: expected a Fraction, number, BigInt, or string.");
  }

  /**
   * Compares two values. Handy for sorting: fractions.sort(Fraction.compare).
   *
   * @param {Fraction|number|bigint|string} a - A value Fraction.from accepts.
   * @param {Fraction|number|bigint|string} b - A value Fraction.from accepts.
   * @returns {-1|0|1}
   */
  static compare(a, b) {
    const left = Fraction.from(a);
    const right = Fraction.from(b);
    const difference = left.#numerator * right.#denominator - right.#numerator * left.#denominator;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
  }

  /** The numerator, as a BigInt (it carries the sign). */
  get numerator() {
    return this.#numerator;
  }

  /** The denominator, as a positive BigInt. */
  get denominator() {
    return this.#denominator;
  }

  /** -1, 0, or 1. */
  get sign() {
    return this.#numerator < 0n ? -1 : this.#numerator > 0n ? 1 : 0;
  }

  /** True if the value is a whole number. */
  get isInteger() {
    return this.#denominator === 1n;
  }

  /**
   * @param {Fraction|number|bigint|string} other - A value Fraction.from accepts.
   * @returns {Fraction} this + other
   */
  add(other) {
    const o = Fraction.from(other);
    return new Fraction(
      this.#numerator * o.#denominator + o.#numerator * this.#denominator,
      this.#denominator * o.#denominator
    );
  }

  /**
   * @param {Fraction|number|bigint|string} other - A value Fraction.from accepts.
   * @returns {Fraction} this - other
   */
  sub(other) {
    const o = Fraction.from(other);
    return new Fraction(
      this.#numerator * o.#denominator - o.#numerator * this.#denominator,
      this.#denominator * o.#denominator
    );
  }

  /**
   * @param {Fraction|number|bigint|string} other - A value Fraction.from accepts.
   * @returns {Fraction} this x other
   */
  mul(other) {
    const o = Fraction.from(other);
    return new Fraction(this.#numerator * o.#numerator, this.#denominator * o.#denominator);
  }

  /**
   * @param {Fraction|number|bigint|string} other - A value Fraction.from accepts.
   * @returns {Fraction} this / other
   * @throws {RangeError} If other is zero.
   */
  div(other) {
    const o = Fraction.from(other);
    if (o.#numerator === 0n) {
      throw new RangeError("Fraction: division by zero.");
    }
    return new Fraction(this.#numerator * o.#denominator, this.#denominator * o.#numerator);
  }

  /** @returns {Fraction} The negative of this fraction. */
  neg() {
    return new Fraction(-this.#numerator, this.#denominator);
  }

  /** @returns {Fraction} The absolute value. */
  abs() {
    return this.#numerator < 0n ? this.neg() : this;
  }

  /**
   * @returns {Fraction} 1 / this
   * @throws {RangeError} If this is zero.
   */
  inverse() {
    if (this.#numerator === 0n) {
      throw new RangeError("Fraction: the inverse of zero does not exist.");
    }
    return new Fraction(this.#denominator, this.#numerator);
  }

  /**
   * Raises the fraction to a whole-number power. A negative power is the
   * power of the inverse. Zero to the power 0 is 1.
   *
   * @param {number|bigint} exponent - An integer, at most 100,000 in size.
   * @returns {Fraction}
   * @throws {TypeError} If exponent is not an integer type.
   * @throws {RangeError} If |exponent| is above 100,000, or this is zero and exponent is negative.
   */
  pow(exponent) {
    const e = toBigInt(exponent, "exponent");
    if (e > BigInt(MAX_POWER) || e < -BigInt(MAX_POWER)) {
      throw new RangeError(`Fraction.pow: the exponent must be between -${MAX_POWER} and ${MAX_POWER}.`);
    }
    if (e < 0n) return this.inverse().pow(-e);
    return new Fraction(this.#numerator ** e, this.#denominator ** e);
  }

  /**
   * @param {Fraction|number|bigint|string} other - A value Fraction.from accepts.
   * @returns {-1|0|1} -1 if this is smaller than other, 0 if equal, 1 if larger.
   */
  compare(other) {
    return Fraction.compare(this, other);
  }

  /**
   * @param {Fraction|number|bigint|string} other - A value Fraction.from accepts.
   * @returns {boolean} true if both have the same value.
   */
  equals(other) {
    return Fraction.compare(this, other) === 0;
  }

  /** @returns {bigint} The largest whole number that is not above this fraction. */
  floor() {
    const quotient = this.#numerator / this.#denominator; // truncates toward zero
    return this.#numerator < 0n && this.#numerator % this.#denominator !== 0n ? quotient - 1n : quotient;
  }

  /** @returns {bigint} The smallest whole number that is not below this fraction. */
  ceil() {
    const quotient = this.#numerator / this.#denominator;
    return this.#numerator > 0n && this.#numerator % this.#denominator !== 0n ? quotient + 1n : quotient;
  }

  /** @returns {bigint} The nearest whole number; halves round away from zero (2.5 -> 3, -2.5 -> -3). */
  round() {
    const magnitude = this.#numerator < 0n ? -this.#numerator : this.#numerator;
    const rounded = (2n * magnitude + this.#denominator) / (2n * this.#denominator);
    return this.#numerator < 0n ? -rounded : rounded;
  }

  /** @returns {bigint} The whole part, with the fraction part cut off (toward zero). */
  trunc() {
    return this.#numerator / this.#denominator;
  }

  /**
   * The nearest JavaScript number. Large numerators and denominators are
   * handled without overflowing as long as the result itself fits.
   *
   * @returns {number}
   */
  toNumber() {
    const top = this.#numerator < 0n ? -this.#numerator : this.#numerator;
    const bottom = this.#denominator;
    const sign = this.#numerator < 0n ? -1 : 1;

    if (top <= BigInt(Number.MAX_SAFE_INTEGER) && bottom <= BigInt(Number.MAX_SAFE_INTEGER)) {
      return sign * (Number(top) / Number(bottom)) + 0; // + 0 turns -0 into 0
    }

    // Scale the numerator up so the integer quotient has about 64 bits, then scale back down.
    const shift = Math.max(0, 64 - (bitLength(top) - bitLength(bottom)));
    const quotient = (top << BigInt(shift)) / bottom;
    return sign * ((Number(quotient) / 2 ** Math.min(shift, 1000)) / 2 ** Math.max(0, shift - 1000)) + 0;
  }

  /**
   * The value as a decimal string, rounded half away from zero, without
   * trailing zeros ("0.5", not "0.5000000000").
   *
   * @param {number} [digits=10] - Most digits after the point (0 to 10000).
   * @returns {string}
   * @throws {RangeError} If digits is not an integer from 0 to 10000.
   */
  toDecimalString(digits = 10) {
    if (!Number.isInteger(digits) || digits < 0 || digits > 10000) {
      throw new RangeError("Fraction.toDecimalString: digits must be an integer from 0 to 10000.");
    }
    const scale = 10n ** BigInt(digits);
    const magnitude = this.#numerator < 0n ? -this.#numerator : this.#numerator;
    const scaled = (2n * magnitude * scale + this.#denominator) / (2n * this.#denominator);

    const integerPart = scaled / scale;
    const fractionPart = (scaled % scale).toString().padStart(digits, "0").replace(/0+$/, "");
    const sign = this.#numerator < 0n && scaled !== 0n ? "-" : "";
    return sign + integerPart + (fractionPart ? `.${fractionPart}` : "");
  }

  /**
   * The fraction as text: "3/4", or "5" for a whole number.
   *
   * @returns {string}
   */
  toString() {
    return this.#denominator === 1n ? String(this.#numerator) : `${this.#numerator}/${this.#denominator}`;
  }

  /**
   * The fraction as a mixed number: "1 1/2", "-2 3/4", "1/2", or "5".
   *
   * @returns {string}
   */
  toMixedString() {
    const magnitude = this.#numerator < 0n ? -this.#numerator : this.#numerator;
    const whole = magnitude / this.#denominator;
    const remainder = magnitude % this.#denominator;
    const sign = this.#numerator < 0n ? "-" : "";

    if (remainder === 0n) return `${sign}${whole}`;
    if (whole === 0n) return `${sign}${remainder}/${this.#denominator}`;
    return `${sign}${whole} ${remainder}/${this.#denominator}`;
  }

  /** The text form, so a Fraction works in template strings and JSON. */
  toJSON() {
    return this.toString();
  }
}
