# unique

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Removes duplicates from an array, keeping the first occurrence of each item. An optional key function lets you compare items by a property or any computed value, such as an `id`.

## Usage

```js
import { unique } from "./unique.js";

unique([1, 2, 2, 3, 1]);              // [1, 2, 3]
unique([1, "1", NaN, NaN]);           // [1, "1", NaN]

const users = [
  { id: 1, name: "Mei" },
  { id: 2, name: "Sam" },
  { id: 1, name: "Mei (duplicate)" },
];
unique(users, (user) => user.id);
// [{ id: 1, name: "Mei" }, { id: 2, name: "Sam" }]

unique(["Apple", "apple", "BANANA"], (s) => s.toLowerCase());
// ["Apple", "BANANA"]
```

## API

`unique(array, getKey?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | Array | The array to clean |
| `getKey` | `(value, index, array) => any` | Optional. The value to compare instead of the item |

- Keeps the first occurrence of each item and the original order. Returns a new array.
- Comparison is SameValueZero (same as `Set`): `NaN` equals `NaN`, `0` equals `-0`, `1` differs from `"1"`.
- Objects are compared by reference unless you pass `getKey`.
- Empty slots in sparse arrays are skipped.
- Errors: `TypeError` if `array` is not an array or `getKey` is not a function.

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

- MDN Web Docs. Set. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
- MDN Web Docs. Equality comparisons and sameness. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
- MDN Web Docs. Array.prototype.forEach(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
