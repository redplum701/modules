/**
 * retry
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Runs an async (or sync) function again when it fails, waiting longer
 *   between attempts (exponential backoff) with random jitter so that many
 *   clients do not retry at the same moment. Supports a retry condition, a
 *   cap on the delay, and cancellation with an AbortSignal.
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
 *   - Brooker, M. Exponential Backoff And Jitter. AWS Architecture Blog, 2015.
 *     https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 *   - Wikipedia. Exponential backoff.
 *     https://en.wikipedia.org/wiki/Exponential_backoff
 *   - MDN Web Docs. AbortSignal. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
 */

// setTimeout stores the delay as a 32-bit signed integer.
const MAX_DELAY = 2 ** 31 - 1;
const JITTER_MODES = ["full", "equal", "none"];

function assertBackoffOptions({ baseDelay, factor, maxDelay, jitter, random }, fnName) {
  if (typeof baseDelay !== "number" || !Number.isFinite(baseDelay) || baseDelay < 0) {
    throw new RangeError(`${fnName}: baseDelay must be a number, 0 or more.`);
  }
  if (typeof factor !== "number" || !Number.isFinite(factor) || factor < 1) {
    throw new RangeError(`${fnName}: factor must be a number, 1 or more.`);
  }
  if (typeof maxDelay !== "number" || Number.isNaN(maxDelay) || maxDelay < 0) {
    throw new RangeError(`${fnName}: maxDelay must be a number, 0 or more.`);
  }
  if (!JITTER_MODES.includes(jitter)) {
    throw new RangeError(`${fnName}: jitter must be one of ${JITTER_MODES.join(", ")}.`);
  }
  if (typeof random !== "function") {
    throw new TypeError(`${fnName}: random must be a function.`);
  }
}

/**
 * Works out how long to wait before the next attempt.
 *
 * The wait grows like baseDelay * factor^(attempt - 1), is capped at
 * maxDelay, and then jitter makes it random:
 *   "full"  (default): a random value from 0 up to the delay
 *   "equal": half the delay plus a random value up to the other half
 *   "none":  exactly the delay
 *
 * @param {number} attempt - The attempt that just failed (1 for the first).
 * @param {object} [options]
 * @param {number} [options.baseDelay=100] - Delay in ms after the first failure.
 * @param {number} [options.factor=2] - Growth per attempt (1 or more).
 * @param {number} [options.maxDelay=30000] - Longest delay in ms.
 * @param {"full"|"equal"|"none"} [options.jitter="full"] - How to randomize.
 * @param {() => number} [options.random=Math.random] - Returns a number in [0, 1).
 * @returns {number} Milliseconds, a whole number.
 * @throws {RangeError} If an option is out of range, or attempt is not a positive integer.
 */
export function backoffDelay(attempt, options = {}) {
  const { baseDelay = 100, factor = 2, maxDelay = 30000, jitter = "full", random = Math.random } = options;
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new RangeError("backoffDelay: attempt must be a positive integer.");
  }
  assertBackoffOptions({ baseDelay, factor, maxDelay, jitter, random }, "backoffDelay");

  // 0 * Infinity would be NaN, and a huge growth would be Infinity: handle both.
  const grown = baseDelay === 0 ? 0 : baseDelay * factor ** (attempt - 1);
  const delay = Math.min(Number.isFinite(grown) ? grown : Infinity, maxDelay, MAX_DELAY);

  if (jitter === "none") return Math.round(delay);

  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw new RangeError("backoffDelay: random() must return a number from 0 up to, but not including, 1.");
  }
  return Math.round(jitter === "full" ? value * delay : delay / 2 + (value * delay) / 2);
}

// Waits for ms, or rejects with signal.reason if the signal is aborted.
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
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

/**
 * Calls fn until it succeeds, waiting longer after each failure.
 *
 * fn may be sync or async. If every attempt fails, the error from the last
 * attempt is thrown (unchanged).
 *
 * @param {(attempt: number) => *} fn - The work. Receives the attempt number (1, 2, 3...).
 * @param {object} [options]
 * @param {number} [options.retries=3] - Retries after the first attempt (so up
 *   to retries + 1 attempts). 0 means try once. Infinity retries forever.
 * @param {(error: *, attempt: number) => boolean|Promise<boolean>} [options.shouldRetry]
 *   Return false to stop and throw that error right away. Default: always retry.
 *   If it throws, that new error is thrown.
 * @param {(error: *, attempt: number, delay: number) => void} [options.onRetry]
 *   Called before each wait, for logging.
 * @param {AbortSignal} [options.signal] - Abort to stop. The returned promise
 *   rejects with signal.reason (a running attempt is not interrupted).
 * @param {number} [options.baseDelay=100] - See backoffDelay.
 * @param {number} [options.factor=2] - See backoffDelay.
 * @param {number} [options.maxDelay=30000] - See backoffDelay.
 * @param {"full"|"equal"|"none"} [options.jitter="full"] - See backoffDelay.
 * @param {() => number} [options.random=Math.random] - See backoffDelay.
 * @returns {Promise<*>} The result of the first successful attempt.
 *   Invalid options reject with a TypeError or RangeError.
 */
export async function retry(fn, options = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("retry: expected a function.");
  }

  const {
    retries = 3,
    shouldRetry = () => true,
    onRetry,
    signal,
    baseDelay = 100,
    factor = 2,
    maxDelay = 30000,
    jitter = "full",
    random = Math.random,
  } = options;

  if (retries !== Infinity && !(Number.isInteger(retries) && retries >= 0)) {
    throw new RangeError("retry: retries must be a non-negative integer or Infinity.");
  }
  if (typeof shouldRetry !== "function") {
    throw new TypeError("retry: shouldRetry must be a function.");
  }
  if (onRetry !== undefined && typeof onRetry !== "function") {
    throw new TypeError("retry: onRetry must be a function.");
  }
  if (signal !== undefined && typeof signal.addEventListener !== "function") {
    throw new TypeError("retry: signal must be an AbortSignal.");
  }
  const backoff = { baseDelay, factor, maxDelay, jitter, random };
  assertBackoffOptions(backoff, "retry");

  for (let attempt = 1; ; attempt += 1) {
    if (signal?.aborted) throw signal.reason;

    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt > retries) throw error; // no attempts left
      if (!(await shouldRetry(error, attempt))) throw error;

      const delay = backoffDelay(attempt, backoff);
      onRetry?.(error, attempt, delay);
      await wait(delay, signal);
    }
  }
}
