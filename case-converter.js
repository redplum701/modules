/**
 * case-converter
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts strings between camelCase, PascalCase, snake_case, kebab-case,
 *   CONSTANT_CASE, and Title Case. Words are detected from spaces, symbols,
 *   case changes, and digits, so mixed input like "XMLHttpRequest" works.
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
 *   - MDN Web Docs. Unicode character class escape. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape
 *   - MDN Web Docs. Lookahead assertion. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion
 *   - MDN Web Docs. String.prototype.match(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
 */

// A "word" is one of:
//   1. a run of capitals not followed by a lowercase letter (acronyms: "XML")
//   2. an optional capital followed by lowercase letters ("Http", "request")
//   3. a run of digits ("2")
//   4. a run of other letters, such as Japanese ("日本語")
const WORD_PATTERN = /\p{Lu}+(?!\p{Ll})|\p{Lu}?\p{Ll}+|\p{N}+|\p{Lo}+/gu;

function assertString(value, fnName) {
  if (typeof value !== "string") {
    throw new TypeError(`${fnName}: expected a string.`);
  }
}

/**
 * Splits a string into words.
 *
 * @param {string} input - "XMLHttpRequest", "hello_world", "user-id 2", etc.
 * @returns {string[]} Words in their original case, e.g. ["XML", "Http", "Request"].
 */
export function splitWords(input) {
  assertString(input, "splitWords");
  return input.normalize("NFC").match(WORD_PATTERN) ?? [];
}

/**
 * Uppercases the first character and lowercases the rest.
 *
 * @param {string} input - "hELLO" -> "Hello"
 * @returns {string}
 */
export function capitalize(input) {
  assertString(input, "capitalize");
  const [first = "", ...rest] = Array.from(input); // Array.from keeps emoji intact
  return first.toUpperCase() + rest.join("").toLowerCase();
}

/** "hello world" -> "helloWorld" */
export function toCamelCase(input) {
  assertString(input, "toCamelCase");
  return splitWords(input)
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join("");
}

/** "hello world" -> "HelloWorld" */
export function toPascalCase(input) {
  assertString(input, "toPascalCase");
  return splitWords(input).map(capitalize).join("");
}

/** "helloWorld" -> "hello_world" */
export function toSnakeCase(input) {
  assertString(input, "toSnakeCase");
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join("_");
}

/** "helloWorld" -> "hello-world" */
export function toKebabCase(input) {
  assertString(input, "toKebabCase");
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join("-");
}

/** "helloWorld" -> "HELLO_WORLD" */
export function toConstantCase(input) {
  assertString(input, "toConstantCase");
  return splitWords(input)
    .map((word) => word.toUpperCase())
    .join("_");
}

/** "hello_world" -> "Hello World" */
export function toTitleCase(input) {
  assertString(input, "toTitleCase");
  return splitWords(input).map(capitalize).join(" ");
}
