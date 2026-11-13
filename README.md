# 100 JavaScript Modules Challenge

Can 紅梅 design and build 100 JavaScript modules, from small fundamentals to more involved problems? This repository records that challenge: the ideas, implementations, and the result of working through them one module at a time.

The goal is the challenge itself and what it demonstrates—not a general-purpose utility library. Each module is an individual learning project with its own source file, explanation in the file header, MIT license notice, and references where relevant.

## Challenge progress

The progress ledger is [COMPLETED.md](COMPLETED.md). It records the build order (from #100 toward #1), completed modules, and the next modules planned.

At the time of this README update, the ledger reports **61 / 100 completed**. The repository currently contains 86 JavaScript files at its root, so the ledger and the current source files do not fully agree. The completion count should be reconciled with the actual challenge history before treating it as the final result.

## A few examples

These links point to the standalone source files in the repository:

- [hex-rgb.js](hex-rgb.js) — convert HEX color strings and RGB values, including alpha.
- [case-converter.js](case-converter.js) — convert between camel, Pascal, snake, kebab, constant, and title case.
- [sieve-of-eratosthenes.js](sieve-of-eratosthenes.js) — generate primes up to a limit or across a range.
- [phone-number-formatter.js](phone-number-formatter.js) — format Japanese phone numbers; this is one challenge entry among many.
- [statistics.js](statistics.js) — statistical calculations.

Browse the [JavaScript source files](.) to see the other challenge entries. Each file describes its own purpose and API in its header.

## Run a module

The modules are standalone JavaScript files. With Node.js installed, run one from the repository root:

```sh
node phone-number-formatter.js
```

To use exported functions from another ES module:

```js
import { formatPhoneNumber } from "./phone-number-formatter.js";

console.log(formatPhoneNumber("09012345678")); // "090-1234-5678"
```

Replace the filename and exported function with those documented in the module you want to explore. There is no shared package install step or central test command. Run a module's file for its included examples; check its header for API details, environment requirements, and references.

## License

The modules are released under the [MIT License](LICENSE). Individual source files also carry their MIT license notice.
