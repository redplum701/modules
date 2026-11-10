/**
 * throttle
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Limits how often a function can run: at most once per wait period, no
 *   matter how often it is called. Can run on the first call (leading), after
 *   the period with the latest arguments (trailing), or both, and can be
 *   cancelled or flushed.
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
 *   - Lodash. _.throttle.
 *     https://lodash.com/docs/#throttle
 *   - Corbacho, D. Debouncing and Throttling Explained Through Examples. CSS-Tricks, 2016.
 *     https://css-tricks.com/debouncing-throttling-explained-examples/
 *   - MDN Web Docs. Performance: now() method. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
 *   - MDN Web Docs. setTimeout(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
 */

// setTimeout stores the delay as a 32-bit signed integer.
const MAX_DELAY = 2 ** 31 - 1;

// A steady clock that cannot jump backwards (falls back to Date.now).
function now() {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

/**
 * Makes a version of fn that runs at most once every `wait` milliseconds.
 *
 * How it decides:
 *   - If `wait` has passed since the last run and `leading` is true, a call
 *     runs fn right away.
 *   - Calls that come too early are not run. With `trailing` true, the latest
 *     of them runs when `wait` has passed since the last run, with the latest
 *     arguments.
 *   - fn never runs more than once per `wait`, even across bursts of calls.
 *
 * With leading: false, fn never runs on the call itself, only after a delay
 * (a call after a long quiet time waits the full `wait`).
 *
 * @param {Function} fn - The function to limit.
 * @param {number} wait - Minimum time between runs, in ms (0 to 2,147,483,647).
 * @param {object} [options]
 * @param {boolean} [options.leading=true] - Run on the first call.
 * @param {boolean} [options.trailing=true] - Run once more after the wait, with
 *   the latest arguments, if there were calls in between.
 * @returns {Function} The throttled function. It returns the result of the most
 *   recent run (undefined before the first run). It also has cancel(), flush(),
 *   and pending().
 * @throws {TypeError} If fn is not a function, or an option has the wrong type.
 * @throws {RangeError} If wait is out of range, or both leading and trailing are false.
 */
export function throttle(fn, wait, options = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("throttle: expected a function.");
  }
  if (typeof wait !== "number" || !(wait >= 0 && wait <= MAX_DELAY)) {
    throw new RangeError(`throttle: wait must be a number from 0 to ${MAX_DELAY}.`);
  }
  const { leading = true, trailing = true } = options;
  if (typeof leading !== "boolean" || typeof trailing !== "boolean") {
    throw new TypeError("throttle: leading and trailing must be booleans.");
  }
  if (!leading && !trailing) {
    throw new RangeError("throttle: leading and trailing cannot both be false.");
  }

  let lastRunTime; // undefined until fn has run once
  let timer;
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
    lastRunTime = now(); // set before calling fn, so an error in fn still counts as a run
    result = Reflect.apply(fn, context, args);
    return result;
  }

  function onTimer() {
    timer = undefined;
    if (hasPending) run();
  }

  function throttled(...args) {
    lastArgs = args;
    lastThis = this;

    // A trailing run is already scheduled: it will use these newest arguments.
    if (timer !== undefined) return result;

    const elapsed = lastRunTime === undefined ? Infinity : now() - lastRunTime;
    const ready = elapsed >= wait || elapsed < 0; // elapsed < 0 only if the clock went backwards

    if (ready && leading) {
      run();
    } else if (trailing) {
      // Too early (wait for the rest of the period), or leading is off (wait
      // the whole period).
      hasPending = true;
      timer = setTimeout(onTimer, ready ? wait : wait - elapsed);
    } else {
      lastArgs = undefined; // too early and no trailing run: this call is dropped
      lastThis = undefined;
    }
    return result;
  }

  /** Cancels a waiting run and resets the timing, so the next call is treated as the first. */
  throttled.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    hasPending = false;
    lastArgs = undefined;
    lastThis = undefined;
    lastRunTime = undefined;
  };

  /** Runs a waiting call now. Returns the latest result. */
  throttled.flush = () => {
    if (!hasPending) return result;
    clearTimeout(timer);
    timer = undefined;
    return run();
  };

  /** True if a run is waiting. */
  throttled.pending = () => hasPending;

  return throttled;
}
