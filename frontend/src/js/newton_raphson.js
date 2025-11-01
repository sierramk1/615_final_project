/**
 * Finds a root of a function using the Newton-Raphson method.
 * @param {function(number): number} f The objective function to find a root of.
 * @param {function(number): number} fp The first derivative of the objective function.
 * @param {number} x0 The initial guess.
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @returns {{root: number, f_root: number, iterations: number, convergence: boolean}} An object containing the root and other details.
 */
function newtonRaphson(f, fp, x0, tol = 1e-10, max_iter = 100) {
    let current_x = x0;

    for (let i = 0; i < max_iter; i++) {
        const f_x = f(current_x);
        const fp_x = fp(current_x);

        if (Math.abs(fp_x) < tol) {
            throw new Error("Derivative is too close to zero.");
        }

        const next_x = current_x - f_x / fp_x;

        if (Math.abs(next_x - current_x) < tol) {
            return {
                root: next_x,
                f_root: f(next_x),
                iterations: i + 1,
                convergence: true,
            };
        }

        current_x = next_x;
    }

    return {
        root: current_x,
        f_root: f(current_x),
        iterations: max_iter,
        convergence: false,
    };
}
module.exports = { newtonRaphson };
