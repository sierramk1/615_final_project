/**
 * Finds a root of a function using the bisection method, yielding intermediate steps.
 * @param {function(number): number} f The objective function to find a root of.
 * @param {number} a The first endpoint of the interval, where f(a) and f(b) have opposite signs.
 * @param {number} b The second endpoint of the interval.
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @yields {{a: number, b: number, mid: number, f_mid: number, iter: number}} An object containing the current interval, midpoint, and iteration count.
 * @returns {void} The generator finishes when convergence is met or max_iter is reached.
 */
function* bisectionGenerator(f, a, b, tol = 1e-10, max_iter = 100) {
    let f_a = f(a);
    let f_b = f(b);

    if (f_a * f_b >= 0) {
        throw new Error("f(a) and f(b) must have opposite signs");
    }

    let current_a = a;
    let current_b = b;

    for (let i = 0; i < max_iter; i++) {
        const mid = (current_a + current_b) / 2.0;
        const f_mid = f(mid);

        yield { a: current_a, b: current_b, mid: mid, f_mid: f_mid, iter: i + 1 };

        if (Math.abs(f_mid) < tol || Math.abs(current_b - current_a) < tol) {
            return; // Converged
        }

        if (f(current_a) * f_mid < 0) {
            current_b = mid;
        } else {
            current_a = mid;
            f_a = f_mid; // Update f_a to avoid re-evaluating f(current_a)
        }
    }

    // If max_iter is reached without convergence, yield the final state and then return
    const final_mid = (current_a + current_b) / 2.0;
    yield { a: current_a, b: current_b, mid: final_mid, f_mid: f(final_mid), iter: max_iter };
    throw new Error(`Bisection method did not converge in ${max_iter} iterations`);
}

module.exports = { bisection: bisectionGenerator };