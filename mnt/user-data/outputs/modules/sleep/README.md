# sleep

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Promise-based delay that can be cancelled with an `AbortSignal`. Use it with `await` to pause an async function for a number of milliseconds.

## Usage

```js
import { sleep } from "./sleep.js";

console.log("start");
await sleep(1000);   // wait 1 second
console.log("one second later");

// Cancel a wait
const controller = new AbortController();
setTimeout(() => controller.abort(), 100);

try {
  await sleep(5000, { signal: controller.signal });
} catch (error) {
  console.log(error.name); // "AbortError"
}
```

## API

`sleep(ms, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `ms` | number | Delay in milliseconds, from `0` to `2147483647` |
| `options.signal` | `AbortSignal` | Optional. Aborting rejects the promise with `signal.reason` |

- Returns a `Promise<void>` that resolves after `ms` milliseconds.
- If the signal is already aborted, the promise rejects right away.
- Invalid input rejects the promise (it does not throw synchronously): `TypeError` if `ms` is not a number or `signal` is not an `AbortSignal`, `RangeError` if `ms` is `NaN`, negative, or above `2147483647`.
- Delays are approximate. Timers can fire a few milliseconds late.

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

- MDN Web Docs. setTimeout(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
- MDN Web Docs. AbortSignal. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
- MDN Web Docs. Promise. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
