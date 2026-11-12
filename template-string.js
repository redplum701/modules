/**
 * template-string
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Fills {name} placeholders in a string from an object: nested paths
 *   ({user.name}, {items[0]}), a choice of what to do when a value is missing,
 *   a transform hook (for HTML escaping, for example), custom delimiters, and a
 *   backslash to write a literal placeholder.
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
 *   - Mustache. mustache(5) manual: tags and escaping.
 *     https://mustache.github.io/mustache.5.html
 *   - MDN Web Docs. Template literals. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 *   - OWASP. Cross Site Scripting Prevention Cheat Sheet.
 *     https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 *   - MDN Web Docs. Object.hasOwn(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
 */

const MISSING_MODES = ["keep", "empty", "throw"];

// Finds a value by a key such as "name", "user.name", or "items[0].title".
// Only the object's own properties are followed, so "constructor" or "toString"
// can never be read from the prototype.
function lookup(data, key) {
  const parts = key.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = data;
  for (const part of parts) {
    if (part === "") return { found: false };
    if (current === null || current === undefined || !Object.hasOwn(Object(current), part)) {
      return { found: false };
    }
    current = current[part];
  }
  return current === undefined ? { found: false } : { found: true, value: current };
}

function readOptions(options, fnName) {
  const { missing = "keep", transform, open = "{", close = "}", escape = "\\" } = options;
  if (!MISSING_MODES.includes(missing)) {
    throw new RangeError(`${fnName}: missing must be one of ${MISSING_MODES.join(", ")}.`);
  }
  if (transform !== undefined && typeof transform !== "function") {
    throw new TypeError(`${fnName}: transform must be a function.`);
  }
  for (const [name, value] of [["open", open], ["close", close], ["escape", escape]]) {
    if (typeof value !== "string" || value === "") {
      throw new TypeError(`${fnName}: ${name} must be a non-empty string.`);
    }
  }
  return { missing, transform, open, close, escape };
}

// Cuts the template into pieces: { text } for plain text and { key, raw } for
// placeholders. An escape character before an opening delimiter turns that
// delimiter into plain text.
function tokenize(template, { open, close, escape }) {
  const pieces = [];
  let text = "";
  let i = 0;

  while (i < template.length) {
    if (template.startsWith(escape + open, i)) {
      text += open; // an escaped opening delimiter: plain text
      i += escape.length + open.length;
    } else if (template.startsWith(open, i)) {
      const end = template.indexOf(close, i + open.length);
      const key = end === -1 ? "" : template.slice(i + open.length, end).trim();
      if (end === -1 || key === "") {
        text += open; // no closing delimiter, or empty braces: plain text
        i += open.length;
      } else {
        if (text) pieces.push({ text });
        text = "";
        pieces.push({ key, raw: template.slice(i, end + close.length) });
        i = end + close.length;
      }
    } else {
      text += template[i];
      i += 1;
    }
  }
  if (text) pieces.push({ text });
  return pieces;
}

/**
 * Fills placeholders in a template with values from an object.
 *
 * Placeholders look like {name}, {user.name}, or {items[0]}. Only the data's
 * own properties are read. A value is turned into text with String(), so
 * null becomes "null" and a plain object becomes "[object Object]".
 * A property that is missing, or holds undefined, counts as missing.
 *
 * To write a literal placeholder, put a backslash before the opening
 * delimiter: \{name} gives {name}. An opening delimiter with no closing
 * one, and empty braces {}, are left as plain text.
 *
 * @param {string} template - The template text.
 * @param {object} [data={}] - The values.
 * @param {object} [options]
 * @param {"keep"|"empty"|"throw"} [options.missing="keep"] - For a missing value:
 *   "keep" leaves the placeholder as written, "empty" uses "", "throw" throws a RangeError.
 * @param {(text: string, key: string) => string} [options.transform] - Changes each
 *   inserted value (after String()). Use it to escape HTML, for example.
 * @param {string} [options.open="{"] - Opening delimiter.
 * @param {string} [options.close="}"] - Closing delimiter.
 * @param {string} [options.escape="\\"] - The character that escapes an opening delimiter.
 * @returns {string}
 * @throws {TypeError} If template is not a string, data is not an object, or an option has the wrong type.
 * @throws {RangeError} If missing is unknown, or a value is missing and missing is "throw".
 */
export function renderTemplate(template, data = {}, options = {}) {
  if (typeof template !== "string") {
    throw new TypeError("renderTemplate: template must be a string.");
  }
  if (data === null || (typeof data !== "object" && typeof data !== "function")) {
    throw new TypeError("renderTemplate: data must be an object.");
  }
  const settings = readOptions(options, "renderTemplate");

  return tokenize(template, settings)
    .map((piece) => {
      if (piece.key === undefined) return piece.text;

      const result = lookup(data, piece.key);
      if (result.found) {
        const text = String(result.value);
        return settings.transform ? String(settings.transform(text, piece.key)) : text;
      }

      if (settings.missing === "empty") return "";
      if (settings.missing === "throw") {
        throw new RangeError(`renderTemplate: no value for "${piece.key}".`);
      }
      return piece.raw; // "keep"
    })
    .join("");
}

/**
 * Lists the placeholder names in a template, without repeats, in order of
 * first appearance.
 *
 * @param {string} template - The template text.
 * @param {object} [options] - The same delimiter options as renderTemplate (open, close, escape).
 * @returns {string[]}
 * @throws {TypeError} If template is not a string, or an option has the wrong type.
 */
export function extractPlaceholders(template, options = {}) {
  if (typeof template !== "string") {
    throw new TypeError("extractPlaceholders: template must be a string.");
  }
  const settings = readOptions(options, "extractPlaceholders");
  const keys = tokenize(template, settings).filter((piece) => piece.key !== undefined).map((piece) => piece.key);
  return [...new Set(keys)];
}

/**
 * Escapes the characters that matter in HTML: & < > " '
 * Pass it as the transform option when filling an HTML template.
 *
 * @param {string} text - The text to escape.
 * @returns {string}
 * @throws {TypeError} If text is not a string.
 */
export function escapeHtml(text) {
  if (typeof text !== "string") {
    throw new TypeError("escapeHtml: text must be a string.");
  }
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
