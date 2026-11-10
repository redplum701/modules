/**
 * promise-timeout
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Adds a time limit to a promise or an async function. If it does not finish
 *   in time, the result is a rejection with a TimeoutError. When given a
 *   function, it also receives an AbortSignal that is aborted on timeout, so
 *   the work itself (such as a fetch) can be cancelled.
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
 *   - MDN Web Docs. AbortController. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/AbortController
 *   - MDN Web Docs. AbortSignal.timeout(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
 *   - MDN Web Docs. Promise.race(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race
 *   - MDN Web Docs. setTimeout(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
 */

// setTimeout stores the delay as a 32-bit signed integer. Larger values
// fire immediately instead of waiting, so they are rejected here.
const MAX_DELAY = 2 ** 31 - 1;

/**
 * The error a timed-out promise rejects with.
 */
export class TimeoutError extends Error {
  /**
   * @param {string} message - What went wrong.
   * @param {number} ms - The time limit that was exceeded.
   */
  constructor(message, ms) {
    super(message);
    this.name = "TimeoutError";
    this.ms = ms;
  }
}

/**
 * Gives a promise or async function a time limit.
 *
 * - If the work finishes first, the result (or its error) is passed on.
 * - If the time runs out first, the returned promise rejects with a
 *   TimeoutError. The work itself is NOT stopped, unless you pass a function
 *   and use the AbortSignal it receives.
 * - A late result or error from timed-out work is ignored (no unhandled
 *   rejection).
 *
 * @param {Promise|Function|*} task - A promise (or any value or thenable), or
 *   a function called as task(signal). The signal is aborted with the
 *   TimeoutError when time runs out.
 * @param {number} ms - Time limit in milliseconds: 0 to 2,147,483,647, or
 *   Infinity for no limit.
 * @param {object} [options]
 * @param {string} [options.message] - Message of the TimeoutError.
 * @returns {Promise} Settles like the task, or rejects with a TimeoutError.
 *   Invalid arguments reject with a TypeError or RangeError (the function is not called).
 */
export function withTimeout(task, ms, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof ms !== "number") {
      throw new TypeError("withTimeout: ms must be a number.");
    }
    if (!(ms >= 0 && ms <= MAX_DELAY) && ms !== Infinity) {
      // Also catches NaN, because every comparison with NaN is false.
      throw new RangeError(`withTimeout: ms must be from 0 to ${MAX_DELAY}, or Infinity.`);
    }
    const { message = `Timed out after ${ms} ms.` } = options;
    if (typeof message !== "string") {
      throw new TypeError("withTimeout: message must be a string.");
    }

    const controller = new AbortController();
    let timer;

    if (ms !== Infinity) {
      timer = setTimeout(() => {
        const error = new TimeoutError(message, ms);
        controller.abort(error); // tells the work to stop, if it listens
        reject(error);
      }, ms);
    }

    let work;
    try {
      work = typeof task === "function" ? task(controller.signal) : task;
    } catch (error) {
      clearTimeout(timer);
      reject(error);
      return;
    }

    // Whichever of the two settles first wins. Calling resolve or reject a
    // second time does nothing, so a late result is ignored safely.
    Promise.resolve(work).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
