/**
 * password-strength
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A rough password strength estimate: entropy in bits, a score from 0 to 4,
 *   and plain-language warnings. It looks at the character types used, and
 *   lowers the estimate for repeated characters, sequences (abc, 321), keyboard
 *   rows (qwerty), and very common passwords (including common letter
 *   swaps such as p@ssw0rd). It is a heuristic for feedback, not a guarantee.
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
 *   - NIST. Special Publication 800-63B: Digital Identity Guidelines, Authentication and Lifecycle Management.
 *     https://pages.nist.gov/800-63-3/sp800-63b.html
 *   - OWASP. Authentication Cheat Sheet.
 *     https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 *   - Wikipedia. Password strength.
 *     https://en.wikipedia.org/wiki/Password_strength
 *   - Wheeler, D. L. zxcvbn: Low-Budget Password Strength Estimation. USENIX Security Symposium, 2016 (a much more thorough estimator, for comparison).
 *     https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/wheeler
 */

const LABELS = ["very weak", "weak", "fair", "strong", "very strong"];

// Entropy limits (in bits) for the score 1, 2, 3, and 4.
const SCORE_LIMITS = [28, 36, 60, 80];

// Rows of a keyboard. A run of four or more neighbors, forward or backward, is a pattern.
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

// Look-alike substitutions undone before the common-password check.
const LOOK_ALIKES = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

const COMMON_PASSWORDS = new Set([
  "password", "123456", "123456789", "12345678", "12345", "1234567", "1234", "qwerty", "abc123", "password1",
  "111111", "123123", "admin", "letmein", "welcome", "monkey", "dragon", "iloveyou", "sunshine", "princess",
  "football", "baseball", "login", "master", "hello", "freedom", "whatever", "trustno1", "shadow", "superman",
  "qwertyuiop", "1q2w3e4r", "zaq12wsx", "passw0rd", "starwars", "computer", "michael", "jennifer", "jordan",
  "harley", "ranger", "hunter", "buster", "soccer", "batman", "tigger", "charlie", "robert", "thomas", "hockey",
  "ginger", "pepper", "summer", "love", "secret", "asdfgh", "zxcvbn", "654321", "666666", "121212", "000000",
  "pass", "test", "guest", "root", "changeme", "default", "qazwsx", "access", "flower", "mustang", "cheese",
]);

const MAX_COMMON_BITS = 10;

function classify(codePoints) {
  const classes = { lowercase: false, uppercase: false, digits: false, symbols: false, other: false };
  for (const char of codePoints) {
    if (/[a-z]/.test(char)) classes.lowercase = true;
    else if (/[A-Z]/.test(char)) classes.uppercase = true;
    else if (/[0-9]/.test(char)) classes.digits = true;
    else if (/[\x20-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/.test(char)) classes.symbols = true;
    else classes.other = true; // letters and symbols outside ASCII
  }
  return classes;
}

// How many characters could each position be? The sizes of the character types in use.
function poolSizeOf(classes) {
  return (
    (classes.lowercase ? 26 : 0) +
    (classes.uppercase ? 26 : 0) +
    (classes.digits ? 10 : 0) +
    (classes.symbols ? 33 : 0) +
    (classes.other ? 100 : 0)
  );
}

// The length of a keyboard-row pattern starting at position i (0 if none).
function keyboardRunLength(lower, i) {
  for (const row of KEYBOARD_ROWS) {
    for (const rowText of [row, [...row].reverse().join("")]) {
      let length = 0;
      while (i + length < lower.length) {
        const at = rowText.indexOf(lower[i + length]);
        if (at === -1) break;
        if (length > 0 && at !== rowText.indexOf(lower[i + length - 1]) + 1) break;
        length += 1;
      }
      if (length >= 4) return length;
    }
  }
  return 0;
}

// The length of a run of characters that go up (abc, 123) or down (cba, 321) one step at a time.
function sequenceRunLength(chars, i) {
  if (i + 2 >= chars.length) return 0;
  const step = chars[i + 1].codePointAt(0) - chars[i].codePointAt(0);
  if (step !== 1 && step !== -1) return 0;

  let length = 2;
  while (i + length < chars.length && chars[i + length].codePointAt(0) - chars[i + length - 1].codePointAt(0) === step) {
    length += 1;
  }
  return length >= 3 ? length : 0;
}

// Counts how many "free choices" the password really holds. A plain character
// counts as 1. A repeat counts a little, and a sequence or keyboard run counts as 2.
function effectiveLength(chars) {
  const lower = chars.map((char) => char.toLowerCase());
  const found = { repeats: false, sequences: false, keyboard: false };
  let effective = 0;
  let i = 0;

  while (i < chars.length) {
    const keyboard = keyboardRunLength(lower, i);
    if (keyboard > 0) {
      found.keyboard = true;
      effective += 2;
      i += keyboard;
      continue;
    }

    let repeat = 1;
    while (i + repeat < chars.length && chars[i + repeat] === chars[i]) repeat += 1;
    if (repeat >= 3) {
      found.repeats = true;
      effective += 1 + 0.1 * (repeat - 1);
      i += repeat;
      continue;
    }

    const sequence = sequenceRunLength(lower, i);
    if (sequence > 0) {
      found.sequences = true;
      effective += 2;
      i += sequence;
      continue;
    }

    effective += 1;
    i += 1;
  }
  return { effective, found };
}

// Is this password (or a lightly decorated version of it) a very common one?
function isCommon(password, extra) {
  const lower = password.toLowerCase();
  const undone = [...lower].map((char) => LOOK_ALIKES[char] ?? char).join("");

  const candidates = new Set();
  for (const text of [lower, undone]) {
    candidates.add(text);
    candidates.add(text.replace(/[\d!@#$%^&*._-]{1,4}$/, "")); // a few digits or symbols tacked on the end
  }
  return [...candidates].some((text) => COMMON_PASSWORDS.has(text) || extra.has(text));
}

/**
 * Estimates the strength of a password.
 *
 * How the entropy is worked out:
 *   1. The pool size is the total of the character types in use: lowercase 26,
 *      uppercase 26, digits 10, ASCII symbols and space 33, other characters 100.
 *   2. The password is scanned for patterns. Each plain character counts as 1;
 *      a repeat (aaa) counts 1 plus a little; a sequence (abc, 321) or a keyboard
 *      run (qwer) counts as 2.
 *   3. entropy = effective length x log2(pool size).
 *   4. If the password is a very common one (also with a few digits added, or
 *      look-alike swaps like p@ssw0rd), the entropy is capped at 10 bits.
 *
 * Scores: below 28 bits is 0 ("very weak"), below 36 is 1 ("weak"), below 60 is 2
 * ("fair"), below 80 is 3 ("strong"), and 80 or more is 4 ("very strong").
 *
 * This is a quick estimate for giving feedback while someone types. It is not a
 * security guarantee, and it knows nothing about names, dates, or words in other languages.
 *
 * @param {string} password - The password. It is analyzed in the browser or process
 *   that runs this code. Nothing is sent anywhere.
 * @param {object} [options]
 * @param {string[]} [options.commonPasswords] - More passwords to treat as common
 *   (compared in lowercase), for example the user's name or your product name.
 * @returns {{entropyBits: number, score: number, label: string, length: number,
 *   poolSize: number, classes: {lowercase: boolean, uppercase: boolean, digits: boolean,
 *   symbols: boolean, other: boolean}, warnings: string[]}}
 *   entropyBits is rounded to 1 decimal. length counts characters (code points).
 * @throws {TypeError} If password is not a string, or commonPasswords is not an array of strings.
 */
export function passwordStrength(password, options = {}) {
  if (typeof password !== "string") {
    throw new TypeError("passwordStrength: password must be a string.");
  }
  const { commonPasswords = [] } = options;
  if (!Array.isArray(commonPasswords) || commonPasswords.some((item) => typeof item !== "string")) {
    throw new TypeError("passwordStrength: commonPasswords must be an array of strings.");
  }

  const chars = Array.from(password);
  const warnings = [];

  if (chars.length === 0) {
    return {
      entropyBits: 0,
      score: 0,
      label: LABELS[0],
      length: 0,
      poolSize: 0,
      classes: classify([]),
      warnings: ["The password is empty."],
    };
  }

  const classes = classify(chars);
  const poolSize = poolSizeOf(classes);
  const { effective, found } = effectiveLength(chars);
  let entropy = effective * Math.log2(poolSize);

  if (isCommon(password, new Set(commonPasswords.map((item) => item.toLowerCase())))) {
    entropy = Math.min(entropy, MAX_COMMON_BITS);
    warnings.push("This is a very common password.");
  }
  if (chars.length < 8) warnings.push("It is short. Use at least 12 characters.");
  else if (chars.length < 12) warnings.push("Longer is stronger. Try 12 characters or more.");
  if (found.repeats) warnings.push("Repeated characters add little strength.");
  if (found.sequences) warnings.push("Sequences such as abc or 321 are easy to guess.");
  if (found.keyboard) warnings.push("Keyboard patterns such as qwerty are easy to guess.");
  if (Object.values(classes).filter(Boolean).length === 1 && chars.length < 16) {
    warnings.push("It uses only one kind of character. Mix letters, digits, and symbols, or make it longer.");
  }

  const score = SCORE_LIMITS.filter((limit) => entropy >= limit).length;
  return {
    entropyBits: Math.round(entropy * 10) / 10,
    score,
    label: LABELS[score],
    length: chars.length,
    poolSize,
    classes,
    warnings,
  };
}

/**
 * Just the entropy estimate, in bits (see passwordStrength for how it is worked out).
 *
 * @param {string} password - The password.
 * @param {object} [options] - The same options as passwordStrength.
 * @returns {number} Bits, rounded to 1 decimal.
 * @throws {TypeError} If password is not a string, or commonPasswords is not an array of strings.
 */
export function estimateEntropy(password, options = {}) {
  return passwordStrength(password, options).entropyBits;
}
