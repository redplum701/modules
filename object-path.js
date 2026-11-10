/**
 * object-path
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Reads and writes values inside nested objects and arrays by a path such as
 *   "a.b[0].c": get, has, set, and unset, plus parsePath and stringifyPath.
 *   Only the object's own properties are followed, and writes create real own
 *   properties, so paths like "__proto__.x" cannot change any prototype.
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
 *   - Lodash. _.get and _.set.
 *     https://lodash.com/docs/#get
 *   - MDN Web Docs. Object.hasOwn(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
 *   - MDN Web Docs. Object.defineProperty(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 *   - OWASP. Prototype Pollution Prevention Cheat Sheet.
 *     https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html
 */

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const INDEX = /^(?:0|[1-9]\d*)$/; // "0", "7", "42" (no leading zeros)

function isObjectLike(value) {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

// Reads the quoted or numeric part inside [ ] and returns { key, next }.
function readBracket(path, start) {
  const open = start + 1; // the character after "["
  const quote = path[open];

  if (quote === '"' || quote === "'") {
    let end = open + 1;
    while (end < path.length && path[end] !== quote) {
      end += path[end] === "\\" ? 2 : 1; // skip an escaped character
    }
    if (end >= path.length) {
      throw new SyntaxError(`Path "${path}": a quoted key is not closed.`);
    }

    const raw = path.slice(open, end + 1);
    let key;
    if (quote === '"') {
      try {
        key = JSON.parse(raw); // understands \n, \uXXXX, \" and \\
      } catch {
        throw new SyntaxError(`Path "${path}": invalid escape in a quoted key.`);
      }
    } else {
      key = raw.slice(1, -1).replace(/\\(['\\])/g, "$1"); // single quotes: only \' and \\
    }

    if (path[end + 1] !== "]") {
      throw new SyntaxError(`Path "${path}": expected "]" after a quoted key.`);
    }
    return { key, next: end + 2 };
  }

  const close = path.indexOf("]", open);
  if (close === -1) {
    throw new SyntaxError(`Path "${path}": "[" is not closed.`);
  }
  const content = path.slice(open, close);
  if (!INDEX.test(content)) {
    throw new SyntaxError(`Path "${path}": brackets must hold an index like [0] or a quoted key like ["a.b"].`);
  }
  return { key: content, next: close + 1 };
}

function parseString(path) {
  if (path === "") {
    throw new SyntaxError("Path is empty.");
  }

  const keys = [];
  let i = 0;
  let afterDot = false; // the previous character was a "."

  while (i < path.length) {
    const char = path[i];

    if (char === "[") {
      if (afterDot) throw new SyntaxError(`Path "${path}": a key is missing after ".".`);
      const { key, next } = readBracket(path, i);
      keys.push(key);
      i = next;
    } else {
      // A plain key runs up to the next ".", "[", or "]".
      let end = i;
      while (end < path.length && !".[]".includes(path[end])) end += 1;
      if (end === i) {
        throw new SyntaxError(`Path "${path}": unexpected "${char}" at position ${i}.`);
      }
      keys.push(path.slice(i, end));
      i = end;
    }
    afterDot = false;

    // What may follow a key: the end, ".", or "[".
    if (i < path.length) {
      if (path[i] === ".") {
        i += 1;
        afterDot = true;
        if (i >= path.length) throw new SyntaxError(`Path "${path}": the path ends with ".".`);
      } else if (path[i] !== "[") {
        throw new SyntaxError(`Path "${path}": unexpected "${path[i]}" at position ${i}.`);
      }
    }
  }
  return keys;
}

/**
 * Turns a path into a list of keys.
 *
 * Path syntax:
 *   a.b.c        keys separated by dots
 *   a[0].b       an index in brackets
 *   a["b.c"]     a quoted key (any characters; JSON escapes in double quotes)
 *   a['b']       single quotes work too (only \' and \\ are escapes)
 * Or give an array: ["a", 0, "b"] (strings, numbers, and symbols).
 *
 * @param {string|Array<string|number|symbol>} path - The path.
 * @returns {Array<string|symbol>} Keys. Numbers become strings.
 * @throws {TypeError} If path is not a string or array, or an array item is not a string, number, or symbol.
 * @throws {SyntaxError} If a path string is empty or malformed.
 */
export function parsePath(path) {
  if (Array.isArray(path)) {
    return path.map((key) => {
      if (typeof key === "string" || typeof key === "symbol") return key;
      if (typeof key === "number" && Number.isFinite(key)) return String(key);
      throw new TypeError("Path arrays may contain only strings, finite numbers, and symbols.");
    });
  }
  if (typeof path !== "string") {
    throw new TypeError("A path must be a string or an array.");
  }
  return parseString(path);
}

/**
 * Turns a list of keys into a path string that parsePath reads back as the
 * same keys: indices as [0], simple names after a dot, anything else quoted.
 *
 * @param {Array<string|number>} keys - The keys. An empty array gives "".
 * @returns {string}
 * @throws {TypeError} If keys is not an array of strings and numbers.
 */
export function stringifyPath(keys) {
  if (!Array.isArray(keys)) {
    throw new TypeError("stringifyPath: expected an array.");
  }
  return keys
    .map((item, position) => {
      if (typeof item !== "string" && !(typeof item === "number" && Number.isFinite(item))) {
        throw new TypeError("stringifyPath: keys must be strings or finite numbers.");
      }
      const key = String(item);
      if (INDEX.test(key)) return `[${key}]`;
      if (IDENTIFIER.test(key)) return position === 0 ? key : `.${key}`;
      return `[${JSON.stringify(key)}]`;
    })
    .join("");
}

// Following a key is allowed only if the object itself owns it. This keeps
// inherited properties (constructor, __proto__, toString...) out of reach.
function ownChild(container, key) {
  if (container === null || container === undefined) return { found: false };
  return Object.hasOwn(Object(container), key) ? { found: true, value: container[key] } : { found: false };
}

// Writes an own property. defineProperty creates a real own property even for
// the key "__proto__", where a plain assignment would change the prototype.
function writeOwn(container, key, value) {
  if (Object.hasOwn(container, key)) {
    container[key] = value; // keeps the property's setter or attributes
  } else {
    Object.defineProperty(container, key, { value, enumerable: true, writable: true, configurable: true });
  }
}

/**
 * Reads a value by path.
 *
 * @param {*} object - The object or array to read from.
 * @param {string|Array} path - See parsePath.
 * @param {*} [defaultValue] - Returned when the path does not exist, or the value is undefined.
 * @returns {*}
 */
export function get(object, path, defaultValue) {
  let current = object;
  for (const key of parsePath(path)) {
    const child = ownChild(current, key);
    if (!child.found) return defaultValue;
    current = child.value;
  }
  return current === undefined ? defaultValue : current;
}

/**
 * Checks whether a path exists (the value itself may be undefined or null).
 *
 * @param {*} object - The object or array to look in.
 * @param {string|Array} path - See parsePath.
 * @returns {boolean}
 */
export function has(object, path) {
  let current = object;
  for (const key of parsePath(path)) {
    const child = ownChild(current, key);
    if (!child.found) return false;
    current = child.value;
  }
  return true;
}

/**
 * Writes a value by path, creating missing objects along the way. A missing
 * step is made an array if the next key is an index ("0", "1"...), otherwise
 * an object. A step that holds a non-object (a string, number...) is replaced.
 *
 * The object is changed in place.
 *
 * @param {object|Array} object - The object or array to change.
 * @param {string|Array} path - See parsePath. Must have at least one key.
 * @param {*} value - The value to store.
 * @returns {object|Array} The same object, for chaining.
 * @throws {TypeError} If object is not an object, the path is empty, or
 *   the object is frozen.
 */
export function set(object, path, value) {
  if (!isObjectLike(object)) {
    throw new TypeError("set: expected an object or array.");
  }
  const keys = parsePath(path);
  if (keys.length === 0) {
    throw new TypeError("set: the path needs at least one key.");
  }

  let node = object;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const child = ownChild(node, keys[i]);
    if (child.found && isObjectLike(child.value)) {
      node = child.value;
    } else {
      const created = typeof keys[i + 1] === "string" && INDEX.test(keys[i + 1]) ? [] : {};
      writeOwn(node, keys[i], created);
      node = created;
    }
  }
  writeOwn(node, keys[keys.length - 1], value);
  return object;
}

/**
 * Deletes the value at a path. For an array item this leaves an empty slot
 * (the other items keep their positions).
 *
 * @param {*} object - The object or array to change.
 * @param {string|Array} path - See parsePath.
 * @returns {boolean} True if something was deleted, false if the path did not exist.
 */
export function unset(object, path) {
  const keys = parsePath(path);
  if (keys.length === 0) return false;

  let node = object;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const child = ownChild(node, keys[i]);
    if (!child.found) return false;
    node = child.value;
  }

  const last = keys[keys.length - 1];
  if (!isObjectLike(node) || !Object.hasOwn(node, last)) return false;
  return delete node[last];
}
