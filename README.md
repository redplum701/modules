# character-counter

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Basic text statistics for writers: character counts (by user-perceived character, so an emoji counts once), conversion to *genkou-youshi* (Japanese manuscript paper) sheets, and an estimated reading time that handles Japanese and English together.

## Usage

```js
import { countCharacters, manuscriptSheets, estimateReadingTime } from "./character-counter.js";

countCharacters("あ い\nう");
// { characters: 5, charactersWithoutWhitespace: 3, lines: 2 }

// 400-character manuscript paper (20 x 20)
manuscriptSheets("あ".repeat(401));
// { characters: 401, columns: 20, rows: 20, linesUsed: 21,
//   sheets: 1.05, sheetsRoundedUp: 2 }

manuscriptSheets("あ\n\nい");   // 3 rows: a blank line takes one row
manuscriptSheets(text, { columns: 40, rows: 30 }); // other paper sizes

estimateReadingTime("あ".repeat(500));
// { minutes: 1, seconds: 60, cjkCharacters: 500, words: 0 }

estimateReadingTime("Hello world", { wordsPerMinute: 200 });
// { minutes: 0.01, seconds: 1, cjkCharacters: 0, words: 2 }
```

## API

| Function | Result |
|----------|--------|
| `countCharacters(text)` | `{ characters, charactersWithoutWhitespace, lines }` |
| `manuscriptSheets(text, options?)` | `{ characters, columns, rows, linesUsed, sheets, sheetsRoundedUp }` |
| `estimateReadingTime(text, options?)` | `{ minutes, seconds, cjkCharacters, words }` |

| Option | Function | Default | Description |
|--------|----------|---------|-------------|
| `columns` | `manuscriptSheets` | `20` | Characters per row |
| `rows` | `manuscriptSheets` | `20` | Rows per sheet (20 × 20 = 400 characters) |
| `charsPerMinute` | `estimateReadingTime` | `500` | Reading speed for Han, Hiragana, Katakana, and Hangul letters |
| `wordsPerMinute` | `estimateReadingTime` | `238` | Reading speed for other words |

- Characters are grapheme clusters. Line breaks count in `characters` but not in `charactersWithoutWhitespace`.
- Manuscript layout: each line starts a new row, a blank line uses one row, and long lines wrap every `columns` characters. Kinsoku rules (see the planned `kinsoku-line-breaker`) and paragraph indents are not applied, so real sheets may differ slightly.
- Reading speeds are rules of thumb. 238 words per minute is the average silent reading rate for English non-fiction (Brysbaert, 2019). 500 characters per minute for Japanese is a common estimate, not a measured standard. Change them to suit your readers.
- Needs `Intl.Segmenter` (Node.js 16+ and all current browsers).
- Errors: `TypeError` if `text` is not a string, `RangeError` for invalid options.

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

- MDN Web Docs. Intl.Segmenter. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.. https://unicode.org/reports/tr29/
- Brysbaert, M. How many words do we read per minute? A review and meta-analysis of reading rate. Journal of Memory and Language, 109 (2019).. https://doi.org/10.1016/j.jml.2019.104047
- MDN Web Docs. Unicode character class escape. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape
