/**
 * Finds the minimum of a function using the Golden Section Search method.
 * @param {function(number): number} f The objective function to minimize.
 * @param {number} a The lower bound of the bracket.
 * @param {number} c The upper bound of the bracket.
 * @param {number} [tol=1e-9] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @returns {{minimum: number, objective: number, iterations: number}} An object containing the minimum, the function value at the minimum, and the number of iterations.
 */
function goldenSearch(f, a, c, tol = 1e-9, max_iter = 100) {
    const gr = (1 + Math.sqrt(5)) / 2; // ~1.618

    let b = c - (c - a) / gr;
    let d = a + (c - a) / gr;

    for (let i = 0; i < max_iter; i++) {
        if (f(b) < f(d)) {
            c = d;
        } else {
            a = b;
        }

        b = c - (c - a) / gr;
        d = a + (c - a) / gr;

        if (Math.abs(c - a) < tol) {
            const minimum = (a + c) / 2;
            return {
                minimum: minimum,
                objective: f(minimum),
                iterations: i + 1,
            };
        }
    }

    throw new Error(`Golden Section Search did not converge in ${max_iter} iterations`);
}
