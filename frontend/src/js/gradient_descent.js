const math = require("mathjs");

/**
 * Performs multi-dimensional Gradient Descent to find the minimum of a function.
 * Requires a math library like math.js for vector operations.
 *
 * @param {function(number[]): number} f The objective function to minimize.
 * @param {function(number[]): number[]} g The gradient function of f.
 * @param {number[]} x0 The initial starting point (vector).
 * @param {number} [step_size=0.0001] The initial step size (learning rate).
 * @param {boolean} [update_step_size=true] Whether to update the step size using line search.
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=5000] The maximum number of iterations.
 * @param {...any} args Additional arguments to pass to f and g.
 * @returns {{xmin: number[], fmin: number, step_size: number, convergence: boolean, iter: number}}
 */
function gradientDescent(f, g, x0, step_size = 0.0001, update_step_size = true, tol = 1e-10, max_iter = 5000, ...args) {
    let current_x = x0;
    let f0 = f(current_x, ...args);
    let g0 = g(current_x, ...args);
    let current_step_size = step_size;

    for (let iter = 1; iter <= max_iter; iter++) {
        const next_x = math.subtract(current_x, math.multiply(current_step_size, g0));
        const f1 = f(next_x, ...args);

        if (!isFinite(f1)) {
            throw new Error("Function diverged to infinity. Try a different initial value or a smaller step size.");
        }

        if (Math.abs(f1 - f0) <= tol * (Math.abs(f1) + Math.abs(f0))) {
            return { xmin: next_x, fmin: f1, step_size: current_step_size, convergence: true, iter: iter };
        }

        const g1 = g(next_x, ...args);

        if (update_step_size) {
            const delta_x = math.subtract(next_x, current_x);
            const delta_g = math.subtract(g1, g0);
            const sum_delta_g_sq = math.sum(math.dotPow(delta_g, 2));
            if (sum_delta_g_sq > 0) {
                 current_step_size = Math.abs(math.sum(math.dotMultiply(delta_x, delta_g))) / sum_delta_g_sq;
            }
        }
        
        current_x = next_x;
        f0 = f1;
        g0 = g1;
    }

    return { xmin: current_x, fmin: f0, step_size: current_step_size, convergence: false, iter: max_iter };
}

module.exports = { gradientDescent };
