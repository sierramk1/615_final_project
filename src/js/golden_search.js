/**
 * Finds the minimum of a function using the Golden Section Search method, yielding intermediate steps.
 * @param {function(number): number} f The objective function to minimize.
 * @param {number} a The lower bound of the bracket.
 * @param {number} c The upper bound of the bracket.
 * @param {number} [tol=1e-9] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @yields {{a: number, b: number, d: number, c: number, iter: number}} An object containing the current bracket and inner points.
 * @returns {void} The generator finishes when convergence is met or max_iter is reached.
 */
function* goldenSearchGenerator(f, a, c, tol = 1e-9, max_iter = 100) {
    const gr = (1 + Math.sqrt(5)) / 2; // Golden Ratio ~1.618
    
    // Set up the initial 4-point bracket
    let current_a = a;
    let current_c = c;
    let b = current_c - (current_c - current_a) / gr;
    let d = current_a + (current_c - current_a) / gr;

    for (let i = 0; i < max_iter; i++) {
        yield { a: current_a, b: b, d: d, c: current_c, iter: i + 1 };
        
        if (Math.abs(current_c - current_a) < tol) {
            return; // Converged
        }

        if (f(b) < f(d)) {
            current_c = d;
        } else {
            current_a = b;
        }
        
        // Recalculate inner points for the new, smaller bracket
        b = current_c - (current_c - current_a) / gr;
        d = current_a + (current_c - current_a) / gr;
    }

    throw new Error(`Golden Section Search did not converge in ${max_iter} iterations`);
}

module.exports = { goldenSearch: goldenSearchGenerator };
