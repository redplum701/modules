# deep-merge

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Merges objects recursively into a new object. Plain objects are merged key by key, arrays can be replaced, concatenated, united, or merged by index, and the result shares no objects or arrays with the inputs. It is safe against prototype pollution, and circular input is rejected with a clear error.

## Usage

```js
import { deepMerge, deepMergeAll } from "./deep-merge.js";

const defaults = { theme: "light", ui: { sidebar: true, width: 300 }, tags: ["a"] };
const saved = { ui: { width: 420 }, tags: ["b"], theme: undefined };

deepMerge(defaults, saved);
// { theme: "light", ui: { sidebar: true, width: 420 }, tags: ["b"] }

deepMerge(defaults, saved, { arrays: "concat" });   // tags: ["a", "b"]
deepMerge({ t: [1, 2] }, { t: [2, 3] }, { arrays: "union" });   // t: [1, 2, 3]
deepMerge({ l: [{ a: 1 }, 2] }, { l: [{ b: 2 }] }, { arrays: "index" });
// l: [{ a: 1, b: 2 }, 2]

deepMerge({ a: 1 }, { a: undefined });                          // { a: 1 }
deepMerge({ a: 1 }, { a: undefined }, { skipUndefined: false });// { a: undefined }
deepMerge({ a: 1 }, { a: null });                               // { a: null }

deepMergeAll([{ a: 1 }, { b: 2 }, { a: 3 }]);                   // { a: 3, b: 2 }

// The inputs are never changed, and nothing is shared with them
const merged = deepMerge(defaults, {});
merged.ui === defaults.ui;                                       // false

// Prototype pollution does nothing
deepMerge({}, JSON.parse('{"__proto__": {"polluted": true}}'));
({}).polluted;                                                   // undefined
```

## API

| Function | Result |
|----------|--------|
| `deepMerge(target, source, options?)` | A new merged value |
| `deepMergeAll(values, options?)` | Merges the list left to right. `[]` gives `{}` |

| Option | Default | Description |
|--------|---------|-------------|
| `arrays` | `"replace"` | `"replace"`: source replaces target. `"concat"`: target items then source items. `"union"`: concat without repeats (like `Set`, so objects by reference). `"index"`: merge items at the same position, keep the extra items of the longer array |
| `skipUndefined` | `true` | Ignore `undefined` source values. With `false`, `undefined` overwrites |

**Rules**
- Two plain objects are merged key by key, recursively. Two arrays follow `arrays`. For anything else, the source wins, including `null`, `0`, `""`, and `false`.
- **Nothing is changed and nothing is shared:** the result has new objects and arrays everywhere, even where only one side had a value. Only non-plain objects (`Date`, `Map`, class instances, functions) are kept as the same reference.
- Only own enumerable string keys are read. Symbol keys are ignored.
- **Safe keys:** keys such as `__proto__` and `constructor` become ordinary own properties of the new object. They never change a prototype.
- A circular reference in either input throws `TypeError`.
- Errors: `TypeError` for circular input, a non-boolean `skipUndefined`, or a non-array to `deepMergeAll`. `RangeError` for an unknown `arrays` value.

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

- Lodash. _.merge.. https://lodash.com/docs/#merge
- MDN Web Docs. Object.keys(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
- MDN Web Docs. Object.defineProperty(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
- OWASP. Prototype Pollution Prevention Cheat Sheet.. https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html
