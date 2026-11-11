# is-empty

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Checks whether a value is empty: `null`, `undefined`, an empty string, an empty array, `Map`, `Set`, or typed array, or a plain object with no own enumerable properties. Numbers, booleans, functions, and other objects are never empty, so `isEmpty(0)` is `false`.

## Usage

```js
import { isEmpty } from "./is-empty.js";

isEmpty(null);                  // true
isEmpty(undefined);             // true
isEmpty("");                    // true
isEmpty("   ");                 // false
isEmpty("   ", { trim: true }); // true
isEmpty([]);                    // true
isEmpty({});                    // true
isEmpty(new Map());             // true
isEmpty(new Set([1]));          // false

isEmpty(0);                     // false
isEmpty(false);                 // false
isEmpty(new Date());            // false
```

## API

`isEmpty(value, options?)`

| Value | Result |
|-------|--------|
| `null`, `undefined` | `true` |
| `""` | `true` |
| `[]`, empty typed array | `true` |
| `new Map()`, `new Set()` | `true` |
| `{}` or `Object.create(null)` (no own enumerable keys) | `true` |
| Non-empty versions of the above | `false` |
| Numbers (`0`, `NaN`), booleans, functions, symbols, BigInt | `false` |
| `Date`, `RegExp`, class instances, `DataView` | `false` |

| Option | Default | Description |
|--------|---------|-------------|
| `trim` | `false` | Treat whitespace-only strings as empty |

- An object with only non-enumerable properties counts as empty.
- Never throws.

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

- MDN Web Docs. Object.keys(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
- MDN Web Docs. Reflect.ownKeys(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys
- MDN Web Docs. ArrayBuffer.isView(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView
