# memoize

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Remembers the results of a function, so calling it again with the same arguments returns the stored result instead of running the function again. Cache keys are built from any arguments (objects are compared by content), and there are options for a size limit (the least recently used results are dropped), a time limit, and a custom key. Async functions work: a failed promise is not remembered.

## Usage

```js
import { memoize } from "./memoize.js";

let runs = 0;
const slowSquare = memoize((n) => { runs += 1; return n * n; });

slowSquare(4);  // 16 (runs the function)
slowSquare(4);  // 16 (from the cache)
runs;           // 1

// Objects are compared by content
const search = memoize((filters) => runQuery(filters));
search({ tag: "js", page: 1 });
search({ page: 1, tag: "js" });   // same key: cached

// Limits
const small = memoize(expensive, { maxSize: 100 });   // keep the 100 most recently used
const fresh = memoize(fetchRate, { ttl: 60_000 });    // forget after one minute

// Custom key
const getUser = memoize(loadUser, { resolver: (user) => user.id });

// Async: calls that overlap share one request; failures are not remembered
const getJson = memoize((url) => fetch(url).then((res) => res.json()));

getJson.has("/a");     // true or false
getJson.delete("/a");  // forget one
getJson.clear();       // forget all
getJson.size;          // number of stored results
```

## API

`memoize(fn, options?)` returns a function with the same arguments and result.

| Option | Default | Description |
|--------|---------|-------------|
| `resolver` | built-in | `(...args) => key`. Replaces the default key (any value; keys are compared like `Map` keys) |
| `maxSize` | `Infinity` | Most results to keep. When full, the least recently used one is dropped |
| `ttl` | `Infinity` | Milliseconds a result is kept |

| Member of the returned function | Description |
|---------------------------------|-------------|
| `clear()` | Forget everything |
| `delete(...args)` | Forget the result for these arguments. Returns `true` if there was one |
| `has(...args)` | `true` if a result for these arguments is stored and has not expired |
| `size` | Number of stored results (expired ones removed first) |

**Default keys** are built from all arguments, including how many there are (`f()` and `f(undefined)` differ):

| Argument | Compared by |
|----------|-------------|
| string, number, boolean, `null`, `undefined`, BigInt | Value and type (`1` ≠ `"1"`, `NaN` = `NaN`, `0` ≠ `-0`) |
| array, plain object | Content (object key order does not matter; symbol keys are ignored) |
| `Date`, `RegExp` | Content (time value, source and flags) |
| `Map`, `Set`, class instances, functions, symbols | Identity (the same object, not an equal one) |

- A circular argument throws `TypeError`. Pass a `resolver` for those.
- `this` is passed through but is not part of the key.
- **Errors** are not cached: the next call runs the function again.
- **Promises** are cached as soon as they are returned, so overlapping calls share one run. If the promise rejects, it is removed.
- `undefined` results are cached too.
- Mutating an object argument after the call changes what its key would be next time.
- Errors: `TypeError` if `fn` or `resolver` is not a function, `RangeError` for an invalid `maxSize` or `ttl`.

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

- Wikipedia. Memoization.. https://en.wikipedia.org/wiki/Memoization
- Wikipedia. Cache replacement policies: Least recently used (LRU).. https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)
- MDN Web Docs. Map. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- MDN Web Docs. WeakMap. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
