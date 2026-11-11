# pick-omit

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Creates a new object with only the chosen keys (`pick`) or without the chosen keys (`omit`). It makes a shallow copy of own enumerable properties and never changes the original.

## Usage

```js
import { pick, omit } from "./pick-omit.js";

const user = { id: 7, name: "Mei", email: "mei@example.com", password: "secret" };

pick(user, ["id", "name"]);
// { id: 7, name: "Mei" }

omit(user, ["password"]);
// { id: 7, name: "Mei", email: "mei@example.com" }

pick(user, ["name", "nickname"]);
// { name: "Mei" } (missing keys are skipped)

user;
// unchanged
```

## API

| Function | Result |
|----------|--------|
| `pick(object, keys)` | New object with only the listed keys. Property order follows `keys` |
| `omit(object, keys)` | New object with everything except the listed keys |

- `keys` is an array of strings, symbols, or numbers (numbers become strings).
- The copy is shallow: nested objects are shared with the original, not cloned.
- Only own enumerable properties are copied (string and symbol keys). Inherited properties are ignored.
- The result is always a plain object, even if the source was a class instance.
- Safe with keys like `"__proto__"`: they become ordinary own properties and never change a prototype.
- Errors: `TypeError` if `object` is not an object or `keys` is not an array of valid keys.
- For paths like `"a.b.c"`, see the planned `object-path` module.

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

- MDN Web Docs. Object.defineProperty(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
- MDN Web Docs. Reflect.ownKeys(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys
- MDN Web Docs. Object.prototype.propertyIsEnumerable(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable
