# password-strength

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A rough password strength estimate: entropy in bits, a score from 0 to 4, and plain-language warnings. It looks at the character types used, and lowers the estimate for repeated characters, sequences (`abc`, `321`), keyboard rows (`qwerty`), and very common passwords (including common look-alike swaps such as `p@ssw0rd`). It is a heuristic for giving feedback, not a security guarantee.

## Usage

```js
import { passwordStrength, estimateEntropy } from "./password-strength.js";

passwordStrength("password");
// { entropyBits: 10, score: 0, label: "very weak", length: 8, poolSize: 26, ...,
//   warnings: ["This is a very common password.", "It uses only one kind of character..."] }

passwordStrength("p@ssw0rd!");            // caught as a common password with decorations
passwordStrength("qwerty123");            // keyboard pattern, very weak
passwordStrength("aaaaaaaaaa");           // repeats add almost nothing

passwordStrength("T7#kQ9!vLm2$");         // a random-looking 12 characters: strong
// { entropyBits: 78.8..., score: 3, label: "strong", length: 12, poolSize: 95, ... }

passwordStrength("correct horse battery staple");   // long: scores high

estimateEntropy("Tr0ub4dor&3");           // just the number of bits

// Treat words from your own context as weak
passwordStrength("acmecorp2026", { commonPasswords: ["acmecorp"] });
```

## API

| Function | Result |
|----------|--------|
| `passwordStrength(password, options?)` | `{ entropyBits, score, label, length, poolSize, classes, warnings }` |
| `estimateEntropy(password, options?)` | Just `entropyBits` |

| Option | Description |
|--------|-------------|
| `commonPasswords` | Extra words to treat as common (compared in lowercase): the user's name, your product name… |

**Score and label**

| Entropy | `score` | `label` |
|---------|---------|---------|
| below 28 bits | 0 | very weak |
| 28 – 35.9 | 1 | weak |
| 36 – 59.9 | 2 | fair |
| 60 – 79.9 | 3 | strong |
| 80 or more | 4 | very strong |

**How the entropy is worked out**
1. **Pool size:** the total of the character types used. Lowercase 26, uppercase 26, digits 10, ASCII symbols and space 33, other characters 100.
2. **Effective length:** each plain character counts 1. A run of the same character (3 or more) counts 1 plus a little. A sequence (`abc`, `321`) or a keyboard row run (`qwer`, 4 or more) counts as 2.
3. **Entropy** = effective length × log₂(pool size).
4. **Common passwords:** a built-in list of about 70 very common passwords, also matched with a few digits or symbols added at the end and with look-alike swaps undone (`0`→`o`, `@`→`a`, `$`→`s`…). A match caps the entropy at 10 bits.

- `classes` tells which character types were found. `warnings` is a list of short, plain-language hints you can show next to the input.
- **This is a heuristic.** It does not know names, dates, song lyrics, or words in other languages, and the built-in list is short. Passwords that look random to it may still be guessable. For a thorough estimate, see zxcvbn. Never use this score alone to decide that a password is safe.
- **Better password policy** (NIST SP 800-63B): favor length over complexity rules, check passwords against a large list of breached ones, and do not force periodic changes. This module can give feedback, but a breached-password check needs a data source it does not have.
- Nothing is stored or sent anywhere: the password is analyzed in the process that calls the function.
- Errors: `TypeError` if `password` is not a string, or `commonPasswords` is not an array of strings.

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

- NIST. Special Publication 800-63B: Digital Identity Guidelines, Authentication and Lifecycle Management.. https://pages.nist.gov/800-63-3/sp800-63b.html
- OWASP. Authentication Cheat Sheet.. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Wikipedia. Password strength.. https://en.wikipedia.org/wiki/Password_strength
- Wheeler, D. L. zxcvbn: Low-Budget Password Strength Estimation. USENIX Security Symposium, 2016 (a much more thorough estimator, for comparison).. https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/wheeler
