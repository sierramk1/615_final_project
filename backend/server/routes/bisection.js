
import express from 'express';
import * as math from 'mathjs';
import { createInterpolatedFunction } from '../utils.js';

const router = express.Router();

// Bisection method implementation
const bisection = (func, a, b, tol = 1e-5, maxIter = 100) => {
    const steps = [];
    let c;
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        steps.push({ a, b, c });
        if (b - a < tol) {
            return steps;
        }
        const fa = typeof func === 'string' ? math.evaluate(func, {x: a}) : func(a);
        const fc = typeof func === 'string' ? math.evaluate(func, {x: c}) : func(c);

        if (fa * fc < 0) {
            b = c;
        } else {
            a = c;
        }
    }
    return steps;
};

router.post('/bisection', (req, res) => {
    const { optimizationType, expression, initialGuess, data, tolerance, maxIterations } = req.body;

    if (optimizationType === 'function') {
        if (!expression || !initialGuess) {
            return res.status(400).json({ error: 'Expression and initial guess are required for function optimization.' });
        }

        const { a, b } = initialGuess;
        const result = bisection(expression, a, b, tolerance, maxIterations);
        res.json({ steps: result });

    } else if (optimizationType === 'data') {
        if (!data || !initialGuess) {
            return res.status(400).json({ error: 'Data and initial guess are required for data optimization.' });
        }

        const interpolatedFunc = createInterpolatedFunction(data);
        const { a, b } = initialGuess;
        const result = bisection(interpolatedFunc, a, b, tolerance, maxIterations);
        res.json({ steps: result });

    } else {
        res.status(400).json({ error: 'Invalid optimization type.' });
    }
});

export default router;
