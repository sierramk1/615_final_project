
import express from 'express';
import * as math from 'mathjs';
import { createInterpolatedFunction } from '../utils.js';

const router = express.Router();

// Secant method implementation
const secant = (func, x0, x1, tol = 1e-5, maxIter = 100) => {
    const steps = [];
    const isStringFunc = typeof func === 'string';
    let f_x0 = isStringFunc ? math.evaluate(func, {x: x0}) : func(x0);
    let f_x1 = isStringFunc ? math.evaluate(func, {x: x1}) : func(x1);
    let x2;

    for (let i = 0; i < maxIter; i++) {
        if (math.abs(f_x1 - f_x0) < 1e-15) {
            // Avoid division by zero
            steps.push({ x0, x1, x2: x1 });
            return steps;
        }

        x2 = x1 - f_x1 * (x1 - x0) / (f_x1 - f_x0);
        steps.push({ x0, x1, x2 });

        if (math.abs(x2 - x1) < tol) {
            return steps;
        }

        x0 = x1;
        f_x0 = f_x1;
        x1 = x2;
        f_x1 = isStringFunc ? math.evaluate(func, {x: x1}) : func(x1);
    }
    return steps; // Return the steps taken
};

router.post('/secant', (req, res) => {
    const { optimizationType, expression, initialGuess, data, tolerance, maxIterations } = req.body;

    if (optimizationType === 'function') {
        if (!expression || !initialGuess) {
            return res.status(400).json({ error: 'Expression and initial guess are required for function optimization.' });
        }

        const { x0, x1 } = initialGuess;
        const result = secant(expression, x0, x1, tolerance, maxIterations);
        res.json({ steps: result });

    } else if (optimizationType === 'data') {
        if (!data || !initialGuess) {
            return res.status(400).json({ error: 'Data and initial guess are required for data optimization.' });
        }

        const interpolatedFunc = createInterpolatedFunction(data);
        const { x0, x1 } = initialGuess;
        const result = secant(interpolatedFunc, x0, x1, tolerance, maxIterations);
        res.json({ steps: result });

    } else {
        res.status(400).json({ error: 'Invalid optimization type.' });
    }
});

export default router;
