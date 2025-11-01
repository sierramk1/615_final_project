import React, { useState, useEffect, useCallback, useRef } from 'react';
import { newtonRaphson } from '../js/newton_raphson.js'; // Now a generator
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function NewtonRaphsonComponent() {
  // Input states
  const [funcString, setFuncString] = useState('x^3 - x - 2');
  const [fpString, setFpString] = useState('3*x^2 - 1'); // Derivative string
  const [x0Value, setX0Value] = useState('1.0');
  const [tolerance, setTolerance] = useState('1e-6');
  const [maxIterations, setMaxIterations] = useState('100');

  // State to trigger calculation manually
  const [triggerCalculation, setTriggerCalculation] = useState(0);

  // Animation states
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Output states
  const [currentRoot, setCurrentRoot] = useState(null);
  const [error, setError] = useState(null);
  const [plotData, setPlotData] = useState([]);

  // Plot scaling states
  const [staticXBounds, setStaticXBounds] = useState([0, 0]);
  const [staticYBounds, setStaticYBounds] = useState([0, 0]);

  // Toggle state for graph/description
  const [showGraph, setShowGraph] = useState(true);

  // Memoized function from user input
  const myFunction = useCallback((x) => {
    try {
      return math.evaluate(funcString, { x: x });
    } catch (err) {
      console.warn("Invalid expression:", funcString, err.message);
      return NaN; 
    }
  }, [funcString]);

  // Memoized derivative function from user input
  const myDerivativeFunction = useCallback((x) => {
    try {
      return math.evaluate(fpString, { x: x });
    } catch (err) {
      console.warn("Invalid derivative expression:", fpString, err.message);
      return NaN; 
    }
  }, [fpString]);

  // --- Algorithm Execution and Step Generation ---
  useEffect(() => {
    // Reset states
    setError(null);
    setCurrentRoot(null);
    setAnimationSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Parse inputs
    const x0 = parseFloat(x0Value);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    // Validate inputs
    if (isNaN(x0) || isNaN(tol) || isNaN(maxIter)) {
      setError("Please enter valid numbers for all inputs.");
      return;
    }

    try {
      const f_x0 = myFunction(x0);
      const fp_x0 = myDerivativeFunction(x0);

      if (isNaN(f_x0) || isNaN(fp_x0)) {
        setError("Function or derivative evaluation failed for initial guess. Check your function strings or initial guess.");
        return;
      }

      // Collect all steps from the generator
      const steps = Array.from(newtonRaphson(myFunction, myDerivativeFunction, x0, tol, maxIter));
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        setCurrentRoot(steps[steps.length - 1].x1); // Final root is the last x1
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = x0 - 2; // Extend range a bit
      const initialPlotRangeEnd = x0 + 2;
      
      const numPoints = 200;
      const x_temp_plot = Array.from({ length: numPoints }, (_, i) => initialPlotRangeStart + i * (initialPlotRangeEnd - initialPlotRangeStart) / (numPoints - 1));
      const y_temp_plot = x_temp_plot.map(x => myFunction(x));
      
      const finiteYValues = y_temp_plot.filter(y => isFinite(y));
      if (finiteYValues.length === 0) {
          setStaticYBounds([-1, 1]); 
      } else {
          const yMin = Math.min(...finiteYValues);
          const yMax = Math.max(...finiteYValues);
          const yAxisPadding = (yMax - yMin) * 0.1 || 0.1; 
          setStaticYBounds([yMin - yAxisPadding, yMax + yAxisPadding]);
      }
      setStaticXBounds([initialPlotRangeStart, initialPlotRangeEnd]);

    } catch (e) {
      setError(e.message);
    }
  }, [triggerCalculation, funcString, fpString, x0Value, tolerance, maxIterations, myFunction, myDerivativeFunction]);

  // --- Animation Control and Navigations ---
  useEffect(() => {
    if (isPlaying && animationSteps.length > 0 && currentStepIndex < animationSteps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prevIndex) => prevIndex + 1);
      }, 700); 
    } else if (currentStepIndex >= animationSteps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, animationSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(animationSteps.length - 1, prev + 1));
  };

  const handleCalculate = () => { // NEW: Calculate button handler
    setTriggerCalculation(prev => prev + 1);
  };

  // --- Plot Data Generation for Current Frame ---
  useEffect(() => {
    if (animationSteps.length === 0 || error || staticXBounds[0] === staticXBounds[1]) {
      setPlotData([]);
      return;
    }

    const currentStep = animationSteps[currentStepIndex];
    const { x0, x1 } = currentStep;

    const numPoints = 200;
    const x_plot_for_func = Array.from({ length: numPoints }, (_, i) => staticXBounds[0] + i * (staticXBounds[1] - staticXBounds[0]) / (numPoints - 1));
    const y_plot_for_func = x_plot_for_func.map(x => myFunction(x));

    const newPlotData = [
      { 
        x: x_plot_for_func,
        y: y_plot_for_func,
        type: 'scatter',
        mode: 'lines',
        name: 'f(x)',
        line: { color: 'lightblue', width: 1 } 
      },
      { // Horizontal line at y=0 for root
        x: staticXBounds,
        y: [0, 0],
        mode: 'lines',
        line: { color: 'gray', dash: 'dot' },
        name: 'y=0'
      }
    ];

    // Current point on the curve
    newPlotData.push({
      x: [x0],
      y: [myFunction(x0)],
      mode: 'markers',
      marker: { color: 'red', size: 10, symbol: 'circle' },
      name: 'Current Guess (x_n)'
    });

    // Tangent line
    const slope = myDerivativeFunction(x0);
    const intercept = myFunction(x0) - slope * x0;
    const tangent_y_values = x_plot_for_func.map(x => slope * x + intercept);
    newPlotData.push({
      x: x_plot_for_func,
      y: tangent_y_values,
      mode: 'lines',
      line: { color: 'green', dash: 'dash' },
      name: 'Tangent Line'
    });

    // Next guess on x-axis
    newPlotData.push({
      x: [x1],
      y: [0],
      mode: 'markers',
      marker: { color: 'purple', size: 10, symbol: 'circle' },
      name: 'Next Guess (x_n+1)'
    });

    setPlotData(newPlotData);

  }, [currentStepIndex, animationSteps, error, myFunction, myDerivativeFunction, staticXBounds, staticYBounds]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0' }}>
      <h3 style={{ fontSize: '2em' }}>Newton-Raphson Method</h3>
      <p>The Newton-Raphson method is an iterative root-finding algorithm that uses the tangent line to approximate the function. Starting with an initial guess and its derivative, it calculates the tangent to the function at that point and finds where the tangent intersects the x-axis. This intersection point becomes the next, improved guess for the root.</p>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '45%', paddingRight: '10px' }}> {/* Left side: Inputs and Controls */}
          <div>
            <label>Function f(x): <input type="text" value={funcString} onChange={(e) => setFuncString(e.target.value)} style={{ marginLeft: '10px', width: '200px' }} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Derivative f'(x): <input type="text" value={fpString} onChange={(e) => setFpString(e.target.value)} style={{ marginLeft: '10px', width: '200px' }} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Initial Guess x0: <input type="number" value={x0Value} onChange={(e) => setX0Value(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Tolerance: <input type="number" value={tolerance} onChange={(e) => setTolerance(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
            <label style={{ marginLeft: '20px' }}>Max Iterations: <input type="number" value={maxIterations} onChange={(e) => setMaxIterations(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>

          <div style={{ marginTop: '15px' }}>
            <button onClick={handleCalculate} disabled={false} style={{ marginRight: '10px' }}>Calculate</button>
            <button onClick={handlePlayPause} disabled={animationSteps.length < 2 || error}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={handlePrevStep} disabled={currentStepIndex === 0 || error} style={{ marginLeft: '10px' }}>
              Prev Step
            </button>
            <button onClick={handleNextStep} disabled={currentStepIndex >= animationSteps.length - 1 || error} style={{ marginLeft: '10px' }}>
              Next Step
            </button>
            <button onClick={handleReset} disabled={animationSteps.length === 0 || error} style={{ marginLeft: '10px' }}>
              Reset
            </button>
            {animationSteps.length > 0 && !error && (
              <span style={{ marginLeft: '10px' }}>Iteration: {currentStepIndex + 1} / {animationSteps.length}</span>
            )}
            <button onClick={() => setShowGraph(!showGraph)} style={{ marginLeft: '10px' }}>
              {showGraph ? 'Show Pseudocode' : 'Show Graph'}
            </button>
          </div>

          {error ? (
            <p style={{ color: 'orange', marginTop: '10px' }}>Warning: {error}</p>
          ) : currentRoot !== null ? (
            <p style={{ marginTop: '10px' }}>Final Root: <strong>{currentRoot.toFixed(6)}</strong></p>
          ) : (
            <p style={{ marginTop: '10px' }}>Enter function and initial guess to calculate root...</p>
          )}
        </div>

        <div style={{ width: '55%' }}> {/* Right side: Graph or Pseudocode */}
          {showGraph ? (
            plotData.length > 0 && !error && (
              <Plot
                data={plotData}
                layout={{
                  width: 800,
                  height: 500,
                  title: `Plot of f(x) = ${funcString}`,
                  xaxis: { title: 'x', range: staticXBounds }, // Use static range
                  yaxis: { title: 'f(x)', range: staticYBounds }, // Use static range
                  hovermode: 'closest'
                }}
                config={{ responsive: true }}
              />
            )
          ) : (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc' }}>
              <h4>Newton-Raphson Method Pseudocode</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {`# Pseudocode for the Newton-Raphson Method

This algorithm finds successively better approximations to the roots (or zeroes) of a real-valued function. It starts with an initial guess and uses the function's value and its derivative to find the next approximation.

**FUNCTION** NewtonRaphson(f, fp, x0, tol, max_iter)

  // **INPUTS:**
  // f: The function for which we are finding a root.
  // fp: The first derivative of the function f.
  // x0: The initial guess for the root.
  // tol: The desired tolerance for convergence.
  // max_iter: The maximum number of iterations.

  // **INITIALIZATION:**
  current_x = x0

  // Check if initial guess is already the root
  IF abs(f(current_x)) < tol THEN
    RETURN current_x
  END IF

  // **ITERATION:**
  FOR iter FROM 1 TO max_iter DO
    f_x = f(current_x)
    fp_x = fp(current_x)

    // Check for derivative near zero (potential division by zero or flat region)
    IF abs(fp_x) < tol THEN
      OUTPUT "Error: Derivative is too close to zero."
      RETURN null
    END IF

    // Calculate the next approximation using the Newton-Raphson formula
    next_x = current_x - (f_x / fp_x)

    // Yield current state for visualization (current_x, next_x)

    // Check for convergence
    IF abs(next_x - current_x) < tol THEN
      RETURN next_x
    END IF

    // Update for next iteration
    current_x = next_x

  END FOR

  // If max_iter reached without convergence
  OUTPUT "Newton-Raphson method did not converge after " + max_iter + " iterations."
  RETURN null

**END FUNCTION**`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewtonRaphsonComponent;
