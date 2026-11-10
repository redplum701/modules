# object-path

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Reads and writes values inside nested objects and arrays by a path such as `"a.b[0].c"`: `get`, `has`, `set`, and `unset`, plus `parsePath` and `stringifyPath`. Only the object's own properties are followed, and writes create real own properties, so a path like `"__proto__.polluted"` cannot change any prototype.

## Usage

```js
import { get, has, set, unset, parsePath, stringifyPath } from "./object-path.js";

const data = { user: { name: "Mei", tags: ["js", "css"], "a.b": 1 } };

get(data, "user.name");              // "Mei"
get(data, "user.tags[1]");           // "css"
get(data, 'user["a.b"]');            // 1 (quoted key with a dot)
get(data, "user.age", 20);           // 20 (default)
get(data, ["user", "tags", 0]);      // "js" (array form)

has(data, "user.tags[5]");           // false

set(data, "user.address.city", "Kobe");   // creates user.address
set(data, "scores[2]", 90);                // creates an array: [ <2 empty>, 90 ]
unset(data, "user.name");                  // true

parsePath('a[0]["b.c"].d');          // ["a", "0", "b.c", "d"]
stringifyPath(["a", 0, "b.c", "d"]); // 'a[0]["b.c"].d'

// Safe against prototype pollution
set({}, "__proto__.polluted", true);
({}).polluted;                       // undefined
```

## API

| Function | Result |
|----------|--------|
| `get(object, path, defaultValue?)` | The value, or `defaultValue` if the path is missing or the value is `undefined` |
| `has(object, path)` | `true` if the path exists (even if the value is `undefined` or `null`) |
| `set(object, path, value)` | Writes the value, creating missing steps. Changes `object` in place and returns it |
| `unset(object, path)` | Deletes the value. `true` if something was deleted |
| `parsePath(path)` | List of keys (as strings) |
| `stringifyPath(keys)` | A path string that reads back as the same keys |

**Path syntax:** `a.b.c`, `a[0].b`, `a["b.c"]` (any characters in a double-quoted key; JSON escapes), `a['b']` (only `\'` and `\\` are escapes). A path can also be an array such as `["a", 0, "b"]`. Brackets hold either an index (`[0]`) or a quoted key. Empty paths, `a..b`, `a.`, `a[`, and `a[b]` (unquoted names) are a `SyntaxError`.

**Safe by design**
- Reads follow only **own** properties. `get({}, "constructor")` and `get([], "map")` are `undefined`, not the inherited function.
- Writes create real own properties with `Object.defineProperty`, so `set(obj, "__proto__.x", 1)` makes a plain property named `__proto__` and never changes `Object.prototype`.

**Notes**
- `set` makes a missing step an array if the next key is an index (`"0"`, `"1"`…), otherwise an object. A step holding a non-object (a string, a number) is replaced.
- `unset` on an array item leaves an empty slot. It does not shift the other items.
- A path that goes through `null` or `undefined` simply is not found (no error).
- Errors: `TypeError` for a path that is not a string or array (or has an unsupported key type), for `set` on a non-object, an empty path array, or a frozen object. `SyntaxError` for a malformed path string.

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

- Lodash. _.get and _.set.. https://lodash.com/docs/#get
- MDN Web Docs. Object.hasOwn(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
- MDN Web Docs. Object.defineProperty(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
- OWASP. Prototype Pollution Prevention Cheat Sheet.. https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html
