# throttle

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Limits how often a function can run: at most once per wait period, no matter how often it is called. Typical uses are scroll and resize handlers and button clicks. It can run on the first call (`leading`), after the period with the latest arguments (`trailing`), or both, and it can be cancelled or flushed.

## Usage

```js
import { throttle } from "./throttle.js";

const save = throttle((text) => api.save(text), 1000);

save("a");   // runs now
save("ab");  // too early: waits
save("abc"); // too early: replaces the waiting arguments
// ...1 second after the first run: runs once with "abc"

// Only on the first call of each period
const onClick = throttle(handleClick, 500, { trailing: false });

// Only at the end of each period
const onScroll = throttle(updatePosition, 200, { leading: false });

save.pending();   // true if a run is waiting
save.flush();     // run the waiting call now
save.cancel();    // drop the waiting call and reset
```

## API

`throttle(fn, wait, options?)` returns a function that takes the same arguments as `fn`.

| Option | Default | Description |
|--------|---------|-------------|
| `leading` | `true` | Run on the first call (when `wait` has passed since the last run) |
| `trailing` | `true` | If calls were skipped, run once more when `wait` has passed since the last run, with the latest arguments |

| Member | Description |
|--------|-------------|
| `cancel()` | Drop a waiting call and reset, so the next call counts as the first |
| `flush()` | Run a waiting call now and return the latest result |
| `pending()` | `true` if a call is waiting |

- **The guarantee:** `fn` runs at most once per `wait`, also across bursts of calls. (A timer-only design can break this when a burst ends and another begins.)
- With `leading: false`, `fn` never runs on the call itself. The first run comes `wait` after the call.
- With `trailing: false`, calls that come too early are dropped.
- Both `leading` and `trailing` set to `false` is an error (`fn` could never run).
- The throttled function returns the result of the most recent run (`undefined` before the first). `this` and the arguments of the latest call are passed to `fn`.
- Time is measured with `performance.now()`, which does not jump when the system clock changes. Delays are timers, so they can be a few milliseconds late.
- Errors thrown by `fn` on a trailing run are thrown from the timer (an uncaught error). Catch inside `fn` if that matters.
- For "wait until calls stop" instead, use `debounce`.
- Errors: `TypeError` if `fn` is not a function or an option is not a boolean, `RangeError` if `wait` is invalid or both options are `false`.

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

- Lodash. _.throttle.. https://lodash.com/docs/#throttle
- Corbacho, D. Debouncing and Throttling Explained Through Examples. CSS-Tricks, 2016.. https://css-tricks.com/debouncing-throttling-explained-examples/
- MDN Web Docs. Performance: now() method. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
- MDN Web Docs. setTimeout(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
