# modules

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A collection of small, single-purpose JavaScript modules. Each module lives in its own directory with one `.js` file and its own `README.md`. Only "core" building blocks are included; composed apps (fortune slips, bill splitters, etc.) are built by combining these modules.

```
modules/
├── README.md
└── module-name/
    ├── module-name.js
    └── README.md
```

Progress is tracked in [`COMPLETED.md`](./COMPLETED.md). Modules are built from the bottom of the list (#100) up to #1.

## Module List

Ordered by difficulty (#1 is the hardest). Directory and file names use kebab-case.

| # | Module | Description |
|---|--------|-------------|
| 1 | `lunar-calendar` | Traditional Japanese lunisolar calendar calculation |
| 2 | `kinsoku-line-breaker` | Line breaking with JIS X 4051 rules (kinsoku, hanging punctuation, push-out) |
| 3 | `grapheme-splitter` | Grapheme cluster splitting (emoji, combining marks, variation selectors) |
| 4 | `deep-clone` | Deep clone with circular reference support |
| 5 | `deep-equal` | Deep equality check with type and circular reference handling |
| 6 | `color-vision-simulator` | Color vision deficiency simulation with per-type matrices |
| 7 | `rgb-lab` | RGB ⇔ CIELAB conversion and ΔE color difference |
| 8 | `romaji-to-kana` | Romaji to kana conversion (sokuon, hatsuon, long vowels) |
| 9 | `csv-parser` | Full CSV parser (quotes, embedded newlines, embedded commas) |
| 10 | `fuzzy-match` | Fuzzy string search with scoring |
| 11 | `kanji-to-number` | Kanji numerals to numbers (four-digit grouping, large units) |
| 12 | `number-to-kanji` | Numbers to kanji numerals |
| 13 | `rokuyo` | Rokuyo (six-day cycle) calculation, depends on `lunar-calendar` |
| 14 | `natural-sort` | Natural sort order (`file2` before `file10`) |
| 15 | `date-parser` | Multi-format date parser, including Japanese era strings |
| 16 | `japanese-era` | Gregorian ⇔ Japanese era conversion, accurate at era boundaries |
| 17 | `business-days` | Business day arithmetic linked to holiday data |
| 18 | `weighted-random` | Weighted random selection |
| 19 | `seeded-random` | Seeded PRNG (mulberry32, xorshift) for reproducible results |
| 20 | `gaussian-random` | Normally distributed random numbers (Box–Muller) |
| 21 | `matrix` | Matrix multiplication, transpose, small-matrix inverse |
| 22 | `complex-number` | Complex number arithmetic |
| 23 | `fraction` | Fraction arithmetic with reduction |
| 24 | `crc32` | CRC32 implementation |
| 25 | `fnv1a` | FNV-1a hash |
| 26 | `lru-cache` | Least-recently-used cache |
| 27 | `priority-queue` | Priority queue (binary heap) |
| 28 | `union-find` | Disjoint-set union |
| 29 | `ring-buffer` | Fixed-size circular buffer |
| 30 | `password-strength` | Password strength estimate via entropy |
| 31 | `levenshtein-distance` | Edit distance between strings |
| 32 | `slugify` | URL slug generation, including Japanese titles |
| 33 | `template-string` | `{name}` placeholder substitution |
| 34 | `nearest-japanese-color` | Nearest traditional Japanese color name by Lab distance (builds on #7) |
| 35 | `contrast-ratio` | WCAG contrast ratio and relative luminance |
| 36 | `rgb-hsl-hsv` | RGB ⇔ HSL / HSV conversion |
| 37 | `color-adjust` | `lighten`, `darken`, and `mix` for colors |
| 38 | `statistics` | Mean, median, mode, standard deviation, percentile |
| 39 | `sieve-of-eratosthenes` | Prime list generation |
| 40 | `combinatorics` | Factorial, permutations, combinations (BigInt) |
| 41 | `fibonacci` | Fibonacci numbers (BigInt, memoized) |
| 42 | `base-converter` | Full base conversion (fractions, negatives, BigInt). The first version is already done as the starting point |
| 43 | `date-diff` | Correct day and month differences between dates |
| 44 | `iso-week-number` | ISO 8601 week number |
| 45 | `closing-date` | Closing date calculation (end of month, Nth of next month) |
| 46 | `group-by` | Group array items by key |
| 47 | `sort-by` | Multi-key stable sort |
| 48 | `deep-merge` | Deep object merge |
| 49 | `object-path` | Path-based `get` / `set` (`a.b[0].c`) |
| 50 | `debounce` | Debounce with leading / trailing and cancel |
| 51 | `throttle` | Throttle with leading / trailing and cancel |
| 52 | `retry` | Retry with exponential backoff and jitter |
| 53 | `promise-timeout` | Promise with timeout |
| 54 | `memoize` | Memoization with cache key generation |
| 55 | `event-emitter` | Minimal event emitter with `once` and `off` |
| 56 | `query-string` | Query string parse / build (arrays and nesting) |
| 57 | `base64` | UTF-8 safe Base64 encode / decode |
| 58 | `uuid-v4` | UUID v4 from cryptographic randomness |
| 59 | `random-id` | Random ID with configurable charset and length |
| 60 | `isbn-validator` | ISBN check digit validation |
| 61 | `luhn-check` | Luhn algorithm for card number validation |
| 62 | `email-validator` | Practical email format check |
| 63 | `url-parser` | Split a URL into its components |
| 64 | `postal-code-formatter` | Japanese postal code formatting (hyphen insertion) |
| 65 | `phone-number-formatter` | Japanese phone number formatting (area code rules) |
| 66 | `fullwidth-halfwidth` | Full-width ⇔ half-width conversion |
| 67 | `hiragana-katakana` | Hiragana ⇔ katakana conversion |
| 68 | `halfwidth-kana` | Half-width kana ⇔ full-width kana (with voiced mark composition) |
| 69 | `character-counter` | Character count, manuscript-paper conversion, reading time |
| 70 | `grapheme-count` | Grapheme-aware length using `Intl.Segmenter` |
| 71 | `sentence-paragraph-count` | Sentence and paragraph counters |
| 72 | `truncate` | Grapheme-safe truncation |
| 73 | `reverse-string` | Grapheme-aware string reversal |
| 74 | `palindrome-check` | Palindrome check |
| 75 | `char-frequency` | Character occurrence counter |
| 76 | `chunk` | Split an array into chunks |
| 77 | `unique` | Remove duplicates |
| 78 | `shuffle` | Fisher–Yates shuffle |
| 79 | `flatten` | Flatten arrays with depth option |
| 80 | `zip` | Combine multiple arrays element-wise |
| 81 | `set-operations` | Intersection and difference |
| 82 | `partition` | Split an array by predicate |
| 83 | `rotate` | Rotate an array |
| 84 | `range` | Number sequence / arithmetic progression generator |
| 85 | `sample` | Pick one random element (equal probability) |
| 86 | `pick-omit` | `pick` and `omit` for objects |
| 87 | `is-empty` | Emptiness check |
| 88 | `sleep` | Promise-based delay |
| 89 | `once` | Run a function only once |
| 90 | `random-range` | Random integer / float in a range |
| 91 | `clamp-lerp` | Clamp and linear interpolation |
| 92 | `gcd-lcm` | Greatest common divisor and least common multiple |
| 93 | `is-prime` | Single-number primality test |
| 94 | `rounding` | Rounding with selectable modes (banker's rounding, etc.) |
| 95 | `number-format` | Thousands separator formatting |
| 96 | `eto` | Chinese zodiac (eto) from a year |
| 97 | `leap-year` | Leap year check and last day of month |
| 98 | `pad` | Zero / character padding |
| 99 | `case-converter` | camelCase, snake_case, kebab-case, capitalize |
| 100 | `hex-rgb` | HEX ⇔ RGB conversion |

## Notes

- Composed items were intentionally left out. Examples: fortune slips → #18 `weighted-random` plus fortune data; bill splitting → proportional remainder allocation (to be added if needed).
- Dependencies between modules: #13 → #1, #34 → #7.

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
