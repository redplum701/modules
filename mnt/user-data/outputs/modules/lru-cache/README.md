# lru-cache

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A least-recently-used (LRU) cache: a key-value store with a size limit that drops the item that has gone longest without being used. It has an optional expiry time per item, an eviction callback, and constant-time get, set, and delete. It is built on the insertion order of a `Map`.

## Usage

```js
import { LruCache } from "./lru-cache.js";

const cache = new LruCache({ maxSize: 2 });

cache.set("a", 1);
cache.set("b", 2);
cache.get("a");          // 1  (a was just used, so b is now the oldest)
cache.set("c", 3);       // the cache is full: b is dropped
cache.has("b");          // false
cache.keys();            // ["c", "a"]  (most recently used first)

cache.peek("a");         // 1 (looks without marking a as used)

// Items that expire
const sessions = new LruCache({ maxSize: 1000, ttl: 60_000 });   // one minute
sessions.set("user:1", { name: "Mei" });
sessions.set("user:2", { name: "Sam" }, { ttl: 5_000 });         // this one: 5 seconds

// Know what is dropped
const withCallback = new LruCache({
  maxSize: 100,
  onEvict: (key, value, reason) => console.log(key, reason),     // "capacity" or "expired"
});

cache.delete("a");       // true
cache.clear();
```

## API

`new LruCache({ maxSize, ttl?, onEvict? })`

| Option | Default | Description |
|--------|---------|-------------|
| `maxSize` | — (required) | Most items to keep (a positive integer) |
| `ttl` | `Infinity` | Lifetime in milliseconds, counted from when the item was set |
| `onEvict` | — | `(key, value, reason) => void`, with `reason` `"capacity"` or `"expired"` |

| Member | Marks the key as used? | Description |
|--------|------------------------|-------------|
| `get(key)` | yes | The value, or `undefined` if missing or expired |
| `peek(key)` | no | The value, without changing the order |
| `has(key)` | no | `true` if stored and not expired |
| `set(key, value, { ttl }?)` | yes | Store. Drops the least recently used item if full. Returns the cache |
| `delete(key)` | — | Remove. `true` if it was stored |
| `clear()` | — | Remove everything |
| `purgeExpired()` | — | Remove expired items now. Returns how many |
| `keys()`, `values()`, `entries()`, `[Symbol.iterator]` | no | Most recently used **first**. Expired items are skipped |
| `size`, `maxSize` | — | Read-only properties |

- **Constant time:** a `Map` remembers insertion order, so the least recently used key is always the first one. On each use, the key is deleted and added again, which moves it to the end.
- **Keys** are compared like `Map` keys (`1` and `"1"` differ, objects by reference). Values can be anything, including `undefined`. Use `has` to tell a missing key from a stored `undefined`.
- **Expiry is lazy:** an expired item is noticed when you touch it (`get`, `peek`, `has`) or call `purgeExpired()`. `size` can include expired items until then.
- `onEvict` is **not** called when you `delete`, `clear`, or replace a value with `set`.
- A key that is set again counts as used and gets a fresh `ttl`.
- For caching function results, see `memoize` (which has its own `maxSize` and `ttl`).
- Errors: `RangeError` for a `maxSize` that is not a positive integer, or a `ttl` that is not a positive number or `Infinity`. `TypeError` for missing options or an `onEvict` that is not a function.

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

- Wikipedia. Cache replacement policies: Least recently used (LRU).. https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)
- MDN Web Docs. Map (iteration in insertion order). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- Isaacs. node-lru-cache (a full-featured library, for comparison).. https://github.com/isaacs/node-lru-cache
- MDN Web Docs. Private elements (class private fields). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
