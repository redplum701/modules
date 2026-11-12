# slugify

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Turns a title into a URL-friendly slug: lowercase, accents removed, words joined by a separator. It handles Japanese titles in three ways: convert hiragana and katakana to romaji (Hepburn), keep Japanese characters as they are, or fall back to a stable short hash when nothing is left.

## Usage

```js
import { slugify } from "./slugify.js";

slugify("Hello, World!");                      // "hello-world"
slugify("  Crème brûlée & Café  ");            // "creme-brulee-cafe"
slugify("It's 100% Fun");                      // "its-100-fun"
slugify("Ｆｕｌｌ　Ｗｉｄｔｈ");                    // "full-width"

// Japanese
slugify("ひらがなのタイトル");                    // "hiragananotaitoru"
slugify("ラーメン");                             // "ramen"
slugify("きょう は がっこう");                    // "kyou-ha-gakkou"
slugify("東京タワー");                            // "tawa"   (the kanji are dropped)
slugify("東京タワー", { unicode: true });          // "東京tawa" (kanji kept, kana romanized)
slugify("東京", { fallback: "hash" });            // "n-xxxxxxxx" (a stable 8-digit hash of the text)
slugify("東京", { fallback: "untitled" });        // "untitled"

// Options
slugify("Hello World", { separator: "_" });                    // "hello_world"
slugify("A Very Long Title Indeed", { maxLength: 12 });        // "a-very-long"
slugify("Tom & Jerry", { replacements: { "&": " and " } });    // "tom-and-jerry"
slugify("Hello World", { lowercase: false });                  // "Hello-World"
```

## API

`slugify(text, options?)` returns a string.

| Option | Default | Description |
|--------|---------|-------------|
| `separator` | `"-"` | `"-"`, `"_"`, `"."`, or `"~"` |
| `lowercase` | `true` | Lowercase the result |
| `unicode` | `false` | Keep letters and digits of every script (kanji, Hangul, Cyrillic…), not only `a–z` and `0–9`. Such slugs must be percent-encoded in URLs |
| `romanizeKana` | `true` | Turn hiragana and katakana into Hepburn romaji |
| `maxLength` | — | Longest slug in characters. A longer slug is cut at a separator when possible |
| `replacements` | — | Text to swap first, for example `{ "&": " and " }` |
| `fallback` | — | If the slug is empty: a string (used as is), `"hash"` (`"n-"` plus an 8-digit hash of the original text), or a function `(text) => string` |

**What it does, in order:** apply `replacements` → normalize (full-width letters to ASCII, half-width katakana to full-width) → romanize kana → remove Latin accents (`é` → `e`; `ß` → `ss`; `ø` → `o`) → lowercase → remove apostrophes → turn each run of other characters into one separator → trim separators → apply `maxLength` → apply `fallback`.

**Japanese titles**
- Kana become Hepburn romaji: `し` → `shi`, `ち` → `chi`, `つ` → `tsu`, `ふ` → `fu`. Small kana combine (`きゃ` → `kya`, `しゃ` → `sha`, `ふぁ` → `fa`), and `っ` doubles the next consonant (`がっこう` → `gakkou`, `っち` → `tchi`).
- `ー` (the prolonged sound mark) is dropped, `ん` is always `n`, and long vowels are not marked (`ラーメン` → `ramen`, `おお` → `oo`). This is a slug, not a transliteration standard.
- **Kanji cannot be converted** without a dictionary, so by default they are dropped. A title made only of kanji gives an empty slug, which is what `fallback` is for. `"hash"` gives the same name for the same title every time, so the URL stays stable.
- `unicode: true` keeps kanji (and other scripts) as they are.

- The hash is a 32-bit FNV-1a: it is short and stable, but not unique. Two different titles can collide, so check for existing slugs in your own system.
- Errors: `TypeError` for a non-string `text` or options of the wrong type. `RangeError` for a `separator` that is not allowed, or a `maxLength` that is not a positive integer.

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

- Wikipedia. Clean URL: slug.. https://en.wikipedia.org/wiki/Clean_URL#Slug
- Unicode Consortium. Unicode Standard Annex #15: Unicode Normalization Forms.. https://unicode.org/reports/tr15/
- Wikipedia. Hepburn romanization.. https://en.wikipedia.org/wiki/Hepburn_romanization
- Wikipedia. Fowler-Noll-Vo hash function.. https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
