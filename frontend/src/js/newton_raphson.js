/**
 * Finds a root of a function using the Newton-Raphson method, yielding intermediate steps.
 * @param {function(number): number} f The objective function to find a root of.
 * @param {function(number): number} fp The first derivative of the objective function.
 * @param {number} x0 The initial guess.
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=100] The maximum number of iterations.
 * @yields {{x0: number, x1: number, iter: number}} An object containing the current guess, next guess, and iteration count.
 * @returns {void} The generator finishes when convergence is met or max_iter is reached.
 */
function* newtonRaphsonGenerator(f, fp, x0, tol = 1e-10, max_iter = 100) {
    let current_x = x0;

    // Check if initial guess is already the root
    if (Math.abs(f(current_x)) < tol) {
        yield { x0: current_x, x1: current_x, iter: 0 };
        return;
    }

    for (let i = 0; i < max_iter; i++) {
        const f_x = f(current_x);
        const fp_x = fp(current_x);

        if (Math.abs(fp_x) < tol) {
            throw new Error("Derivative is too close to zero.");
        }

        const next_x = current_x - f_x / fp_x;

        yield { x0: current_x, x1: next_x, iter: i + 1 };

        if (Math.abs(next_x - current_x) < tol) {
            return; // Converged
        }

        current_x = next_x;
    }

    throw new Error(`Newton-Raphson method did not converge in ${max_iter} iterations`);
}

module.exports = { newtonRaphson: newtonRaphsonGenerator };
