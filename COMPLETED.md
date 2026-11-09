# Completed Modules

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Tracks which modules in [`README.md`](./README.md) are finished. Modules are built from the bottom of the list (#100, easiest) up to #1 (hardest), a few at a time. Update this file every time modules are completed.

## Progress

**37 / 100 completed**

- **Next up:** #64 `postal-code-formatter`, #63 `url-parser`, #62 `email-validator`, #61 `luhn-check`, #60 `isbn-validator`
- **Build order:** #100 → #1

## Completed

| # | Module | Completed | Notes |
|---|--------|-----------|-------|
| 100 | [`hex-rgb`](./hex-rgb/) | 2026-11-09 | HEX ⇔ RGB with alpha support (3, 4, 6, 8 digits) |
| 99 | [`case-converter`](./case-converter/) | 2026-11-09 | camel / Pascal / snake / kebab / CONSTANT / Title case |
| 98 | [`pad`](./pad/) | 2026-11-09 | Left, right, and center padding, plus zero-padding with BigInt |
| 97 | [`leap-year`](./leap-year/) | 2026-11-09 | Leap year check, days in month, last day of month |
| 96 | [`eto`](./eto/) | 2026-11-09 | Zodiac animal and sexagenary cycle name for a year |
| 95 | [`number-format`](./number-format/) | 2026-11-09 | Thousands separators for numbers, BigInt, and strings |
| 94 | [`rounding`](./rounding/) | 2026-11-09 | 8 rounding modes, including banker's rounding; exact decimal handling |
| 93 | [`is-prime`](./is-prime/) | 2026-11-09 | Deterministic Miller-Rabin primality test (number and BigInt) |
| 92 | [`gcd-lcm`](./gcd-lcm/) | 2026-11-09 | GCD and LCM for any number of integers (BigInt supported) |
| 91 | [`clamp-lerp`](./clamp-lerp/) | 2026-11-09 | clamp, lerp, inverseLerp, remap |
| 90 | [`random-range`](./random-range/) | 2026-11-09 | randomInt and randomFloat with a pluggable random source |
| 89 | [`once`](./once/) | 2026-11-09 | Run a function once; remembers result or error; reset() |
| 88 | [`sleep`](./sleep/) | 2026-11-09 | Promise delay with AbortSignal cancellation |
| 87 | [`is-empty`](./is-empty/) | 2026-11-09 | Empty check for null, strings, arrays, Map, Set, plain objects |
| 86 | [`pick-omit`](./pick-omit/) | 2026-11-09 | pick and omit for objects (shallow, prototype-safe) |
| 85 | [`sample`](./sample/) | 2026-11-09 | One random element with equal probability; pluggable random source |
| 84 | [`range`](./range/) | 2026-11-09 | Number sequences with start, end, step; clean decimal steps |
| 83 | [`rotate`](./rotate/) | 2026-11-09 | Rotate an array left or right by n positions |
| 82 | [`partition`](./partition/) | 2026-11-09 | Split an array into passing and failing items |
| 81 | [`set-operations`](./set-operations/) | 2026-11-09 | union, intersection, difference, symmetricDifference |
| 80 | [`zip`](./zip/) | 2026-11-09 | zip, zipLongest, unzip |
| 79 | [`flatten`](./flatten/) | 2026-11-09 | Flatten nested arrays to a depth; loop-based, detects cycles |
| 78 | [`shuffle`](./shuffle/) | 2026-11-09 | Fisher-Yates shuffle (copy and in-place); pluggable random source |
| 77 | [`unique`](./unique/) | 2026-11-09 | Remove duplicates, keeping the first; optional key function |
| 76 | [`chunk`](./chunk/) | 2026-11-09 | Split an array into chunks of a given size |
| 75 | [`char-frequency`](./char-frequency/) | 2026-11-09 | Character counts by code point; most-common helper |
| 74 | [`palindrome-check`](./palindrome-check/) | 2026-11-09 | Palindrome check by grapheme; case, punctuation, accent options |
| 73 | [`reverse-string`](./reverse-string/) | 2026-11-09 | Grapheme-safe string reversal |
| 72 | [`truncate`](./truncate/) | 2026-11-09 | Grapheme-safe truncation with ellipsis counted in the limit |
| 71 | [`sentence-paragraph-count`](./sentence-paragraph-count/) | 2026-11-09 | Sentence count (Intl.Segmenter) and paragraph count (blank-line or line mode) |
| 70 | [`grapheme-count`](./grapheme-count/) | 2026-11-09 | Grapheme count plus code point, UTF-16, and UTF-8 lengths |
| 69 | [`character-counter`](./character-counter/) | 2026-11-09 | Character counts, manuscript-paper (genkou-youshi) sheets, reading-time estimate |
| 68 | [`halfwidth-kana`](./halfwidth-kana/) | 2026-11-09 | Half-width ⇔ full-width katakana with voiced/semi-voiced marks |
| 67 | [`hiragana-katakana`](./hiragana-katakana/) | 2026-11-09 | Hiragana ⇔ katakana; isHiragana / isKatakana |
| 66 | [`fullwidth-halfwidth`](./fullwidth-halfwidth/) | 2026-11-09 | Full-width ⇔ half-width letters, digits, symbols, spaces (per-group options) |
| 65 | [`phone-number-formatter`](./phone-number-formatter/) | 2026-11-09 | Japanese phone numbers; MIC area code list (2026-03-01); +81 support. Known gap: area code 04 |
| 42 | `base-converter` | Before 2026-11-09 | First version done as the starting point. Full version (fractions, negatives, BigInt) is still planned |

## Update Checklist

When modules are finished:

1. Add rows to the **Completed** table above.
2. Update the **Progress** count and **Next up**.
3. Change `Updated` in this file's header.
4. Confirm each module directory has its `.js` file and `README.md`.
5. Update `modules/README.md` only at the very end (when all modules are done).

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

- MDN Web Docs. *JavaScript Reference*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/JavaScript
- Ecma International. *ECMAScript Language Specification*. https://tc39.es/ecma262/
