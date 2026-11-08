/**
 * once
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Wraps a function so it runs only the first time it is called. Later calls
 *   return the first result (or throw the first error) without running the
 *   function again. Includes reset() to arm it again.
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
 *   - MDN Web Docs. Function.prototype.apply(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
 *   - MDN Web Docs. Closures. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
 *   - MDN Web Docs. Promise. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

/**
 * Creates a function that calls fn only once.
 *
 * - The first call runs fn and remembers what happened.
 * - Every later call returns the same value, or throws the same error,
 *   without running fn again. Arguments to later calls are ignored.
 * - `this` is passed through to fn on the first call.
 * - If fn is async, every caller gets the same promise.
 *
 * @param {Function} fn - The function to run once.
 * @returns {Function} The wrapped function. It also has a reset() method.
 * @throws {TypeError} If fn is not a function.
 */
export function once(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("once: expected a function.");
  }

  let called = false;
  let failed = false;
  let outcome; // the return value, or the error that was thrown

  function wrapper(...args) {
    if (!called) {
      called = true; // set first so a recursive call cannot run fn twice
      try {
        outcome = fn.apply(this, args);
      } catch (error) {
        failed = true;
        outcome = error;
      }
    }
    if (failed) throw outcome;
    return outcome;
  }

  /** Forgets the stored result so the next call runs fn again. */
  wrapper.reset = () => {
    called = false;
    failed = false;
    outcome = undefined;
  };

  return wrapper;
}
