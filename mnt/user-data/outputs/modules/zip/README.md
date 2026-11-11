# zip

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Combines several arrays element by element into an array of tuples. `zip` stops at the shortest array, `zipLongest` continues to the longest (filling gaps with `undefined`), and `unzip` reverses the operation.

## Usage

```js
import { zip, zipLongest, unzip } from "./zip.js";

zip([1, 2, 3], ["a", "b", "c"]);
// [[1, "a"], [2, "b"], [3, "c"]]

zip([1, 2, 3], ["a", "b"]);
// [[1, "a"], [2, "b"]] (stops at the shortest)

zipLongest([1, 2, 3], ["a", "b"]);
// [[1, "a"], [2, "b"], [3, undefined]]

unzip([[1, "a"], [2, "b"]]);
// [[1, 2], ["a", "b"]]

// Handy for looping over two lists together
for (const [name, score] of zip(["Mei", "Sam"], [90, 85])) {
  console.log(`${name}: ${score}`);
}
```

## API

| Function | Result |
|----------|--------|
| `zip(...arrays)` | Tuples up to the length of the shortest array |
| `zipLongest(...arrays)` | Tuples up to the length of the longest array, gaps are `undefined` |
| `unzip(tuples)` | Splits an array of tuples back into separate arrays |

- Any number of arrays can be zipped. With no arguments, `zip` and `zipLongest` return `[]`.
- Inputs are not changed. Tuples are new arrays.
- Empty slots in sparse arrays become `undefined`.
- Errors: `TypeError` if an argument is not an array (for `unzip`, if the input or any tuple is not an array).

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

- Python Software Foundation. zip() (built-in functions).. https://docs.python.org/3/library/functions.html#zip
- Python Software Foundation. itertools.zip_longest.. https://docs.python.org/3/library/itertools.html#itertools.zip_longest
- MDN Web Docs. Array.from(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
