# promise-timeout

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Adds a time limit to a promise or an async function. If it does not finish in time, the result is a rejection with a `TimeoutError`. When you pass a function, it also receives an `AbortSignal` that is aborted on timeout, so the work itself (such as a `fetch`) can be cancelled.

## Usage

```js
import { withTimeout, TimeoutError } from "./promise-timeout.js";

// A promise with a time limit
try {
  const data = await withTimeout(fetchData(), 3000);
} catch (error) {
  if (error instanceof TimeoutError) console.log("Too slow:", error.message); // "Timed out after 3000 ms."
  else throw error;
}

// A function: the signal lets the work stop when time runs out
const response = await withTimeout((signal) => fetch("/api/slow", { signal }), 3000);

// Custom message
await withTimeout(job(), 5000, { message: "The job took too long." });

// Combine with other modules, for example retry (each attempt gets 2 seconds)
await retry(() => withTimeout(callApi(), 2000));
```

## API

`withTimeout(task, ms, options?)` returns a `Promise`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `task` | Promise, value, or `(signal) => any` | The work. A function is called with an `AbortSignal` |
| `ms` | number | `0` to `2147483647`, or `Infinity` for no limit |
| `options.message` | string | Message of the `TimeoutError` (default `"Timed out after {ms} ms."`) |

`TimeoutError` extends `Error` with `name === "TimeoutError"` and an `ms` property.

- **The work is not stopped by the timeout alone.** A plain promise keeps running in the background and its result is ignored. To stop the work, pass a function and give the `signal` to something that understands it, such as `fetch`. On timeout the signal is aborted with the `TimeoutError` as its `reason`.
- If the task finishes first, its value or error is passed on and the timer is cleared.
- Late results and late errors from timed-out work are ignored (no unhandled rejection).
- A task that is already settled wins over a limit of `0`.
- If a function task throws, the returned promise rejects with that error.
- Invalid arguments reject the returned promise (the function task is not called): `TypeError` for a non-number `ms` or non-string `message`, `RangeError` for `NaN`, negative, or too large `ms`.
- Needs `AbortController` (Node.js 15+ and all current browsers).

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

- MDN Web Docs. AbortController. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/AbortController
- MDN Web Docs. AbortSignal.timeout(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
- MDN Web Docs. Promise.race(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race
- MDN Web Docs. setTimeout(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
