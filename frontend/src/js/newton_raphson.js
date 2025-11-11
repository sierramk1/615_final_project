import * as math from 'mathjs';
import { createInterpolatedFunction } from './utils.js';

// Newton-Raphson method implementation
export const newtonRaphson = (func, initialGuess, tol = 1e-5, maxIter = 100) => {
    const steps = [];
    let x0 = initialGuess;
    let x1;
    
    const isStringFunc = typeof func === 'string';
    const derivative = isStringFunc ? math.derivative(func, 'x') : null;

    for (let i = 0; i < maxIter; i++) {
        const f_x0 = isStringFunc ? math.evaluate(func, {x: x0}) : func(x0);
        
        let df_x0;
        if (isStringFunc) {
            df_x0 = derivative.evaluate({x: x0});
        } else {
            // Numerical differentiation for interpolated function
            const h = 1e-5;
            df_x0 = (func(x0 + h) - func(x0 - h)) / (2 * h);
        }

        if (math.abs(df_x0) < 1e-15) {
            // Avoid division by zero
            steps.push({ x0, x1: x0 });
            return steps;
        }

        x1 = x0 - f_x0 / df_x0;
        steps.push({ x0, x1 });

        if (math.abs(x1 - x0) < tol) {
            return steps;
        }

        x0 = x1;
    }
    return steps; // Return the steps taken
};

export const solveNewtonRaphson = (optimizationType, expression, initialGuess, data, tolerance, maxIterations) => {
    if (optimizationType === 'function') {
        if (!expression || initialGuess === undefined) {
            throw new Error('Expression and initial guess are required for function optimization.');
        }
        return newtonRaphson(expression, initialGuess, tolerance, maxIterations);

    } else if (optimizationType === 'data') {
        if (!data || initialGuess === undefined) {
            throw new Error('Data and initial guess are required for data optimization.');
        }
        const interpolatedFunc = createInterpolatedFunction(data);
        return newtonRaphson(interpolatedFunc, initialGuess, tolerance, maxIterations);

    } else {
        throw new Error('Invalid optimization type.');
    }
};