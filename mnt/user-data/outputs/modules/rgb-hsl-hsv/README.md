# rgb-hsl-hsv

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Converts colors between RGB, HSL, and HSV, in every direction. Hue is in degrees (0 up to 360), saturation, lightness, and value are fractions from 0 to 1, and RGB channels are 0 to 255. Results are rounded by default.

## Usage

```js
import { rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, hslToHsv, hsvToHsl } from "./rgb-hsl-hsv.js";

rgbToHsl({ r: 255, g: 0, b: 0 });        // { h: 0, s: 1, l: 0.5 }
rgbToHsl({ r: 0, g: 0, b: 255 });        // { h: 240, s: 1, l: 0.5 }
rgbToHsl({ r: 128, g: 128, b: 128 });    // { h: 0, s: 0, l: 0.502 }   (a gray has no hue)

hslToRgb({ h: 120, s: 1, l: 0.5 });      // { r: 0, g: 255, b: 0 }
hslToRgb({ h: -120, s: 1, l: 0.5 });     // { r: 0, g: 0, b: 255 } (-120 wraps to 240)

rgbToHsv({ r: 255, g: 128, b: 0 });      // { h: 30.12, s: 1, v: 1 }
hsvToRgb({ h: 30, s: 1, v: 1 });         // { r: 255, g: 128, b: 0 }

hslToHsv({ h: 0, s: 1, l: 0.5 });        // { h: 0, s: 1, v: 1 }
hsvToHsl({ h: 0, s: 1, v: 1 });          // { h: 0, s: 1, l: 0.5 }

// Full precision instead of rounding
rgbToHsl({ r: 255, g: 128, b: 0 }, { round: false });
// { h: 30.117647058823529, s: 1, l: 0.5 }
```

## API

| Function | Input → output |
|----------|----------------|
| `rgbToHsl(rgb, options?)` | `{ r, g, b }` → `{ h, s, l }` |
| `hslToRgb(hsl, options?)` | `{ h, s, l }` → `{ r, g, b }` |
| `rgbToHsv(rgb, options?)` | `{ r, g, b }` → `{ h, s, v }` |
| `hsvToRgb(hsv, options?)` | `{ h, s, v }` → `{ r, g, b }` |
| `hslToHsv(hsl, options?)` | `{ h, s, l }` → `{ h, s, v }` |
| `hsvToHsl(hsv, options?)` | `{ h, s, v }` → `{ h, s, l }` |

| Value | Range |
|-------|-------|
| `r`, `g`, `b` | 0 to 255 |
| `h` (hue) | Degrees. Output is 0 up to (not including) 360. Any finite angle is accepted as input and wraps around (`-120` is `240`, `480` is `120`) |
| `s`, `l`, `v` | Fractions from 0 to 1 (multiply by 100 for CSS percentages) |

| Option | Default | Description |
|--------|---------|-------------|
| `round` | `true` | HSL and HSV results: `h` to 2 decimals, `s`, `l`, `v` to 4 decimals. RGB results: whole numbers. `false` returns full-precision values |

- **Round trips:** with the default rounding, `rgb → hsl → rgb` and `rgb → hsv → rgb` return the original whole-number channels.
- **Grays** (`r = g = b`) have no hue: they give `h: 0` and `s: 0`. Black has `l: 0` (HSL) and `v: 0` (HSV).
- HSL is what CSS `hsl()` uses. HSV is also called HSB (hue, saturation, brightness) and is what many color pickers use.
- Errors: `TypeError` if the input is not an object. `RangeError` for channels outside 0 to 255, `s`, `l`, or `v` outside 0 to 1, or a non-finite `h`.

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

- Wikipedia. HSL and HSV.. https://en.wikipedia.org/wiki/HSL_and_HSV
- W3C. CSS Color Module Level 4: HSL to RGB conversion.. https://www.w3.org/TR/css-color-4/#hsl-to-rgb
- Smith, A. R. Color gamut transform pairs. SIGGRAPH Computer Graphics, 12(3), 1978 (the paper that introduced HSV).. https://doi.org/10.1145/965139.807361
