# union-find

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Union-Find (disjoint-set union) keeps track of which items are in the same group while groups are merged. `UnionFind` works with the items `0` to `n-1`, and `KeyedUnionFind` works with any keys (strings, objects...). It uses path halving and union by size, so each operation takes nearly constant time. Typical uses: connected components, Kruskal's minimum spanning tree, and "are these two in the same group?" questions.

## Usage

```js
import { UnionFind, KeyedUnionFind } from "./union-find.js";

const groups = new UnionFind(6);      // items 0..5, each alone
groups.union(0, 1);                   // true (merged)
groups.union(1, 2);                   // true
groups.union(0, 2);                   // false (already together)

groups.connected(0, 2);               // true
groups.connected(0, 5);               // false
groups.count;                         // 4 groups: {0,1,2} {3} {4} {5}
groups.componentSize(1);              // 3
groups.groups();                      // [[0, 1, 2], [3], [4], [5]]

groups.add();                         // 6 (a new item, alone)

// Any kind of key
const friends = new KeyedUnionFind();
friends.union("Mei", "Sam");
friends.union("Sam", "Ana");
friends.connected("Mei", "Ana");      // true
friends.connected("Mei", "Ken");      // false (Ken was never added)
friends.groups();                     // [["Mei", "Sam", "Ana"]]
```

## API

**`new UnionFind(length = 0)`** (items are the integers `0` to `length − 1`)

| Member | Description |
|--------|-------------|
| `add()` | Add one new item alone. Returns its number |
| `find(item)` | The representative item of its group |
| `union(a, b)` | Merge two groups. `true` if they were different |
| `connected(a, b)` | `true` if in the same group |
| `componentSize(item)` | How many items are in its group |
| `groups()` | All groups as arrays (items ascending, groups ordered by smallest item) |
| `length`, `count` | Number of items, number of groups |

**`new KeyedUnionFind()`** works the same way with any keys (compared like `Map` keys): `add(key)`, `has(key)`, `find(key)`, `union(a, b)` (adds missing keys), `connected(a, b)` (`false` if either key is unknown), `componentSize(key)`, `groups()` (keys in the order they were added), `length`, and `count`.

- **Fast:** path halving and union by size make `find` and `union` nearly constant time (the inverse Ackermann function) for any realistic size.
- **Memory:** items are stored in typed arrays (`Int32Array`), up to 50,000,000 items.
- `find` returns a representative that can change after a merge. Compare representatives only at the moment you ask.
- Groups can only be merged, not split. To split, build a new structure.
- Errors: `RangeError` for an item number that is not an integer from 0 to `length − 1`, a bad `length`, or an unknown key passed to `find` or `componentSize` in `KeyedUnionFind`.

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

- Wikipedia. Disjoint-set data structure.. https://en.wikipedia.org/wiki/Disjoint-set_data_structure
- Tarjan, R. E. Efficiency of a good but not linear set union algorithm. Journal of the ACM, 22(2), 1975.. https://doi.org/10.1145/321879.321884
- MDN Web Docs. Int32Array. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
- MDN Web Docs. Private elements (class private fields). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
