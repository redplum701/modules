# partition

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Splits an array into two arrays with a test function: the items that pass and the items that fail. The original order is kept in both, and the test runs only once per item (unlike calling `filter` twice).

## Usage

```js
import { partition } from "./partition.js";

const [even, odd] = partition([1, 2, 3, 4, 5, 6], (n) => n % 2 === 0);
// even: [2, 4, 6]
// odd:  [1, 3, 5]

const users = [
  { name: "Mei", active: true },
  { name: "Sam", active: false },
  { name: "Ana", active: true },
];
const [active, inactive] = partition(users, (user) => user.active);
// active:   Mei, Ana
// inactive: Sam

// The predicate also receives the index
const [firstTwo, rest] = partition(["a", "b", "c", "d"], (_, i) => i < 2);
// firstTwo: ["a", "b"], rest: ["c", "d"]
```

## API

`partition(array, predicate)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | Array | The array to split |
| `predicate` | `(value, index, array) => any` | Truthy result: item goes in the first array. Falsy: the second |

- Returns `[passed, failed]`, two new arrays. The original is not changed.
- Items keep their original order in both arrays.
- The predicate runs exactly once per item.
- Empty slots in sparse arrays are skipped (same as `filter`).
- Errors: `TypeError` if `array` is not an array or `predicate` is not a function.

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

- Rust Project. Iterator::partition.. https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.partition
- MDN Web Docs. Array.prototype.filter(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
- MDN Web Docs. Array.prototype.forEach(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
