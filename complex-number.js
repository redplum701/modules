/**
 * complex-number
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Complex numbers: add, subtract, multiply, divide, conjugate, absolute value
 *   and angle, powers, square roots, exponential and logarithm, sine and
 *   cosine, and the n-th roots of a number. Can be made from real and
 *   imaginary parts, polar form, and strings like "3 + 4i". Division uses
 *   Smith's algorithm to avoid overflow.
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
 *   - Wikipedia. Complex number.
 *     https://en.wikipedia.org/wiki/Complex_number
 *   - Smith, R. L. Algorithm 116: Complex division. Communications of the ACM, 5(8), 1962.
 *     https://doi.org/10.1145/368637.368661
 *   - Wikipedia. Square root: square roots of negative and complex numbers.
 *     https://en.wikipedia.org/wiki/Square_root#Square_roots_of_negative_and_complex_numbers
 *   - Wikipedia. De Moivre's formula (roots of a complex number).
 *     https://en.wikipedia.org/wiki/De_Moivre%27s_formula
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 */

const MAX_INTEGER_POWER = 1_000_000;

function toNumberPart(value, name) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`Complex: ${name} must be a number (not NaN).`);
  }
  return value;
}

// Reads text like "3+4i", "3 - 4i", "-i", "2i", "5", or "1.5e3-2e-2i".
function parse(text) {
  const compact = text.replace(/\s+/g, "");
  if (compact === "") throw new RangeError("Complex: the text is empty.");

  const term = /([+-]?)((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)?([iI])?/y;
  let real = null;
  let imaginary = null;
  let position = 0;

  while (position < compact.length) {
    term.lastIndex = position;
    const match = term.exec(compact);
    if (!match || match[0] === "" || (match[2] === undefined && match[3] === undefined)) {
      throw new RangeError(`Complex: cannot read "${text}".`);
    }
    if (position > 0 && match[1] === "") {
      throw new RangeError(`Complex: cannot read "${text}" (a + or - is needed between terms).`);
    }

    const sign = match[1] === "-" ? -1 : 1;
    const size = match[2] === undefined ? 1 : Number(match[2]); // "i" alone means 1i
    if (match[3] !== undefined) {
      if (imaginary !== null) throw new RangeError(`Complex: cannot read "${text}" (two imaginary parts).`);
      imaginary = sign * size;
    } else {
      if (real !== null) throw new RangeError(`Complex: cannot read "${text}" (two real parts).`);
      real = sign * size;
    }
    position = term.lastIndex;
  }
  return new Complex(real ?? 0, imaginary ?? 0);
}

/**
 * A complex number a + bi. Instances never change: every operation returns a new one.
 *
 * Parts are ordinary JavaScript numbers (doubles), so results are approximate
 * and can overflow to Infinity or become NaN, like any floating-point math.
 *
 * @example
 * const z = Complex.of(3, 4);
 * z.abs();                          // 5
 * z.mul(Complex.of(1, 2)).toString(); // "-5 + 10i"
 */
export class Complex {
  #re;
  #im;

  /**
   * @param {number} [re=0] - The real part.
   * @param {number} [im=0] - The imaginary part.
   * @throws {TypeError} If a part is not a number, or is NaN.
   */
  constructor(re = 0, im = 0) {
    this.#re = toNumberPart(re, "the real part") + 0; // + 0 turns -0 into 0
    this.#im = toNumberPart(im, "the imaginary part") + 0;
    Object.freeze(this);
  }

  /** The number 0. */
  static ZERO = new Complex(0, 0);

  /** The number 1. */
  static ONE = new Complex(1, 0);

  /** The imaginary unit i. */
  static I = new Complex(0, 1);

  /**
   * Makes a complex number from a real and an imaginary part.
   *
   * @param {number} re - The real part.
   * @param {number} [im=0] - The imaginary part.
   * @returns {Complex}
   */
  static of(re, im = 0) {
    return new Complex(re, im);
  }

  /**
   * Makes a complex number from polar form: radius r and angle theta (in radians).
   *
   * @param {number} r - The distance from zero (the modulus). Any number; a negative r points the other way.
   * @param {number} theta - The angle in radians.
   * @returns {Complex}
   */
  static fromPolar(r, theta) {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  /**
   * Makes a complex number from almost any value:
   *   - a Complex: returned as it is;
   *   - a number: that real number;
   *   - an object with `re` and `im` (or `real` and `imag`) properties;
   *   - a string: "3+4i", "3 - 4i", "-i", "2i", "5".
   *
   * @param {Complex|number|{re: number, im?: number}|string} value - The value.
   * @returns {Complex}
   * @throws {TypeError} If the value has an unsupported type.
   * @throws {RangeError} If a string cannot be read.
   */
  static from(value) {
    if (value instanceof Complex) return value;
    if (typeof value === "number") return new Complex(value, 0);
    if (typeof value === "string") return parse(value);
    if (typeof value === "object" && value !== null) {
      return new Complex(value.re ?? value.real ?? 0, value.im ?? value.imag ?? 0);
    }
    throw new TypeError("Complex.from: expected a Complex, number, string, or { re, im } object.");
  }

  /** The real part. */
  get re() {
    return this.#re;
  }

  /** The imaginary part. */
  get im() {
    return this.#im;
  }

  /**
   * @param {Complex|number|string|object} other - A value Complex.from accepts.
   * @returns {Complex} this + other
   */
  add(other) {
    const o = Complex.from(other);
    return new Complex(this.#re + o.#re, this.#im + o.#im);
  }

  /**
   * @param {Complex|number|string|object} other - A value Complex.from accepts.
   * @returns {Complex} this - other
   */
  sub(other) {
    const o = Complex.from(other);
    return new Complex(this.#re - o.#re, this.#im - o.#im);
  }

  /**
   * @param {Complex|number|string|object} other - A value Complex.from accepts.
   * @returns {Complex} this x other
   */
  mul(other) {
    const o = Complex.from(other);
    return new Complex(this.#re * o.#re - this.#im * o.#im, this.#re * o.#im + this.#im * o.#re);
  }

  /**
   * Division by Smith's algorithm, which avoids overflow for very large or
   * very small parts.
   *
   * @param {Complex|number|string|object} other - A value Complex.from accepts.
   * @returns {Complex} this / other
   * @throws {RangeError} If other is zero.
   */
  div(other) {
    const o = Complex.from(other);
    if (o.#re === 0 && o.#im === 0) {
      throw new RangeError("Complex: division by zero.");
    }

    const { "#re": a, "#im": b } = { "#re": this.#re, "#im": this.#im };
    const c = o.#re;
    const d = o.#im;
    if (Math.abs(c) >= Math.abs(d)) {
      const ratio = d / c;
      const denominator = c + d * ratio;
      return new Complex((a + b * ratio) / denominator, (b - a * ratio) / denominator);
    }
    const ratio = c / d;
    const denominator = c * ratio + d;
    return new Complex((a * ratio + b) / denominator, (b * ratio - a) / denominator);
  }

  /** @returns {Complex} The negative of this number. */
  neg() {
    return new Complex(-this.#re, -this.#im);
  }

  /** @returns {Complex} The complex conjugate: a - bi. */
  conjugate() {
    return new Complex(this.#re, -this.#im);
  }

  /** @returns {number} The absolute value (modulus): the distance from zero. */
  abs() {
    return Math.hypot(this.#re, this.#im); // avoids overflow of a * a + b * b
  }

  /** @returns {number} The angle (argument) in radians, from -PI to PI. The angle of 0 is 0. */
  arg() {
    return Math.atan2(this.#im, this.#re);
  }

  /** @returns {{r: number, theta: number}} The polar form: the modulus and the angle in radians. */
  toPolar() {
    return { r: this.abs(), theta: this.arg() };
  }

  /** @returns {boolean} true if both parts are zero. */
  isZero() {
    return this.#re === 0 && this.#im === 0;
  }

  /**
   * @param {Complex|number|string|object} other - A value Complex.from accepts.
   * @param {number} [tolerance=0] - How far apart the parts may be and still count as equal.
   *   Floating-point math is rarely exact, so use a small tolerance such as 1e-12 after calculations.
   * @returns {boolean}
   */
  equals(other, tolerance = 0) {
    const o = Complex.from(other);
    return Math.abs(this.#re - o.#re) <= tolerance && Math.abs(this.#im - o.#im) <= tolerance;
  }

  /**
   * The principal square root (the one with a non-negative real part).
   *
   * @returns {Complex}
   */
  sqrt() {
    if (this.#re === 0 && this.#im === 0) return Complex.ZERO;
    const modulus = this.abs();
    const real = Math.sqrt((modulus + this.#re) / 2);
    const imaginary = Math.sqrt((modulus - this.#re) / 2);
    return new Complex(real, this.#im < 0 ? -imaginary : imaginary);
  }

  /** @returns {Complex} e raised to this number. */
  exp() {
    const scale = Math.exp(this.#re);
    return new Complex(scale * Math.cos(this.#im), scale * Math.sin(this.#im));
  }

  /**
   * The principal natural logarithm: ln|z| + i * arg(z).
   *
   * @returns {Complex}
   * @throws {RangeError} If this is zero.
   */
  log() {
    if (this.isZero()) {
      throw new RangeError("Complex: the logarithm of zero does not exist.");
    }
    return new Complex(Math.log(this.abs()), this.arg());
  }

  /**
   * Raises this number to a power. A whole-number power is worked out by
   * repeated multiplication (exact for whole-number parts); other powers use
   * exp(w * log(z)).
   *
   * Zero to the power 0 is 1, and zero to a power with a positive real part is 0.
   *
   * @param {Complex|number|string|object} exponent - A value Complex.from accepts.
   * @returns {Complex}
   * @throws {RangeError} If this is zero and the exponent has a real part of 0 or less (other than the exponent 0),
   *   or a whole-number exponent is larger than 1,000,000 in size.
   */
  pow(exponent) {
    const w = Complex.from(exponent);

    if (w.#im === 0 && Number.isInteger(w.#re)) {
      const n = w.#re;
      if (Math.abs(n) > MAX_INTEGER_POWER) {
        throw new RangeError(`Complex.pow: a whole-number exponent must be at most ${MAX_INTEGER_POWER} in size.`);
      }
      if (n < 0) return Complex.ONE.div(this.pow(-n));

      let result = Complex.ONE;
      let base = this;
      for (let remaining = n; remaining > 0; remaining = Math.floor(remaining / 2)) {
        if (remaining % 2 === 1) result = result.mul(base);
        base = base.mul(base);
      }
      return result;
    }

    if (this.isZero()) {
      if (w.#re > 0) return Complex.ZERO;
      throw new RangeError("Complex.pow: zero cannot be raised to this power.");
    }
    return w.mul(this.log()).exp();
  }

  /**
   * All n complex n-th roots of this number (n of them, spread evenly around a circle).
   *
   * @param {number} n - A positive integer.
   * @returns {Complex[]} The roots, starting with the principal root, going counterclockwise.
   * @throws {RangeError} If n is not a positive integer.
   */
  roots(n) {
    if (!Number.isInteger(n) || n < 1) {
      throw new RangeError("Complex.roots: n must be a positive integer.");
    }
    const radius = this.abs() ** (1 / n);
    const angle = this.arg();
    return Array.from({ length: n }, (_, k) => Complex.fromPolar(radius, (angle + 2 * Math.PI * k) / n));
  }

  /** @returns {Complex} The sine of this number. */
  sin() {
    return new Complex(Math.sin(this.#re) * Math.cosh(this.#im), Math.cos(this.#re) * Math.sinh(this.#im));
  }

  /** @returns {Complex} The cosine of this number. */
  cos() {
    return new Complex(Math.cos(this.#re) * Math.cosh(this.#im), -Math.sin(this.#re) * Math.sinh(this.#im));
  }

  /**
   * The number as text: "3 + 4i", "3 - 4i", "4i", "-i", or "3".
   *
   * @param {number} [digits] - Round each part to this many decimal places first (0 to 20).
   * @returns {string}
   * @throws {RangeError} If digits is not an integer from 0 to 20.
   */
  toString(digits) {
    let re = this.#re;
    let im = this.#im;
    if (digits !== undefined) {
      if (!Number.isInteger(digits) || digits < 0 || digits > 20) {
        throw new RangeError("Complex.toString: digits must be an integer from 0 to 20.");
      }
      re = Number(re.toFixed(digits)) + 0;
      im = Number(im.toFixed(digits)) + 0;
    }

    const magnitude = Math.abs(im);
    const imaginaryText = `${magnitude === 1 ? "" : magnitude}i`;
    if (im === 0) return String(re);
    if (re === 0) return `${im < 0 ? "-" : ""}${imaginaryText}`;
    return `${re} ${im < 0 ? "-" : "+"} ${imaginaryText}`;
  }

  /** The parts, so a Complex works with JSON. */
  toJSON() {
    return { re: this.#re, im: this.#im };
  }
}
