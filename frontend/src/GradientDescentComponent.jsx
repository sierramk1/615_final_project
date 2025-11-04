import React, { useState, useEffect } from 'react';
import { gradientDescent } from '../js/gradient_descent.js';
import math from 'mathjs'; // Although used by the module, it's good practice to have it here.

function GradientDescentComponent() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Test with the Rosenbrock function, minimum at [1, 1]
      const rosenbrock = (x) => (1 - x[0])**2 + 100 * (x[1] - x[0]**2)**2;
      const rosenbrock_grad = (x) => [
        -2 * (1 - x[0]) - 400 * x[0] * (x[1] - x[0]**2),
        200 * (x[1] - x[0]**2)
      ];
      
      const res = gradientDescent(rosenbrock, rosenbrock_grad, [0, 0], 0.001, true, 1e-6, 10000);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0' }}>
      <h3>Gradient Descent Component</h3>
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

export default GradientDescentComponent;
