# matrix

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A small, immutable `Matrix` class for numbers: add, subtract, multiply (by a matrix or a number), transpose, determinant, inverse, trace, integer powers, and solving linear systems. The determinant, inverse, and `solve` use Gaussian elimination with partial pivoting, and a singular matrix is reported clearly.

## Usage

```js
import { Matrix } from "./matrix.js";

const a = new Matrix([[1, 2], [3, 4]]);
const b = new Matrix([[0, 1], [1, 0]]);

a.add(b).toArray();                  // [[1, 3], [4, 4]]
a.sub(b).toArray();                  // [[1, 1], [2, 4]]
a.mul(b).toArray();                  // [[2, 1], [4, 3]]
a.mul(2).toArray();                  // [[2, 4], [6, 8]]
a.transpose().toArray();             // [[1, 3], [2, 4]]

a.determinant();                     // -2
a.trace();                           // 5
a.inverse().toArray();               // [[-2, 1], [1.5, -0.5]]
a.pow(2).toArray();                  // [[7, 10], [15, 22]]
a.pow(-1).equals(a.inverse());       // true

// A 2x3 matrix times a 3x2 matrix gives 2x2
new Matrix([[1, 2, 3], [4, 5, 6]]).mul([[7, 8], [9, 10], [11, 12]]).toArray();
// [[58, 64], [139, 154]]

// Solve  2x + y = 5,  x + 3y = 10
new Matrix([[2, 1], [1, 3]]).solve([5, 10]);       // [1, 3]

// Not invertible
new Matrix([[1, 2], [2, 4]]).inverse();            // RangeError: the matrix is singular

Matrix.identity(3).toArray();        // [[1,0,0],[0,1,0],[0,0,1]]
Matrix.zeros(2, 3).toArray();        // [[0,0,0],[0,0,0]]

// Compare with a tolerance after floating-point work
a.mul(a.inverse()).equals(Matrix.identity(2), 1e-12);   // true
```

## API

**Making a matrix:** `new Matrix(rows)` (an array of equal-length rows of finite numbers, copied), `Matrix.identity(n)`, `Matrix.zeros(rows, columns = rows)`.

| Member | Result |
|--------|--------|
| `rowCount`, `columnCount`, `isSquare` | Size, read-only |
| `get(row, column)` | One entry (counting from 0) |
| `toArray()`, `toString()`, `toJSON()` | The rows as a new array / as text / for JSON |
| `add(other)`, `sub(other)` | Entry-wise. The sizes must match |
| `mul(other)` | Matrix product (columns of this = rows of other), or scaling by a number |
| `transpose()` | Rows become columns |
| `map(callback)` | A new matrix from `callback(value, row, column)` |
| `trace()` | Sum of the diagonal (square only) |
| `determinant()` | The determinant (square only) |
| `inverse()` | The inverse (square, not singular) |
| `solve(b)` | Solves `A x = b`. `b` is a vector (array of numbers → array result) or a matrix (→ `Matrix`) |
| `pow(n)` | Integer power by repeated squaring. Negative uses the inverse; `0` gives the identity |
| `equals(other, tolerance = 0)` | `true` if same size and all entries are within `tolerance` |

`other` arguments can be a `Matrix` or a plain array of rows.

- **Immutable:** a `Matrix` is frozen, and every operation returns a new one.
- **Floating point:** results are approximate. `a.mul(a.inverse())` equals the identity only up to rounding error, so compare with a tolerance. Inputs with exactly representable results (small whole numbers) often stay exact for 2×2.
- **How determinant, inverse, and solve work:** Gaussian elimination with partial pivoting (the row with the largest entry is used as the pivot), which is much more stable than the textbook cofactor method. 1×1 and 2×2 use direct formulas.
- **Singular matrices:** if a pivot is smaller than `1e-12` times the largest entry, the matrix is treated as singular and `inverse()` / `solve()` throw `RangeError`. A nearly singular matrix (condition number near 1e12 or more) can give inaccurate results even when it is not reported as singular.
- Size limit: 2,000 rows and 2,000 columns. This module is meant for small and medium matrices, not high-performance numeric work.
- Errors: `TypeError` for rows that are not arrays, or entries that are not finite numbers. `RangeError` for rows of different lengths, sizes that do not match an operation, a non-square matrix where a square one is needed, a singular matrix, or an exponent that is not a whole number within ±1,000,000.

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

- Wikipedia. Gaussian elimination.. https://en.wikipedia.org/wiki/Gaussian_elimination
- Wikipedia. Invertible matrix.. https://en.wikipedia.org/wiki/Invertible_matrix
- Wikipedia. LU decomposition (partial pivoting).. https://en.wikipedia.org/wiki/LU_decomposition
- Wikipedia. Matrix multiplication.. https://en.wikipedia.org/wiki/Matrix_multiplication
- MDN Web Docs. Private elements (class private fields). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
