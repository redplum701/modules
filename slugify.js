/**
 * slugify
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Turns a title into a URL-friendly slug: lowercase, accents removed, words
 *   joined by a separator. Handles Japanese titles in three ways: convert
 *   hiragana and katakana to romaji (Hepburn), keep Japanese characters as they
 *   are, or fall back to a stable short hash when nothing is left.
 *
 * ---------------------------------------------------------------------------
 * MIT License
 *
 * Copyright (c) 2026 紅梅
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------
 *
 * References:
 *   - Wikipedia. Clean URL: slug.
 *     https://en.wikipedia.org/wiki/Clean_URL#Slug
 *   - Unicode Consortium. Unicode Standard Annex #15: Unicode Normalization Forms.
 *     https://unicode.org/reports/tr15/
 *   - Wikipedia. Hepburn romanization.
 *     https://en.wikipedia.org/wiki/Hepburn_romanization
 *   - Wikipedia. Fowler-Noll-Vo hash function.
 *     https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 */

// Hiragana to Hepburn romaji. Katakana is turned into hiragana first.
const KANA_TABLE =
  "あ:a い:i う:u え:e お:o か:ka き:ki く:ku け:ke こ:ko さ:sa し:shi す:su せ:se そ:so " +
  "た:ta ち:chi つ:tsu て:te と:to な:na に:ni ぬ:nu ね:ne の:no は:ha ひ:hi ふ:fu へ:he ほ:ho " +
  "ま:ma み:mi む:mu め:me も:mo や:ya ゆ:yu よ:yo ら:ra り:ri る:ru れ:re ろ:ro " +
  "わ:wa ゐ:i ゑ:e を:o ん:n が:ga ぎ:gi ぐ:gu げ:ge ご:go ざ:za じ:ji ず:zu ぜ:ze ぞ:zo " +
  "だ:da ぢ:ji づ:zu で:de ど:do ば:ba び:bi ぶ:bu べ:be ぼ:bo ぱ:pa ぴ:pi ぷ:pu ぺ:pe ぽ:po ゔ:vu " +
  "ぁ:a ぃ:i ぅ:u ぇ:e ぉ:o ゃ:ya ゅ:yu ょ:yo ゎ:wa";
const KANA = new Map(KANA_TABLE.split(" ").map((pair) => pair.split(":")));

const SMALL_Y = { "ゃ": "a", "ゅ": "u", "ょ": "o" }; // the vowel after ゃ ゅ ょ
const SMALL_VOWELS = { "ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o" };

// Letters that do not split into a base letter plus an accent.
const LATIN_EXTRAS = { "ß": "ss", "æ": "ae", "œ": "oe", "ø": "o", "đ": "d", "ð": "d", "ł": "l", "þ": "th", "ı": "i" };

const SEPARATOR_PATTERN = /^[-_.~]$/;

function romanizeKana(text) {
  // Katakana ァ-ヶ is exactly 0x60 above hiragana ぁ-ゖ.
  const chars = Array.from(text.replace(/[\u30A1-\u30F6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)));
  let result = "";
  let doubleNext = false; // set by っ (a small tsu), which doubles the next consonant

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];

    if (char === "っ") {
      doubleNext = true;
      continue;
    }
    if (char === "ー") continue; // the prolonged sound mark adds nothing to a slug

    let romaji = KANA.get(char);
    if (romaji === undefined) {
      result += char; // not kana: leave it for later steps
      doubleNext = false;
      continue;
    }

    // A kana followed by a small ゃ ゅ ょ or a small vowel makes one sound: きゃ -> kya, ふぁ -> fa.
    const next = chars[i + 1];
    if (next !== undefined && romaji.length >= 2) {
      if (SMALL_Y[next]) {
        const stem = romaji.slice(0, -1); // k, sh, ch, j ...
        romaji = ["sh", "ch", "j"].includes(stem) ? stem + SMALL_Y[next] : stem + KANA.get(next);
        i += 1;
      } else if (SMALL_VOWELS[next]) {
        romaji = romaji.slice(0, -1) + SMALL_VOWELS[next];
        i += 1;
      }
    } else if (next !== undefined && char === "う" && SMALL_VOWELS[next]) {
      romaji = "w" + SMALL_VOWELS[next]; // うぃ -> wi
      i += 1;
    }

    if (doubleNext && /^[a-z]/.test(romaji) && !/^[aiueo]/.test(romaji)) {
      romaji = (romaji.startsWith("ch") ? "t" : romaji[0]) + romaji; // っか -> kka, っち -> tchi
    }
    doubleNext = false;
    result += romaji;
  }
  return result;
}

// A short stable fingerprint of a text (32-bit FNV-1a over its UTF-8 bytes), as 8 hex digits.
function shortHash(text) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Turns text into a slug for URLs and file names.
 *
 * Steps: apply `replacements`; normalize (full-width letters become ASCII,
 * half-width katakana become full-width); turn kana into romaji; remove accents
 * (é becomes e); lowercase; remove apostrophes; turn every other run of
 * characters that are not letters or digits into one separator; trim separators.
 *
 * Japanese text:
 *   - Hiragana and katakana become Hepburn romaji (romanizeKana, on by default):
 *     "ひらがな" gives "hiragana", "ラーメン" gives "ramen".
 *   - Kanji cannot be converted. By default they are dropped. Use unicode: true
 *     to keep them, or fallback to give a title made only of kanji a stable name.
 *
 * @param {string} text - The title or text.
 * @param {object} [options]
 * @param {string} [options.separator="-"] - One of "-", "_", ".", "~".
 * @param {boolean} [options.lowercase=true] - Lowercase the result.
 * @param {boolean} [options.unicode=false] - Keep letters and digits of every script
 *   (kanji, Hangul, Cyrillic...) instead of only a-z and 0-9. The result then needs
 *   percent-encoding in a URL.
 * @param {boolean} [options.romanizeKana=true] - Turn hiragana and katakana into romaji.
 * @param {number} [options.maxLength] - Longest slug, in characters. A long slug is cut at a
 *   separator when one is available within the limit.
 * @param {Object<string, string>} [options.replacements] - Text to swap before anything else,
 *   such as { "&": " and ", "@": " at " }.
 * @param {string|"hash"|((text: string) => string)} [options.fallback] - Used when the slug
 *   comes out empty. A string is used as it is, "hash" gives "n-" plus an 8-digit hash of
 *   the original text (stable for the same text), and a function is called with the original text.
 * @returns {string} The slug, or "" if it is empty and there is no fallback.
 * @throws {TypeError} If text is not a string, or an option has the wrong type.
 * @throws {RangeError} If separator is not allowed, or maxLength is not a positive integer.
 */
export function slugify(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("slugify: text must be a string.");
  }
  const {
    separator = "-",
    lowercase = true,
    unicode = false,
    romanizeKana: romanize = true,
    maxLength,
    replacements = {},
    fallback,
  } = options;

  if (typeof separator !== "string" || !SEPARATOR_PATTERN.test(separator)) {
    throw new RangeError('slugify: separator must be one of "-", "_", ".", "~".');
  }
  if (typeof lowercase !== "boolean" || typeof unicode !== "boolean" || typeof romanize !== "boolean") {
    throw new TypeError("slugify: lowercase, unicode, and romanizeKana must be booleans.");
  }
  if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength < 1)) {
    throw new RangeError("slugify: maxLength must be a positive integer.");
  }
  if (typeof replacements !== "object" || replacements === null) {
    throw new TypeError("slugify: replacements must be an object.");
  }
  if (fallback !== undefined && typeof fallback !== "string" && typeof fallback !== "function") {
    throw new TypeError('slugify: fallback must be a string, "hash", or a function.');
  }

  let working = text;
  for (const [from, to] of Object.entries(replacements)) {
    if (from !== "") working = working.split(from).join(String(to));
  }

  working = working.normalize("NFKC"); // full-width ASCII -> ASCII, half-width kana -> full-width
  if (romanize) working = romanizeKana(working);

  // NFKD splits "é" into "e" + an accent mark. Only the Latin accent marks
  // (U+0300 to U+036F) are removed, so the voiced marks of kana survive and NFC puts them back.
  working = working.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
  working = working.replace(/[ßæœøđðłþı]/gi, (letter) => LATIN_EXTRAS[letter.toLowerCase()]);
  if (lowercase) working = working.toLowerCase();
  working = working.replace(/['\u2019`]/g, ""); // "don't" -> "dont"

  const keep = unicode ? /[^\p{L}\p{N}\p{M}]+/gu : /[^A-Za-z0-9]+/g;
  let slug = working.replace(keep, separator);

  // Trim separators from both ends.
  const edge = separator.replace(/[.~]/g, "\\$&"); // "." and "~" are escaped for the pattern
  slug = slug.replace(new RegExp(`^(?:${edge})+|(?:${edge})+$`, "g"), "");

  if (maxLength !== undefined) {
    const chars = Array.from(slug);
    if (chars.length > maxLength) {
      let cut = chars.slice(0, maxLength);
      if (chars[maxLength] !== separator && cut.includes(separator)) {
        cut = cut.slice(0, cut.lastIndexOf(separator)); // end on a whole word
      }
      slug = cut.join("").replace(new RegExp(`(?:${edge})+$`, "g"), "");
    }
  }

  if (slug === "" && fallback !== undefined) {
    if (typeof fallback === "function") return String(fallback(text));
    return fallback === "hash" ? `n${separator}${shortHash(text)}` : fallback;
  }
  return slug;
}
