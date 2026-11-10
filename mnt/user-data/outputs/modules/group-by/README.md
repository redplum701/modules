# group-by

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Groups the items of an array (or any iterable) by a key. `groupBy` returns a plain lookup object, and `groupByMap` returns a `Map` that keeps the original key types. They work like the standard `Object.groupBy` and `Map.groupBy`, but in older environments too.

## Usage

```js
import { groupBy, groupByMap } from "./group-by.js";

const people = [
  { name: "Mei", team: "A", age: 25 },
  { name: "Sam", team: "B", age: 30 },
  { name: "Ana", team: "A", age: 30 },
];

groupBy(people, "team");
// { A: [Mei, Ana], B: [Sam] }

groupBy(people, (p) => (p.age >= 30 ? "30+" : "under 30"));
// { "under 30": [Mei], "30+": [Sam, Ana] }

groupBy([1, 2, 3, 4, 5, 6], (n) => (n % 2 === 0 ? "even" : "odd"));
// { odd: [1, 3, 5], even: [2, 4, 6] }

// Map keeps key types and order
groupByMap([1, "1", 1], (x) => x);
// Map { 1 => [1, 1], "1" => ["1"] }

// The index is passed as the second argument
groupBy(["a", "b", "c", "d"], (_, i) => Math.floor(i / 2));
// { 0: ["a", "b"], 1: ["c", "d"] }
```

## API

| Function | Result |
|----------|--------|
| `groupBy(items, keySelector)` | An object of arrays (no prototype) |
| `groupByMap(items, keySelector)` | A `Map` of arrays |

`keySelector` is a function `(item, index) => key`, or a property name such as `"team"`. `items` can be an array or any iterable (a `Set`, a generator, a string).

- Items keep their original order inside each group.
- **`groupBy` keys** become strings (or stay symbols), like any object key, so `1` and `"1"` share a group. JavaScript lists integer-like keys (`"1"`, `"2"`) first, in numeric order.
- **`groupByMap` keys** keep their type and are compared like `Map` keys (`1` ≠ `"1"`, `NaN` = `NaN`). Groups appear in the order each key first showed up.
- **Safe keys:** the object from `groupBy` has no prototype (like `Object.groupBy`), so groups named `__proto__` or `constructor` are ordinary groups.
- Results match the standard `Object.groupBy` and `Map.groupBy` where those exist.
- Errors: `TypeError` if `items` is not iterable (including `null`), or `keySelector` is not a function or string.

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

- MDN Web Docs. Object.groupBy(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
- MDN Web Docs. Map.groupBy(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy
- TC39. Array grouping proposal.. https://github.com/tc39/proposal-array-grouping
- Lodash. _.groupBy.. https://lodash.com/docs/#groupBy
