/**
 * Finds a root of a function using the bisection method.
 * @param {function(number): number} f The objective function to find a root of.
 * @param {number} a The first endpoint of the interval, where f(a) and f(b) have opposite signs.
 * @param {number} b The second endpoint of the interval.
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @returns {{root: number, f_root: number, iterations: number}} An object containing the root, the function value at the root, and the number of iterations.
 */
function bisection(f, a, b, tol = 1e-10, max_iter = 100) {
    const f_a = f(a);
    const f_b = f(b);

    if (f_a * f_b >= 0) {
        throw new Error("f(a) and f(b) must have opposite signs");
    }

    let current_a = a;
    let current_b = b;

    for (let i = 0; i < max_iter; i++) {
        const mid = (current_a + current_b) / 2.0;
        const f_mid = f(mid);

        if (Math.abs(f_mid) < tol || Math.abs(current_b - current_a) < tol) {
            return { root: mid, f_root: f_mid, iterations: i + 1 };
        }

        if (f(current_a) * f_mid < 0) {
            current_b = mid;
        } else {
            current_a = mid;
        }
    }

    throw new Error(`Bisection method did not converge in ${max_iter} iterations`);
}
