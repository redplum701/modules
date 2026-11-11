# set-operations

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Set operations on arrays and other iterables: union, intersection, difference, and symmetric difference. Results are arrays without duplicates, in order of first appearance.

## Usage

```js
import { union, intersection, difference, symmetricDifference } from "./set-operations.js";

union([1, 2, 3], [3, 4, 5]);              // [1, 2, 3, 4, 5]
intersection([1, 2, 2, 3], [2, 3, 4]);    // [2, 3]
intersection([1, 2, 3], [2, 3], [3, 4]);  // [3]
difference([1, 2, 3, 4], [2], [4]);       // [1, 3]
symmetricDifference([1, 2, 3], [3, 4]);   // [1, 2, 4]

// Sets and other iterables work too
intersection(new Set(["a", "b"]), ["b", "c"]); // ["b"]
```

## API

| Function | Result |
|----------|--------|
| `union(...lists)` | Unique items in any list |
| `intersection(first, ...others)` | Unique items of `first` that are in every other list |
| `difference(first, ...others)` | Unique items of `first` that are in no other list |
| `symmetricDifference(a, b)` | Items in exactly one of the two lists (items only in `a`, then only in `b`) |

- Inputs can be arrays, `Set`s, or any iterable. Strings are rejected.
- Results are new arrays with no duplicates, in order of first appearance. Inputs are not changed.
- Items are compared the way `Set` compares them (SameValueZero): `NaN` equals `NaN`, objects are compared by reference, and `1` is different from `"1"`.
- Errors: `TypeError` if no list is given or an argument is not an iterable (or is a string).

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
- Wikipedia. Algebra of sets.. https://en.wikipedia.org/wiki/Algebra_of_sets
