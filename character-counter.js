/**
 * character-counter
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Basic text statistics: character counts (by user-perceived character),
 *   conversion to genkou-youshi (Japanese manuscript paper) sheets, and an
 *   estimated reading time that handles Japanese and English together.
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
 *   - MDN Web Docs. Intl.Segmenter. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 *   - Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.
 *     https://unicode.org/reports/tr29/
 *   - Brysbaert, M. How many words do we read per minute? A review and meta-analysis of reading rate. Journal of Memory and Language, 109 (2019).
 *     https://doi.org/10.1016/j.jml.2019.104047
 *   - MDN Web Docs. Unicode character class escape. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape
 */

let graphemeSegmenter;
let wordSegmenter;

function requireSegmenter() {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    throw new Error("This module needs Intl.Segmenter (Node.js 16+ or a modern browser).");
  }
}

function getGraphemeSegmenter() {
  requireSegmenter();
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return graphemeSegmenter;
}

function getWordSegmenter() {
  requireSegmenter();
  wordSegmenter ??= new Intl.Segmenter(undefined, { granularity: "word" });
  return wordSegmenter;
}

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

function assertPositiveInteger(value, name, fnName) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${fnName}: ${name} must be a positive integer.`);
  }
}

function assertPositiveNumber(value, name, fnName) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fnName}: ${name} must be a positive, finite number.`);
  }
}

function countGraphemesIn(text) {
  let count = 0;
  for (const _segment of getGraphemeSegmenter().segment(text)) {
    count += 1;
  }
  return count;
}

// Splits on \n, \r\n, \r, and the Unicode line and paragraph separators.
// A single line break at the very end does not start a new (empty) line.
function splitLines(text) {
  if (text === "") return [];
  const lines = text.split(/\r\n|[\r\n\u2028\u2029]/);
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

// Han, Hiragana, Katakana, and Hangul letters (not punctuation).
// Script_Extensions is used so the prolonged sound mark "ー" counts as kana.
const CJK_LETTER = /(?=\p{L})[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}\p{scx=Hangul}]/gu;

/**
 * Counts characters and lines.
 *
 * Characters are user-perceived characters (grapheme clusters), so an emoji
 * counts once. Line breaks count as characters in `characters` but not in
 * `charactersWithoutWhitespace`.
 *
 * @param {string} text - The text to count.
 * @returns {{characters: number, charactersWithoutWhitespace: number, lines: number}}
 *   lines: number of lines (blank lines included, one trailing line break ignored).
 * @throws {TypeError} If text is not a string.
 */
export function countCharacters(text) {
  assertText(text, "countCharacters");

  let characters = 0;
  let nonWhitespace = 0;
  for (const { segment } of getGraphemeSegmenter().segment(text)) {
    characters += 1;
    if (!/^\s+$/u.test(segment)) nonWhitespace += 1;
  }

  return {
    characters,
    charactersWithoutWhitespace: nonWhitespace,
    lines: splitLines(text).length,
  };
}

/**
 * Converts text to genkou-youshi (Japanese manuscript paper) sheets.
 *
 * Layout rules used: every line (paragraph) starts on a new row, a blank
 * line uses one row, and a long line wraps every `columns` characters.
 * Line-start and line-end rules (kinsoku), paragraph indents, and special
 * handling of punctuation are not applied.
 *
 * @param {string} text - The text to convert.
 * @param {object} [options]
 * @param {number} [options.columns=20] - Characters per row.
 * @param {number} [options.rows=20] - Rows per sheet. Default is the common
 *   400-character sheet (20 x 20).
 * @returns {{characters: number, columns: number, rows: number,
 *   linesUsed: number, sheets: number, sheetsRoundedUp: number}}
 *   characters: characters not counting line breaks.
 *   linesUsed: rows needed.
 *   sheets: linesUsed / rows (a decimal, such as 2.35).
 *   sheetsRoundedUp: sheets rounded up to whole sheets.
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If columns or rows is not a positive integer.
 */
export function manuscriptSheets(text, options = {}) {
  assertText(text, "manuscriptSheets");
  const { columns = 20, rows = 20 } = options;
  assertPositiveInteger(columns, "columns", "manuscriptSheets");
  assertPositiveInteger(rows, "rows", "manuscriptSheets");

  let characters = 0;
  let linesUsed = 0;
  for (const line of splitLines(text)) {
    const length = countGraphemesIn(line);
    characters += length;
    linesUsed += length === 0 ? 1 : Math.ceil(length / columns);
  }

  const sheets = linesUsed / rows;
  return { characters, columns, rows, linesUsed, sheets, sheetsRoundedUp: Math.ceil(sheets) };
}

/**
 * Estimates reading time for Japanese, English, or mixed text.
 *
 * Han, Hiragana, Katakana, and Hangul letters are counted as characters and
 * divided by charsPerMinute. Everything else is counted as words (with
 * Intl.Segmenter) and divided by wordsPerMinute. The two times are added.
 *
 * The defaults are rules of thumb, not measurements for any one reader:
 * 500 characters per minute for Japanese, and 238 words per minute for
 * English (the average silent reading rate for non-fiction found by
 * Brysbaert, 2019).
 *
 * @param {string} text - The text to estimate.
 * @param {object} [options]
 * @param {number} [options.charsPerMinute=500] - Reading speed for CJK characters.
 * @param {number} [options.wordsPerMinute=238] - Reading speed for other words.
 * @returns {{minutes: number, seconds: number, cjkCharacters: number, words: number}}
 *   minutes: a decimal. seconds: rounded to a whole number.
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If a speed is not a positive, finite number.
 */
export function estimateReadingTime(text, options = {}) {
  assertText(text, "estimateReadingTime");
  const { charsPerMinute = 500, wordsPerMinute = 238 } = options;
  assertPositiveNumber(charsPerMinute, "charsPerMinute", "estimateReadingTime");
  assertPositiveNumber(wordsPerMinute, "wordsPerMinute", "estimateReadingTime");

  const cjkCharacters = (text.match(CJK_LETTER) ?? []).length;

  // Replace CJK letters with spaces so they are not counted again as words.
  const rest = text.replace(CJK_LETTER, " ");
  let words = 0;
  for (const { isWordLike } of getWordSegmenter().segment(rest)) {
    if (isWordLike) words += 1;
  }

  const minutes = cjkCharacters / charsPerMinute + words / wordsPerMinute;
  return { minutes, seconds: Math.round(minutes * 60), cjkCharacters, words };
}
