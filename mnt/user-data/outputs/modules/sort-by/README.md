# sort-by

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Sorts an array by one or more keys, with ascending or descending order per key, control over where empty values go, and a guaranteed stable result. It returns a new array. Strings compare by code unit by default, or with a locale if you ask, so results do not depend on the language settings of the machine.

## Usage

```js
import { sortBy } from "./sort-by.js";

const people = [
  { name: "Sam", age: 30, team: "B" },
  { name: "Mei", age: 25, team: "A" },
  { name: "Ana", age: 30, team: "A" },
  { name: "Ken", age: null, team: "B" },
];

sortBy(people, "age");                       // Mei(25), Sam(30), Ana(30), Ken(null last)
sortBy(people, (p) => p.name);               // Ana, Ken, Mei, Sam

// Several keys: team A before B, then oldest first
sortBy(people, ["team", { by: "age", order: "desc" }]);

// Put empty values first
sortBy(people, { by: "age", nulls: "first" });

// Natural order for strings with numbers
sortBy(["file10", "file2", "file1"], { by: (s) => s, numeric: true });
// ["file1", "file2", "file10"]

// Japanese and other locales
sortBy(["う", "あ", "い"], { by: (s) => s, locale: "ja" });

sortBy([3, 1, 2]);                           // [1, 2, 3] (the items themselves)
```

## API

`sortBy(array, criteria?)` returns a new sorted array. `criteria` is one criterion or an array of them.

| Criterion form | Meaning |
|----------------|---------|
| function `(item) => value` | Sort by the returned value |
| string `"age"` | Sort by that property |
| object `{ by, order, nulls, locale, numeric }` | Full control (below) |

| Object field | Default | Description |
|--------------|---------|-------------|
| `by` | — | A function or a property name (required) |
| `order` | `"asc"` | `"asc"` or `"desc"` |
| `nulls` | `"last"` | `"first"` or `"last"`: where `null`, `undefined`, `NaN`, and invalid `Date`s go. Holds for **both** orders |
| `locale` | — | A language tag (`"en"`, `"ja"`) to compare strings with `Intl.Collator` |
| `numeric` | `false` | Compare digit runs in strings as numbers (`"file2"` before `"file10"`) |

- **Stable:** items that tie on every criterion keep their original order. This is guaranteed by remembering each item's position, not just by the engine.
- **Several criteria:** the first decides, the later ones break ties.
- **Each key function runs once per item**, not once per comparison.
- **Compared as:** numbers and BigInts by value (mixed is fine), strings by code unit (so `"B"` comes before `"a"`; use `locale` for dictionary order), `Date`s by time, booleans `false` before `true`. Mixed kinds are ordered boolean < number < string < Date < other. Objects and functions are not orderable and count as equal.
- Without `locale` or `numeric`, results do not depend on the machine's language settings.
- For file-name style ordering of whole lists, see the planned `natural-sort` module.
- Errors: `TypeError` for a non-array or a malformed criterion, `RangeError` for an unknown `order` or `nulls`, or an invalid `locale`.

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

- Lodash. _.sortBy and _.orderBy.. https://lodash.com/docs/#orderBy
- MDN Web Docs. Array.prototype.sort(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
- MDN Web Docs. Intl.Collator. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
- Wikipedia. Schwartzian transform (decorate, sort, undecorate).. https://en.wikipedia.org/wiki/Schwartzian_transform
