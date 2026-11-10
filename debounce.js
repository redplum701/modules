/**
 * debounce
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Delays a function until calls have stopped for a while: it runs once,
 *   `wait` milliseconds after the last call. Can also run on the first call
 *   (leading), can guarantee a run at least every maxWait milliseconds, and
 *   can be cancelled or flushed.
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
 *   - Lodash. _.debounce.
 *     https://lodash.com/docs/#debounce
 *   - Corbacho, D. Debouncing and Throttling Explained Through Examples. CSS-Tricks, 2016.
 *     https://css-tricks.com/debouncing-throttling-explained-examples/
 *   - MDN Web Docs. setTimeout(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
 *   - MDN Web Docs. clearTimeout(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout
 */

// setTimeout stores the delay as a 32-bit signed integer.
const MAX_DELAY = 2 ** 31 - 1;

/**
 * Makes a version of fn that waits until calls have stopped.
 *
 * A "burst" is a series of calls where each comes less than `wait` ms after
 * the one before. When a burst ends (wait ms after its last call):
 *   - with trailing: true (default), fn runs once with the arguments of the
 *     last call;
 *   - with leading: true, fn also runs immediately on the first call of the burst.
 * With both on and only one call in the burst, fn runs once (not twice).
 *
 * @param {Function} fn - The function to delay.
 * @param {number} wait - How long calls must stop, in ms (0 to 2,147,483,647).
 * @param {object} [options]
 * @param {boolean} [options.leading=false] - Run on the first call of a burst.
 * @param {boolean} [options.trailing=true] - Run at the end of a burst.
 * @param {number} [options.maxWait] - Longest time, in ms, a waiting call may be
 *   held back while calls keep coming. When it passes, fn runs with the latest
 *   arguments, and the clock starts again. Must be at least `wait`, and
 *   needs trailing: true.
 * @returns {Function} The debounced function. It returns the result of the most
 *   recent run (undefined before the first run). It also has cancel(), flush(),
 *   and pending().
 * @throws {TypeError} If fn is not a function, or an option has the wrong type.
 * @throws {RangeError} If wait or maxWait is out of range, or the options
 *   cannot work together.
 */
export function debounce(fn, wait, options = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("debounce: expected a function.");
  }
  if (typeof wait !== "number" || !(wait >= 0 && wait <= MAX_DELAY)) {
    throw new RangeError(`debounce: wait must be a number from 0 to ${MAX_DELAY}.`);
  }
  const { leading = false, trailing = true, maxWait } = options;
  if (typeof leading !== "boolean" || typeof trailing !== "boolean") {
    throw new TypeError("debounce: leading and trailing must be booleans.");
  }
  if (!leading && !trailing) {
    throw new RangeError("debounce: leading and trailing cannot both be false.");
  }
  if (maxWait !== undefined) {
    if (typeof maxWait !== "number" || !(maxWait >= wait && maxWait <= MAX_DELAY)) {
      throw new RangeError(`debounce: maxWait must be a number from wait (${wait}) to ${MAX_DELAY}.`);
    }
    if (!trailing) {
      throw new RangeError("debounce: maxWait needs trailing: true.");
    }
  }

  let waitTimer; // runs when calls have stopped for `wait`
  let maxTimer; // runs when the oldest waiting call has been held for `maxWait`
  let lastArgs;
  let lastThis;
  let hasPending = false; // a trailing run is waiting
  let result;

  function run() {
    const args = lastArgs;
    const context = lastThis;
    lastArgs = undefined;
    lastThis = undefined;
    hasPending = false;
    result = Reflect.apply(fn, context, args);
    return result;
  }

  function clearTimers() {
    clearTimeout(waitTimer);
    clearTimeout(maxTimer);
    waitTimer = undefined;
    maxTimer = undefined;
  }

  // The burst is over.
  function onQuiet() {
    waitTimer = undefined;
    clearTimeout(maxTimer);
    maxTimer = undefined;
    if (hasPending) run();
    lastArgs = undefined;
    lastThis = undefined;
  }

  // A waiting call has been held back for maxWait: run it, and start counting again.
  function onMaxWait() {
    maxTimer = undefined;
    if (waitTimer === undefined) return;
    if (hasPending) run();
    maxTimer = setTimeout(onMaxWait, maxWait);
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    if (waitTimer === undefined) {
      // The first call of a new burst.
      waitTimer = setTimeout(onQuiet, wait);
      if (maxWait !== undefined) maxTimer = setTimeout(onMaxWait, maxWait);
      if (leading) {
        run();
      } else {
        hasPending = true;
      }
    } else {
      // Another call in the same burst: start waiting again.
      clearTimeout(waitTimer);
      waitTimer = setTimeout(onQuiet, wait);
      hasPending = trailing;
    }
    return result;
  }

  /** Cancels a waiting run and forgets the burst. */
  debounced.cancel = () => {
    clearTimers();
    hasPending = false;
    lastArgs = undefined;
    lastThis = undefined;
  };

  /** Runs a waiting call now (and ends the burst). Returns the latest result. */
  debounced.flush = () => {
    if (!hasPending) return result;
    clearTimers();
    return run();
  };

  /** True if a run is waiting. */
  debounced.pending = () => hasPending;

  return debounced;
}
