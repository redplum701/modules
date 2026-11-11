# Completed Modules

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Tracks which modules in [`README.md`](./README.md) are finished. Modules are built from the bottom of the list (#100, easiest) up to #1 (hardest), a few at a time. Update this file every time modules are completed.

## Progress

**61 / 100 completed**

- **Next up:** #39 `sieve-of-eratosthenes`, #38 `statistics`, #37 `color-adjust`, #36 `rgb-hsl-hsv`, #35 `contrast-ratio`
- **Build order:** #100 → #1
- Note: #42 `base-converter` is now the full version. It replaces the first version that was done before this list was started.

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
| 64 | [`postal-code-formatter`](./postal-code-formatter/) | 2026-11-09 | Japanese postal codes NNN-NNNN; accepts 〒, full-width, odd hyphens; format check only |
| 63 | [`url-parser`](./url-parser/) | 2026-11-09 | URL parts as a plain object (WHATWG URL); null for invalid input |
| 62 | [`email-validator`](./email-validator/) | 2026-11-09 | Practical email format check; unicode and lenient-dot options; no quoted/IP forms |
| 61 | [`luhn-check`](./luhn-check/) | 2026-11-09 | Luhn mod 10 check and check digit calculation |
| 60 | [`isbn-validator`](./isbn-validator/) | 2026-11-09 | ISBN-10/13 validation and conversion; hyphen positions not checked |
| 59 | [`random-id`](./random-id/) | 2026-11-09 | Unbiased random IDs from Web Crypto; 8 charsets or a custom alphabet |
| 58 | [`uuid-v4`](./uuid-v4/) | 2026-11-09 | UUID v4 built from 16 random bytes (RFC 9562); isUuid for versions 1-8 |
| 57 | [`base64`](./base64/) | 2026-11-09 | UTF-8 safe Base64; standard/URL-safe, padding optional; bytes in and out |
| 56 | [`query-string`](./query-string/) | 2026-11-09 | Query string parse/build with arrays, nesting, prototype-pollution safety |
| 55 | [`event-emitter`](./event-emitter/) | 2026-11-09 | on / once / off / emit; symbol events; all listeners run even if one throws |
| 54 | [`memoize`](./memoize/) | 2026-11-09 | Content-based cache keys; LRU maxSize; ttl; async-safe (failed promises not cached) |
| 53 | [`promise-timeout`](./promise-timeout/) | 2026-11-09 | withTimeout with TimeoutError and AbortSignal for the work |
| 52 | [`retry`](./retry/) | 2026-11-09 | Exponential backoff with jitter modes; shouldRetry; AbortSignal; backoffDelay |
| 51 | [`throttle`](./throttle/) | 2026-11-09 | At most once per wait (leading/trailing); cancel, flush, pending |
| 50 | [`debounce`](./debounce/) | 2026-11-09 | Trailing/leading, maxWait; cancel, flush, pending |
| 49 | [`object-path`](./object-path/) | 2026-11-09 | get / has / set / unset by path (a.b[0].c, quoted keys); own-property only, pollution-safe |
| 48 | [`deep-merge`](./deep-merge/) | 2026-11-09 | Recursive merge into a new object; 4 array strategies; no shared references; cycle detection |
| 47 | [`sort-by`](./sort-by/) | 2026-11-09 | Stable multi-key sort; asc/desc per key; nulls first/last; locale and numeric options |
| 46 | [`group-by`](./group-by/) | 2026-11-09 | groupBy (object) and groupByMap (Map); matches the standard Object.groupBy |
| 45 | [`closing-date`](./closing-date/) | 2026-11-09 | 締め日: closing date, billing period, payment date; weekend/holiday adjustment |
| 44 | [`iso-week-number`](./iso-week-number/) | 2026-11-09 | ISO 8601 week and week-year, weeks in a year, week date to date, parse/format |
| 43 | [`date-diff`](./date-diff/) | 2026-11-09 | daysBetween, years/months/days breakdown with a month-end rule, addMonths, addDays |
| 42 | [`base-converter`](./base-converter/) | 2026-11-09 | Full version: bases 2-36, negatives, fractions with precision/rounding, BigInt; replaces the first version |
| 41 | [`fibonacci`](./fibonacci/) | 2026-11-09 | BigInt Fibonacci by fast doubling, cache, negative indices, sequence, generator, isFibonacci |
| 40 | [`combinatorics`](./combinatorics/) | 2026-11-09 | factorial, permutations, combinations, with repetition; exact BigInt |

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
