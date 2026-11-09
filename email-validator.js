/**
 * email-validator
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A practical email address format check. It covers what real addresses use
 *   (dots, plus tags, common symbols, domain label rules, length limits) and
 *   skips the rare corners of the RFC (quoted local parts, comments, IP
 *   literals). A valid format does not mean the mailbox exists.
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
 *   - WHATWG. HTML Standard: valid email address.
 *     https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 *   - Klensin, J. RFC 5321: Simple Mail Transfer Protocol (length limits). IETF, 2008.
 *     https://www.rfc-editor.org/rfc/rfc5321
 *   - Resnick, P. RFC 5322: Internet Message Format (addr-spec syntax). IETF, 2008.
 *     https://www.rfc-editor.org/rfc/rfc5322
 *   - Yao, J. and Mao, W. RFC 6531: SMTP Extension for Internationalized Email. IETF, 2012.
 *     https://www.rfc-editor.org/rfc/rfc6531
 *   - Braden, R. (ed.). RFC 1123: Requirements for Internet Hosts. IETF, 1989.
 *     https://www.rfc-editor.org/rfc/rfc1123
 */

const MAX_LOCAL_LENGTH = 64; // RFC 5321
const MAX_TOTAL_LENGTH = 254; // RFC 5321 (path limit of 256 minus the angle brackets)
const MAX_LABEL_LENGTH = 63; // RFC 1035

// One piece of the local part (between dots): letters, digits, and the
// symbols allowed in an unquoted local part.
const ASCII_ATOM = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/;
const UNICODE_ATOM = /^[\p{L}\p{N}\p{M}!#$%&'*+/=?^_`{|}~-]+$/u;

// One domain label: letters, digits, and inner hyphens.
const ASCII_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
const UNICODE_LABEL = /^[\p{L}\p{N}\p{M}](?:[\p{L}\p{N}\p{M}-]*[\p{L}\p{N}\p{M}])?$/u;

function isValidLocalPart(local, { allowUnicode, lenientDots }) {
  if (local.length === 0 || local.length > MAX_LOCAL_LENGTH) return false;

  const atomPattern = allowUnicode ? UNICODE_ATOM : ASCII_ATOM;
  const atoms = local.split(".");

  if (lenientDots) {
    // Some older Japanese mobile carrier addresses contain a leading,
    // trailing, or double dot ("name..@example.ne.jp"). Allow empty pieces,
    // but the address still needs at least one real piece.
    const filled = atoms.filter((atom) => atom !== "");
    return filled.length > 0 && filled.every((atom) => atomPattern.test(atom));
  }

  // Strict: no empty piece, so no leading, trailing, or double dots.
  return atoms.every((atom) => atomPattern.test(atom));
}

function isValidDomain(domain, { allowUnicode, requireTld }) {
  if (domain.length === 0) return false;

  const labelPattern = allowUnicode ? UNICODE_LABEL : ASCII_LABEL;
  const labels = domain.split(".");

  if (!labels.every((label) => label.length <= MAX_LABEL_LENGTH && labelPattern.test(label))) {
    return false;
  }
  if (!requireTld) return true;

  // A top-level domain is needed: at least two labels, and the last one is
  // at least 2 characters and not all digits (so "example.123" is rejected).
  const tld = labels[labels.length - 1];
  return labels.length >= 2 && tld.length >= 2 && !/^\d+$/.test(tld);
}

function split(email) {
  const at = email.lastIndexOf("@");
  if (at === -1 || at !== email.indexOf("@")) return null; // needs exactly one "@"
  return { local: email.slice(0, at), domain: email.slice(at + 1) };
}

function readOptions(options) {
  const { allowUnicode = false, lenientDots = false, requireTld = true } = options;
  return { allowUnicode, lenientDots, requireTld };
}

/**
 * Splits an email address into local part and domain, and validates it.
 *
 * @param {string} email - The address. Surrounding spaces are not removed.
 * @param {object} [options]
 * @param {boolean} [options.allowUnicode=false] - Allow non-ASCII letters in
 *   the local part and domain (internationalized email).
 * @param {boolean} [options.lenientDots=false] - Allow leading, trailing, and
 *   double dots in the local part (some older Japanese mobile addresses).
 * @param {boolean} [options.requireTld=true] - Require a dot and a top-level
 *   domain. Set to false to allow "user@localhost".
 * @returns {{local: string, domain: string} | null}
 *   null if the address is not valid. The domain is lowercased.
 * @throws {TypeError} If email is not a string.
 */
export function parseEmail(email, options = {}) {
  if (typeof email !== "string") {
    throw new TypeError("parseEmail: expected a string.");
  }
  if (email.length > MAX_TOTAL_LENGTH) return null;

  const parts = split(email);
  if (parts === null) return null;

  const settings = readOptions(options);
  if (!isValidLocalPart(parts.local, settings)) return null;
  if (!isValidDomain(parts.domain, settings)) return null;

  return { local: parts.local, domain: parts.domain.toLowerCase() };
}

/**
 * Checks whether a string looks like a valid email address.
 * Never throws: non-strings return false.
 *
 * A valid format does not mean the mailbox exists. To be sure, send a
 * confirmation email.
 *
 * @param {*} email - Anything.
 * @param {object} [options] - Same options as parseEmail.
 * @returns {boolean}
 */
export function isValidEmail(email, options = {}) {
  return typeof email === "string" && parseEmail(email, options) !== null;
}
