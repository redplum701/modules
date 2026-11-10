# retry

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Runs an async (or sync) function again when it fails, waiting longer between attempts (exponential backoff) with random jitter, so that many clients do not all retry at the same moment. It supports a retry condition, a cap on the delay, and cancellation with an `AbortSignal`.

## Usage

```js
import { retry, backoffDelay } from "./retry.js";

// Up to 4 attempts (the first one plus 3 retries)
const data = await retry(() => fetchJson("/api/data"));

// Choose what to retry, and log
const result = await retry(
  async (attempt) => {
    console.log(`attempt ${attempt}`);
    return await callApi();
  },
  {
    retries: 5,
    baseDelay: 200,
    maxDelay: 10_000,
    shouldRetry: (error) => error.status >= 500,   // do not retry 4xx errors
    onRetry: (error, attempt, delay) => console.log(`failed, retrying in ${delay} ms`),
  }
);

// Cancel from outside
const controller = new AbortController();
const promise = retry(task, { retries: Infinity, signal: controller.signal });
controller.abort();                                // promise rejects with the abort reason

// See the delays
backoffDelay(1, { jitter: "none" });   // 100
backoffDelay(2, { jitter: "none" });   // 200
backoffDelay(3, { jitter: "none" });   // 400
backoffDelay(3);                       // random from 0 to 400 (full jitter)
```

## API

**`retry(fn, options?)`** returns a `Promise` of the first successful result. If all attempts fail, it rejects with the last error, unchanged.

| Option | Default | Description |
|--------|---------|-------------|
| `retries` | `3` | Retries after the first attempt (up to `retries + 1` attempts). `0` tries once. `Infinity` never gives up |
| `shouldRetry` | always | `(error, attempt) => boolean` (may be async). `false` stops and throws that error. If it throws, that error is thrown |
| `onRetry` | — | `(error, attempt, delay) => void`, called before each wait |
| `signal` | — | An `AbortSignal`. Aborting rejects with `signal.reason`. A running attempt is not interrupted |
| `baseDelay` | `100` | Delay (ms) after the first failure |
| `factor` | `2` | Growth per attempt (1 or more) |
| `maxDelay` | `30000` | Longest delay (ms) |
| `jitter` | `"full"` | `"full"`, `"equal"`, or `"none"` |
| `random` | `Math.random` | Random source for jitter (for testing) |

`fn(attempt)` receives the attempt number (1, 2, 3, …) and may be sync or async.

**`backoffDelay(attempt, options?)`** returns the wait in milliseconds (a whole number) after the given failed attempt. It takes the same `baseDelay`, `factor`, `maxDelay`, `jitter`, and `random` options.

| `jitter` | Wait after attempt *n* (with *d* = `min(maxDelay, baseDelay × factor^(n-1))`) |
|----------|-------------|
| `"none"` | exactly *d* |
| `"full"` | random from 0 to *d* (spreads retries out the most) |
| `"equal"` | *d*/2 plus a random value up to *d*/2 (always waits at least half) |

- Retry only what can succeed later: network errors and 5xx responses, not bad input. Use `shouldRetry`.
- Retrying is only safe for operations that can run more than once without harm (idempotent ones).
- Combine with `promise-timeout` to limit each attempt: `retry(() => withTimeout(task(), 2000))`.
- Errors: invalid options reject the returned promise with `TypeError` or `RangeError`.

## License

MIT License

Copyright (c) 2026 紅梅

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## References

- Brooker, M. Exponential Backoff And Jitter. AWS Architecture Blog, 2015.. https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- Wikipedia. Exponential backoff.. https://en.wikipedia.org/wiki/Exponential_backoff
- MDN Web Docs. AbortSignal. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
