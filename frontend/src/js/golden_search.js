import * as math from 'mathjs';
import { createInterpolatedFunction } from './utils.js';

// Golden-section search implementation
export const goldenSectionSearch = (func, a, b, tol = 1e-5, maxIter = 100) => {
    const steps = [];
    const gr = (math.sqrt(5) + 1) / 2;
    let c = b - (b - a) / gr;
    let d = a + (b - a) / gr;
    for (let i = 0; i < maxIter; i++) {
        steps.push({ a, b: c, d, c: b });
        if (math.abs(b - a) < tol) {
            return steps;
        }
        const fc = typeof func === 'string' ? math.evaluate(func, {x: c}) : func(c);
        const fd = typeof func === 'string' ? math.evaluate(func, {x: d}) : func(d);

        if (fc < fd) {
            b = d;
        } else {
            a = c;
        }
        c = b - (b - a) / gr;
        d = a + (b - a) / gr;
    }
    return steps;
};

export const solveGoldenSearch = (optimizationType, expression, initialGuess, data, tolerance, maxIterations) => {
    if (optimizationType === 'function') {
        if (!expression || !initialGuess) {
            throw new Error('Expression and initial guess are required for function optimization.');
        }
        const { a, b } = initialGuess;
        return goldenSectionSearch(expression, a, b, tolerance, maxIterations);

    } else if (optimizationType === 'data') {
        if (!data || !initialGuess) {
            throw new Error('Data and initial guess are required for data optimization.');
        }
        const interpolatedFunc = createInterpolatedFunction(data);
        const { a, b } = initialGuess;
        return goldenSectionSearch(interpolatedFunc, a, b, tolerance, maxIterations);

    } else {
        throw new Error('Invalid optimization type.');
    }
};