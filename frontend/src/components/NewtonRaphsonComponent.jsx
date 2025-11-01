import React, { useState, useEffect } from 'react';
import { newtonRaphson } from '../js/newton_raphson.js';

function NewtonRaphsonComponent() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Test function: f(x) = x^3 - x - 2
      const f = (x) => x**3 - x - 2;
      // Derivative: f'(x) = 3x^2 - 1
      const fp = (x) => 3*x**2 - 1;
      
      const res = newtonRaphson(f, fp, 1.0);
      
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0' }}>
      <h3>Newton-Raphson Component</h3>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : result ? (
        <p>The calculated root of f(x) = x³ - x - 2 is: <strong>{result.root.toFixed(6)}</strong></p>
      ) : (
        <p>Calculating...</p>
      )}
    </div>
  );
}

export default NewtonRaphsonComponent;
