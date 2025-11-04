const math = require("mathjs");

/**
 * Performs multi-dimensional Newton's method to find the minimum of a function.
 * Requires a math library like math.js for vector/matrix operations.
 *
 * @param {function(number[]): number} f The objective function to minimize.
 * @param {function(number[]): number[]} g The gradient function of f.
 * @param {function(number[]): number[][]} h The Hessian matrix function of f.
 * @param {number[]} x0 The initial starting point (vector).
 * @param {number} [tol=1e-10] The tolerance for convergence.
 * @param {number} [max_iter=5000] The maximum number of iterations.
 * @param {...any} args Additional arguments to pass to f, g, and h.
 * @returns {{xmin: number[], fmin: number, f_deriv: number[], Hessian: number[][], convergence: boolean, iter: number}}
 */
function newtonsMethod(f, g, h, x0, tol = 1e-10, max_iter = 5000, ...args) {
    let current_x = x0;
    let f0 = f(current_x, ...args);

    for (let iter = 1; iter <= max_iter; iter++) {
        const g0 = g(current_x, ...args);
        const h0 = h(current_x, ...args);

        // Solve H*s = -g for the step s, which is s = inv(H) * -g
        try {
            const h0_inv = math.inv(h0);
            const step = math.multiply(h0_inv, g0);
            var next_x = math.subtract(current_x, step);
        } catch (e) {
            throw new Error(`Matrix inversion failed. The Hessian may be singular. Error: ${e.message}`);
        }

        const f1 = f(next_x, ...args);

        if (!isFinite(f1)) {
            throw new Error("Function diverged to infinity. Try a different initial value.");
        }

        if (Math.abs(f1 - f0) <= tol * (Math.abs(f1) + Math.abs(f0))) {
            return {
                xmin: next_x,
                fmin: f1,
                f_deriv: g(next_x, ...args),
                Hessian: h(next_x, ...args),
                convergence: true,
                iter: iter
            };
        }
        
        current_x = next_x;
        f0 = f1;
    }

    return {
        xmin: current_x,
        fmin: f0,
        f_deriv: g(current_x, ...args),
        Hessian: h(current_x, ...args),
        convergence: false,
        iter: max_iter
    };
}

module.exports = { newtonsMethod };
