# event-emitter

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A small event emitter: subscribe with `on()` or `once()`, unsubscribe with the function that `on()` returns (or with `off()`), and send events with `emit()`. It works with string and symbol event names. If listeners throw, every listener still runs and the error is thrown afterwards.

## Usage

```js
import { EventEmitter } from "./event-emitter.js";

const emitter = new EventEmitter();

const stop = emitter.on("greet", (name) => console.log(`Hello, ${name}`));
emitter.once("greet", () => console.log("first greeting only"));

emitter.emit("greet", "Mei");  // logs both lines, returns true
emitter.emit("greet", "Sam");  // logs "Hello, Sam" only
emitter.emit("nobody");        // returns false (no listeners)

stop();                        // unsubscribe
emitter.listenerCount("greet");// 0

// off() with the same function
function onSave(data) { /* ... */ }
emitter.on("save", onSave);
emitter.off("save", onSave);   // true

// Symbols work as event names
const READY = Symbol("ready");
emitter.on(READY, () => console.log("ready"));
emitter.emit(READY);
```

## API

| Method | Result |
|--------|--------|
| `on(event, listener)` | Adds a listener. Returns a function that removes it |
| `once(event, listener)` | Adds a listener that runs at most once. Returns a function that removes it |
| `off(event, listener)` | Removes the most recently added registration of that function. Returns `true` if one was removed |
| `emit(event, ...args)` | Calls the listeners in order. Returns `true` if there were any |
| `listenerCount(event?)` | Listeners for one event, or for all events when omitted |
| `eventNames()` | Event names that currently have listeners |
| `removeAll(event?)` | Removes the listeners of one event, or of all. Returns how many were removed |

- **Event names** are strings or symbols.
- **During `emit`:** the list of listeners is copied first. A listener added during `emit` runs from the next `emit`. A listener removed during `emit` still runs this time, but a `once` listener never runs twice.
- **Errors:** if a listener throws, the remaining listeners still run. Afterwards, the error is thrown. If more than one listener threw, an `AggregateError` is thrown with all of them in `.errors`. (Node's `EventEmitter` stops at the first error; this module does not.)
- **Async listeners** are not awaited. `emit` does not wait for promises.
- **`this`:** inside a regular `function` listener, `this` is the emitter (as in Node.js). Arrow functions ignore it.
- Adding the same function twice calls it twice. The function returned by `on` removes exactly that registration, and returns `false` if it was already removed.
- Uses private class fields (Node.js 12+ and all current browsers) and `AggregateError` (Node.js 15+).
- Errors: `TypeError` if an event name is not a string or symbol, or a listener is not a function.

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

- Node.js. Events: EventEmitter.. https://nodejs.org/api/events.html
- MDN Web Docs. EventTarget. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
- MDN Web Docs. AggregateError. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
- Gamma, E., Helm, R., Johnson, R., and Vlissides, J. Design Patterns: Elements of Reusable Object-Oriented Software (Observer pattern). Addison-Wesley, 1994.. https://en.wikipedia.org/wiki/Observer_pattern
