# sentence-paragraph-count

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Counts sentences and paragraphs in text. Sentences are found with `Intl.Segmenter` (Unicode sentence rules), which handles English punctuation and Japanese punctuation such as `。` alike. Paragraphs can be separated by blank lines (typical for English) or by single line breaks (typical for Japanese).

## Usage

```js
import { countSentences, countParagraphs } from "./sentence-paragraph-count.js";

countSentences("Hello world. How are you? Fine!");  // 3
countSentences("こんにちは。元気ですか？はい。", { locale: "ja" }); // 3
countSentences("3.14 is pi.");                      // 1
countSentences("   ");                              // 0

const essay = "First paragraph.\nStill the first.\n\nSecond paragraph.";
countParagraphs(essay);                             // 2 (blank-line mode)
countParagraphs(essay, { by: "line" });             // 3 (every non-empty line)
```

## API

| Function | Result |
|----------|--------|
| `countSentences(text, options?)` | Number of sentences |
| `countParagraphs(text, options?)` | Number of paragraphs |

| Option | Applies to | Description |
|--------|-----------|-------------|
| `locale` | `countSentences` | Language tag such as `"en"` or `"ja"` |
| `by` | `countParagraphs` | `"blank-line"` (default): blank lines separate paragraphs. `"line"`: every non-empty line is a paragraph |

- Whitespace-only and empty text give `0`.
- Sentence detection follows the Unicode rules and is not perfect. `"Dr. Smith went home."` counts as 2 and `"Hello... World"` counts as 2. Text with abbreviations may need manual checking.
- Lines are split on `\n`, `\r\n`, `\r`, and the Unicode line and paragraph separators.
- `countSentences` needs `Intl.Segmenter` (Node.js 16+ and all current browsers).
- Errors: `TypeError` if `text` is not a string, `RangeError` for an invalid `locale` or `by`.

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

- Unicode Consortium. Unicode Standard Annex #29, Section 5: Sentence Boundaries.. https://unicode.org/reports/tr29/#Sentence_Boundaries
- MDN Web Docs. Intl.Segmenter. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- MDN Web Docs. Regular expressions. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
