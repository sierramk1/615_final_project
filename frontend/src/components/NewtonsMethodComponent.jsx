import React, { useState, useEffect } from 'react';
import { newtonsMethod } from '../js/newtons_method.js';
import math from 'mathjs';

function NewtonsMethodComponent() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Define the Rosenbrock function and its derivatives
      const rosenbrock = (x) => {
        const a = 1 - x[0];
        const b = x[1] - x[0] ** 2;
        return a ** 2 + 100 * (b ** 2);
      };
      
      const rosenbrock_grad = (x) => {
        const g_x = -2 * (1 - x[0]) - 400 * x[0] * (x[1] - x[0] ** 2);
        const g_y = 200 * (x[1] - x[0] ** 2);
        return [g_x, g_y];
      };
      
      const rosenbrock_hess = (x) => {
        const h11 = 2 - 400 * x[1] + 1200 * x[0] ** 2;
        const h12 = -400 * x[0];
        const h21 = -400 * x[0];
        const h22 = 200;
        return [[h11, h12], [h21, h22]];
      };

      const x0 = [0, 0]; // Initial guess
      
      const res = newtonsMethod(rosenbrock, rosenbrock_grad, rosenbrock_hess, x0, 1e-6, 50);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0' }}>
      <h3>Newton's Method (Optimization) Component</h3>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : result ? (
        <p>
          Rosenbrock minimum is at: 
          <strong>[{result.xmin.map(v => v.toFixed(4)).join(', ')}]</strong> 
          in {result.iter} iterations.
        </p>
      ) : (
        <p>Calculating...</p>
      )}
    </div>
  );
}

export default NewtonsMethodComponent;
