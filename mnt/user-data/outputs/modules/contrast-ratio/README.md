# contrast-ratio

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

WCAG 2 contrast: the relative luminance of a color, the contrast ratio between two colors (1 to 21), a pass/fail check against the AA and AAA levels, and a helper that picks the most readable text color for a background.

## Usage

```js
import { relativeLuminance, contrastRatio, wcagCompliance, bestTextColor } from "./contrast-ratio.js";

relativeLuminance("#000000");                 // 0
relativeLuminance("#ffffff");                 // 1

contrastRatio("#000000", "#ffffff");          // 21
contrastRatio("#ffffff", "#ffffff");          // 1
contrastRatio("#767676", "#ffffff");          // 4.54... (the lightest gray that passes AA on white)
contrastRatio("#777777", "#ffffff");          // 4.48... (just fails)

wcagCompliance("#767676", "#ffffff");
// { ratio: 4.54..., normalText: { aa: true, aaa: false },
//   largeText: { aa: true, aaa: true }, uiComponents: true }

bestTextColor("#336699");                     // "#ffffff"
bestTextColor("#ffeb3b");                     // "#000000"
bestTextColor("#336699", ["#222222", "#eeeeee", "#ffcc00"]);   // the most readable of the three

contrastRatio({ r: 0, g: 0, b: 0 }, "#fff");  // 21 (objects and short HEX work too)
```

## API

| Function | Result |
|----------|--------|
| `relativeLuminance(color)` | 0 (black) to 1 (white) |
| `contrastRatio(color1, color2)` | 1 to 21. The order of the colors does not matter |
| `wcagCompliance(foreground, background)` | `{ ratio, normalText: { aa, aaa }, largeText: { aa, aaa }, uiComponents }` |
| `bestTextColor(background, candidates?)` | The candidate with the highest contrast (default: black or white) |

**Levels (WCAG 2.2)**

| | AA | AAA |
|---|----|-----|
| Normal text | 4.5 | 7 |
| Large text (18 pt, or 14 pt bold, and above) | 3 | 4.5 |
| UI components and graphics | 3 | — |

- **Colors** are HEX strings (`#rgb`, `#rrggbb`, `#` optional) or `{ r, g, b }` objects (0 to 255). **Alpha is ignored.** For a semi-transparent color, first blend it with its background (see `color-adjust`'s `mix`), then measure.
- **Do not round before comparing.** `4.499` fails the `4.5` limit. `wcagCompliance` compares the exact ratio.
- **Formula:** `L = 0.2126·R + 0.7152·G + 0.0722·B` on linearized sRGB channels, and the ratio is `(L_lighter + 0.05) / (L_darker + 0.05)`. The sRGB curve uses the threshold `0.04045` (the value in the sRGB standard; older WCAG text printed `0.03928`, which gives the same results for 8-bit colors).
- WCAG 3 (APCA) uses a different method and is not covered here.
- Errors: `TypeError` for a color that is not a string or object, or `candidates` that is not an array. `RangeError` for an invalid color, or an empty `candidates` list.

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

- W3C. Web Content Accessibility Guidelines (WCAG) 2.2: relative luminance.. https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
- W3C. Understanding Success Criterion 1.4.3: Contrast (Minimum).. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- W3C. Understanding Success Criterion 1.4.11: Non-text Contrast.. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Wikipedia. sRGB (the transfer function).. https://en.wikipedia.org/wiki/SRGB
