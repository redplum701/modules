# query-string

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Parses and builds URL query strings, including repeated keys, arrays (`a[]=1&a[]=2` and `a[0]=1`), and nested objects (`a[b][c]=1`). It is safe against prototype pollution (`__proto__`, `constructor`), and it reads back exactly what it writes for strings, arrays, and nested objects.

## Usage

```js
import { parseQuery, stringifyQuery } from "./query-string.js";

parseQuery("?q=hello+world&page=2");
// { q: "hello world", page: "2" }

parseQuery("tag=a&tag=b");               // { tag: ["a", "b"] }
parseQuery("tag[]=a");                   // { tag: ["a"] }
parseQuery("ids[0]=7&ids[1]=9");         // { ids: ["7", "9"] }
parseQuery("user[name]=Mei&user[address][city]=Kobe");
// { user: { name: "Mei", address: { city: "Kobe" } } }
parseQuery("q=%E3%81%82");               // { q: "あ" }

stringifyQuery({ q: "hello world", page: 2 });
// "q=hello%20world&page=2"

stringifyQuery({ tag: ["a", "b"] });                         // "tag[]=a&tag[]=b"
stringifyQuery({ tag: ["a", "b"] }, { arrayFormat: "repeat" }); // "tag=a&tag=b"
stringifyQuery({ user: { name: "Mei" } });                   // "user[name]=Mei"
stringifyQuery({ q: "a b" }, { spaceAsPlus: true, addQueryPrefix: true }); // "?q=a+b"

// Round trip
parseQuery(stringifyQuery({ a: ["x", { b: "y" }] }));        // { a: ["x", { b: "y" }] }
```

## API

**`parseQuery(query, options?)`**

| Input | Result |
|-------|--------|
| `a=1&b=2` | `{ a: "1", b: "2" }` |
| `a=1&a=2` | `{ a: ["1", "2"] }` |
| `a[]=1&a[]=2` | `{ a: ["1", "2"] }` (`a[]=1` alone gives `{ a: ["1"] }`) |
| `a[0]=x&a[1]=y` | `{ a: ["x", "y"] }` |
| `a[b][c]=1` | `{ a: { b: { c: "1" } } }` |
| `flag` | `{ flag: "" }` |

| Option | Default | Description |
|--------|---------|-------------|
| `depth` | `10` | Most bracket levels to read. A key nested deeper is used as one plain key |

- Values are always strings. `+` becomes a space. `%XX` escapes are decoded in keys and values, so `a%5Bb%5D=1` works like `a[b]=1`. A broken escape is left as it is.
- Numeric keys `0, 1, … n-1` (up to 1,000, in order) become arrays. Other numeric keys stay object keys.
- Empty keys (`=x`, `&&`) are skipped. Do not pass a `#fragment`.
- If a later value needs a different shape than an earlier one at the same key, the later one wins (except plain values and arrays, which are collected into one array).
- **Safe keys:** `__proto__`, `constructor`, and `prototype` are stored as ordinary properties. They never change a prototype.

**`stringifyQuery(object, options?)`**

| Option | Default | Description |
|--------|---------|-------------|
| `arrayFormat` | `"brackets"` | `"brackets"` → `a[]=1&a[]=2`, `"repeat"` → `a=1&a=2`, `"index"` → `a[0]=1&a[1]=2` |
| `skipNull` | `false` | Leave out `null` values instead of writing `key=` |
| `sort` | `false` | Sort object keys |
| `addQueryPrefix` | `false` | Start with `?` (only when there is output) |
| `spaceAsPlus` | `false` | Write spaces as `+` instead of `%20` |

- Values: strings, numbers, booleans, BigInts, `Date` (ISO string), `null` (empty value), arrays, and nested plain objects. `undefined` is skipped. Empty arrays and objects write nothing.
- Arrays that contain objects or arrays always use the index format, so they read back correctly.
- The `"repeat"` format cannot tell a one-item array from a plain string when read back. Use `"brackets"` if you need an exact round trip.
- Brackets are written as plain `[` and `]` for readability.
- Errors: `TypeError` for non-plain-object input, functions, symbols, or circular references. `RangeError` for keys containing `[` or `]`, non-finite numbers, invalid dates, or an unknown `arrayFormat`.
- For a plain flat query, the built-in `URLSearchParams` also works. This module adds arrays and nesting.

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

- WHATWG. URL Standard: application/x-www-form-urlencoded.. https://url.spec.whatwg.org/#application/x-www-form-urlencoded
- Berners-Lee, T., Fielding, R., and Masinter, L. RFC 3986: Uniform Resource Identifier (URI): Generic Syntax. IETF, 2005.. https://www.rfc-editor.org/rfc/rfc3986
- MDN Web Docs. URLSearchParams. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
- MDN Web Docs. encodeURIComponent(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
- Harb, J. qs (a widely used query string library, for comparison).. https://github.com/ljharb/qs
