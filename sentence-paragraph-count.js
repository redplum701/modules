/**
 * sentence-paragraph-count
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Counts sentences and paragraphs in text. Sentences are found with
 *   Intl.Segmenter (Unicode sentence rules), which handles both English
 *   punctuation and Japanese punctuation such as "。". Paragraphs can be
 *   separated by blank lines or by single line breaks.
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
 *   - Unicode Consortium. Unicode Standard Annex #29, Section 5: Sentence Boundaries.
 *     https://unicode.org/reports/tr29/#Sentence_Boundaries
 *   - MDN Web Docs. Intl.Segmenter. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 *   - MDN Web Docs. Regular expressions. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
 */

function assertText(text, fnName) {
  if (typeof text !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

/**
 * Counts the sentences in text.
 *
 * Uses the Unicode sentence boundary rules, which are not perfect: a period
 * after an abbreviation followed by a capital letter (such as "Dr. Smith")
 * is counted as a sentence end, and "Hello... World" counts as two.
 *
 * @param {string} text - The text to count.
 * @param {object} [options]
 * @param {string} [options.locale] - A language tag such as "en" or "ja".
 * @returns {number} Number of sentences. Whitespace-only text gives 0.
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If locale is not a valid language tag.
 */
export function countSentences(text, options = {}) {
  assertText(text, "countSentences");
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    throw new Error("countSentences needs Intl.Segmenter (Node.js 16+ or a modern browser).");
  }

  const segmenter = new Intl.Segmenter(options.locale, { granularity: "sentence" });
  let count = 0;
  for (const { segment } of segmenter.segment(text)) {
    if (/\S/.test(segment)) count += 1; // skip pieces that are only whitespace
  }
  return count;
}

/**
 * Counts the paragraphs in text.
 *
 * @param {string} text - The text to count.
 * @param {object} [options]
 * @param {"blank-line"|"line"} [options.by="blank-line"]
 *   "blank-line": paragraphs are separated by one or more blank lines.
 *   "line": every non-empty line is its own paragraph (common for Japanese text).
 * @returns {number} Number of paragraphs. Whitespace-only text gives 0.
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If `by` is not "blank-line" or "line".
 */
export function countParagraphs(text, options = {}) {
  assertText(text, "countParagraphs");
  const { by = "blank-line" } = options;
  if (by !== "blank-line" && by !== "line") {
    throw new RangeError('countParagraphs: by must be "blank-line" or "line".');
  }

  let count = 0;
  let insideParagraph = false;

  for (const line of text.split(/\r\n|[\r\n\u2028\u2029]/)) {
    if (/\S/.test(line)) {
      if (by === "line" || !insideParagraph) count += 1;
      insideParagraph = true;
    } else {
      insideParagraph = false; // a blank line ends the paragraph
    }
  }
  return count;
}
