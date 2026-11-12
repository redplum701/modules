# levenshtein-distance

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

The edit distance between two strings: the fewest single-character insertions, deletions, and substitutions that turn one into the other. It also has the Damerau variant that counts swapping two neighboring characters as one edit, a similarity score from 0 to 1, and a closest-match search. It works on whole characters, so an emoji counts as one.

## Usage

```js
import { levenshtein, damerauLevenshtein, similarity, closestMatch } from "./levenshtein-distance.js";

levenshtein("kitten", "sitting");          // 3
levenshtein("", "abc");                    // 3
levenshtein("same", "same");               // 0
levenshtein("Hello", "hello", { ignoreCase: true });   // 0
levenshtein("😀a", "😀b");                  // 1 (an emoji is one character)

// Stop early when the strings are clearly too different
levenshtein("a long text ...", "another long text ...", { maxDistance: 2 });   // Infinity

damerauLevenshtein("ab", "ba");            // 1
levenshtein("ab", "ba");                   // 2

similarity("kitten", "sitting");           // 0.5714285714285714
similarity("", "");                        // 1

// Fix a mistyped word
closestMatch("recieve", ["receive", "relieve", "retrieve"]);
// { value: "receive", index: 0, distance: 2 }

closestMatch("xyz", ["abc", "def"], { maxDistance: 1 });   // null (nothing close enough)
closestMatch("recieve", ["receive"], { transpositions: true });   // distance 1
```

## API

| Function | Result |
|----------|--------|
| `levenshtein(a, b, options?)` | The edit distance (insertions, deletions, substitutions) |
| `damerauLevenshtein(a, b, options?)` | Also counts a swap of two neighbors as one edit (optimal string alignment) |
| `similarity(a, b, options?)` | `1 − distance / longerLength`, from 0 to 1. Two empty strings give `1` |
| `closestMatch(target, candidates, options?)` | `{ value, index, distance }` of the closest candidate, or `null` |

| Option | Default | Description |
|--------|---------|-------------|
| `maxDistance` | `Infinity` | Give up (return `Infinity`) once the distance is above this. Speeds up long strings |
| `ignoreCase` | `false` | Compare `"A"` and `"a"` as equal (uses `toLowerCase`) |
| `graphemes` | `false` | Compare user-perceived characters (needs `Intl.Segmenter`) instead of code points |
| `transpositions` | `false` | `similarity` and `closestMatch` only: use the Damerau distance |

- **Units:** strings are compared by code points, so an emoji or a rare kanji is one character, not two. With `graphemes: true`, `e` plus a combining accent, or a family emoji, is also one character.
- **Speed:** it uses two rows of memory (three for the Damerau variant) and drops the equal beginning and end first. With `maxDistance` it stops as soon as no path can stay under the limit.
- **Damerau:** this is the "optimal string alignment" form. It does not allow editing a swapped pair again (`"ca"` to `"abc"` is 3, not 2), so it is not a true metric, but it is the form most people mean.
- In `closestMatch`, the first candidate wins when two are equally close.
- For file-name style or Japanese reading-aware matching, see the planned `fuzzy-match`.
- Errors: `TypeError` for non-string arguments (or a non-array `candidates`), `RangeError` for an invalid `maxDistance`.

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

- Wikipedia. Levenshtein distance.. https://en.wikipedia.org/wiki/Levenshtein_distance
- Wikipedia. Damerau-Levenshtein distance (optimal string alignment).. https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
- Wikipedia. Wagner-Fischer algorithm.. https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm
- MDN Web Docs. Intl.Segmenter. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
