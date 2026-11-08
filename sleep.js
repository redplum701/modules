/**
 * sleep
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Promise-based delay that can be cancelled with an AbortSignal. Use it with
 *   await to pause an async function for a number of milliseconds.
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
 *   - MDN Web Docs. setTimeout(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
 *   - MDN Web Docs. AbortSignal. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
 *   - MDN Web Docs. Promise. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

// setTimeout stores the delay as a 32-bit signed integer. Larger values
// fire immediately instead of waiting, so they are rejected here.
const MAX_DELAY = 2 ** 31 - 1;

/**
 * Waits for a number of milliseconds.
 *
 * @param {number} ms - Delay from 0 to 2,147,483,647 (about 24.8 days).
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - Cancels the wait. The promise then
 *   rejects with signal.reason (an AbortError by default).
 * @returns {Promise<void>} Resolves after ms milliseconds.
 *   Invalid input rejects with TypeError or RangeError.
 */
export function sleep(ms, options = {}) {
  const { signal } = options;

  return new Promise((resolve, reject) => {
    if (typeof ms !== "number") {
      throw new TypeError("sleep: ms must be a number.");
    }
    if (!(ms >= 0 && ms <= MAX_DELAY)) {
      // Also catches NaN, because every comparison with NaN is false.
      throw new RangeError(`sleep: ms must be from 0 to ${MAX_DELAY}.`);
    }
    if (signal !== undefined && typeof signal.addEventListener !== "function") {
      throw new TypeError("sleep: signal must be an AbortSignal.");
    }

    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
