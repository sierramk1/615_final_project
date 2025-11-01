/**
 * Finds a root of a function using the Secant method.
 * @param {function(number): number} f The objective function to find a root of.
 * @param {number} x0 The first initial guess.
 * @param {number} x1 The second initial guess.
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @returns {{root: number, f_root: number, iterations: number, convergence: boolean}} An object containing the root and other details.
 */
function secant(f, x0, x1, tol = 1e-10, max_iter = 100) {
    let current_x0 = x0;
    let current_x1 = x1;

    for (let i = 0; i < max_iter; i++) {
        const f_x0 = f(current_x0);
        const f_x1 = f(current_x1);

        if (Math.abs(f_x1 - f_x0) < tol) {
            throw new Error("Function values at the two points are too close.");
        }

        const next_x = current_x1 - (f_x1 * (current_x1 - current_x0)) / (f_x1 - f_x0);

        if (Math.abs(next_x - current_x1) < tol) {
            return {
                root: next_x,
                f_root: f(next_x),
                iterations: i + 1,
                convergence: true,
            };
        }

        current_x0 = current_x1;
        current_x1 = next_x;
    }

    return {
        root: current_x1,
        f_root: f(current_x1),
        iterations: max_iter,
        convergence: false,
    };
}
module.exports = { secant };
