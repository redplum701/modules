# priority-queue

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A priority queue built on a binary heap: add items in any order and always take out the one that comes first. Adding and removing take O(log n), and reading the next item takes O(1). Items with equal priority come out in the order they were added. It accepts any comparison, so it works as a min-heap, a max-heap, or by any key.

## Usage

```js
import { PriorityQueue } from "./priority-queue.js";

// Smallest first (the default)
const numbers = new PriorityQueue();
numbers.push(5); numbers.push(1); numbers.push(3);
numbers.peek();           // 1
numbers.pop();            // 1
numbers.pop();            // 3
numbers.size;             // 1

// Largest first
const max = new PriorityQueue({ compare: (a, b) => b - a });

// By any key
const tasks = new PriorityQueue({ compare: (a, b) => a.due - b.due });
tasks.push({ name: "write report", due: 3 });
tasks.push({ name: "reply to email", due: 1 });
tasks.pop().name;         // "reply to email"

// Ties come out in the order they were added
const ties = new PriorityQueue({ compare: (a, b) => a.level - b.level });
ties.push({ id: "a", level: 1 });
ties.push({ id: "b", level: 1 });
ties.pop().id;            // "a"

// Build from a list in linear time; read everything in order
const queue = PriorityQueue.from([9, 4, 7, 1]);
queue.toSortedArray();    // [1, 4, 7, 9] (the queue is not changed)
for (const n of queue.drain()) console.log(n);   // 1, 4, 7, 9 (the queue ends up empty)
```

## API

`new PriorityQueue(options?)`

| Option | Default | Description |
|--------|---------|-------------|
| `compare` | smaller first | `(a, b) => number`. Negative: `a` comes out before `b`. Positive: after. `0`: a tie. The same rule as `Array.prototype.sort` |
| `stable` | `true` | On a tie, the item added first comes out first. `false` skips the tie-break |
| `items` | — | Items to start with (heap built in O(n)) |

| Member | Cost | Description |
|--------|------|-------------|
| `push(value)` | O(log n) | Add an item. Returns the new size |
| `pushAll(items)` | O(k log n) | Add several |
| `pop()` | O(log n) | Remove and return the first item (`undefined` if empty) |
| `peek()` | O(1) | Read the first item |
| `toSortedArray()` | O(n log n) | All items in order, without changing the queue |
| `drain()` | O(log n) each | Generator that pops until empty |
| `clear()` | O(1) | Remove everything |
| `size`, `isEmpty` | O(1) | Read-only properties |
| `PriorityQueue.from(items, options?)` | O(n) | Build from an iterable |

- **Min-heap by default.** For the largest first, use `compare: (a, b) => b - a`. Strings and other values that work with `<` and `>` need no `compare`.
- **Stable ties:** a plain binary heap does not keep equal items in order. This queue numbers each item as it is added and uses that number to break ties, so equal items come out first in, first out.
- **Typical uses:** task schedulers, Dijkstra's and A* search (store `{ node, distance }`), merging sorted lists, "top k" selection.
- Changing the priority of an item already in the queue is not supported. Push a new entry and ignore the old one when it comes out.
- Errors: `TypeError` for a `compare` that is not a function, a `stable` that is not a boolean, or items that are not iterable.

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

- Wikipedia. Binary heap.. https://en.wikipedia.org/wiki/Binary_heap
- Wikipedia. Priority queue.. https://en.wikipedia.org/wiki/Priority_queue
- Floyd, R. W. Algorithm 245: Treesort. Communications of the ACM, 7(12), 1964 (building a heap in linear time).. https://doi.org/10.1145/355588.365103
- MDN Web Docs. Private elements (class private fields). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
