/**
 * range
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Generates sequences of numbers: range(end), range(start, end), or
 *   range(start, end, step). The end is not included. Handles counting down and
 *   decimal steps without floating-point noise (0.1 + 0.2 style errors).
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
 *   - Python Software Foundation. Ranges (built-in types).
 *     https://docs.python.org/3/library/stdtypes.html#range
 *   - Lodash. _.range.
 *     https://lodash.com/docs/#range
 *   - MDN Web Docs. Number.prototype.toFixed(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
 */

// Longest sequence allowed, so a typo like range(1e12) cannot freeze the page.
const MAX_LENGTH = 10_000_000;

function assertNumber(value, name) {
  if (typeof value !== "number") {
    throw new TypeError(`range: ${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new RangeError(`range: ${name} must be finite.`);
  }
}

// Counts the digits after the decimal point: 0.25 -> 2, 1.5e-7 -> 8, 3 -> 0.
function decimalPlaces(n) {
  const match = /(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(n));
  const fraction = match[1] ? match[1].length : 0;
  const exponent = match[2] ? Number(match[2]) : 0;
  return Math.max(0, fraction - exponent);
}

/**
 * Creates an array of numbers from start up to, but not including, end.
 *
 * Call styles:
 *   range(end)                 start = 0, step = 1 (or -1 if end is negative)
 *   range(start, end)          step = 1 (or -1 if end is less than start)
 *   range(start, end, step)    explicit step
 *
 * If step points away from end (for example range(0, 5, -1)), the result is [].
 *
 * @param {...number} args - One to three finite numbers.
 * @returns {number[]}
 * @throws {TypeError} If the arguments are not 1 to 3 numbers.
 * @throws {RangeError} If a value is not finite, step is 0, or the result
 *   would be longer than 10,000,000 items.
 */
export function range(...args) {
  if (args.length < 1 || args.length > 3) {
    throw new TypeError("range: expected 1 to 3 arguments.");
  }

  const start = args.length === 1 ? 0 : args[0];
  const end = args.length === 1 ? args[0] : args[1];
  assertNumber(start, "start");
  assertNumber(end, "end");

  const step = args.length === 3 ? args[2] : start <= end ? 1 : -1;
  assertNumber(step, "step");
  if (step === 0) {
    throw new RangeError("range: step must not be 0.");
  }

  // How many steps fit between start and end?
  const steps = (end - start) / step;
  if (steps <= 0) return [];

  // Division can land just above a whole number (1.1 / 0.1 is 11.000000000000002),
  // so treat values within a tiny margin of a whole number as that whole number.
  const nearest = Math.round(steps);
  const count = Math.abs(steps - nearest) <= steps * 1e-12 ? nearest : Math.ceil(steps);
  if (count > MAX_LENGTH) {
    throw new RangeError(`range: result would have more than ${MAX_LENGTH} items.`);
  }

  // Multiply instead of adding step repeatedly, so errors do not pile up.
  // Then round to the decimals in start and step: 3 * 0.1 gives 0.3, not 0.30000000000000004.
  const places = Math.min(100, Math.max(decimalPlaces(start), decimalPlaces(step)));
  const result = new Array(count);
  for (let i = 0; i < count; i += 1) {
    const value = start + i * step;
    result[i] = places === 0 ? value : Number(value.toFixed(places));
  }
  return result;
}
