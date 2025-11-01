import React, { useState, useEffect, useCallback, useRef } from 'react';
import { secant } from '../js/secant.js'; // Now a generator
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function SecantComponent() {
  // Input states
  const [funcString, setFuncString] = useState('x^3 - x - 2');
  const [x0Value, setX0Value] = useState('1.0');
  const [x1Value, setX1Value] = useState('2.0');
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
    const x1 = parseFloat(x1Value);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    // Validate inputs
    if (isNaN(x0) || isNaN(x1) || isNaN(tol) || isNaN(maxIter)) {
      setError("Please enter valid numbers for all inputs.");
      return;
    }

    try {
      const f_x0 = myFunction(x0);
      const f_x1 = myFunction(x1);

      if (isNaN(f_x0) || isNaN(f_x1)) {
        setError("Function evaluation failed for initial guesses. Check your function string or initial guesses.");
        return;
      }

      // Collect all steps from the generator
      const steps = Array.from(secant(myFunction, x0, x1, tol, maxIter));
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        setCurrentRoot(steps[steps.length - 1].x2); // Final root is the last x2
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = Math.min(x0, x1) - (Math.abs(x1 - x0) * 0.5); 
      const initialPlotRangeEnd = Math.max(x0, x1) + (Math.abs(x1 - x0) * 0.5);
      
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
  }, [triggerCalculation, funcString, x0Value, x1Value, tolerance, maxIterations, myFunction]);

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
    const { x0, x1, x2 } = currentStep;

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

    // Plot current points on the curve
    newPlotData.push({
      x: [x0, x1],
      y: [myFunction(x0), myFunction(x1)],
      mode: 'markers',
      marker: { color: 'red', size: 10, symbol: 'circle' },
      name: 'Current Points (x0, x1)'
    });

    // Secant line
    const slope = (myFunction(x1) - myFunction(x0)) / (x1 - x0);
    const intercept = myFunction(x0) - slope * x0;
    const secant_y_values = x_plot_for_func.map(x => slope * x + intercept);
    newPlotData.push({
      x: x_plot_for_func,
      y: secant_y_values,
      mode: 'lines',
      line: { color: 'green', dash: 'dash' },
      name: 'Secant Line'
    });

    // Next guess on x-axis
    newPlotData.push({
      x: [x2],
      y: [0],
      mode: 'markers',
      marker: { color: 'purple', size: 10, symbol: 'circle' },
      name: 'Next Guess (x2)'
    });

    setPlotData(newPlotData);

  }, [currentStepIndex, animationSteps, error, myFunction, staticXBounds, staticYBounds]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '20px 0' }}>
      <h3 style={{ fontSize: '2em' }}>Secant Method</h3>
      <p>The Secant method is a root-finding algorithm that uses a succession of roots of secant lines to better approximate a root of a function. It is similar to Newton's method but avoids the need for an analytical derivative by approximating it with a finite difference.</p>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '45%', paddingRight: '10px' }}> {/* Left side: Inputs and Controls */}
          <div>
            <label>Function f(x): <input type="text" value={funcString} onChange={(e) => setFuncString(e.target.value)} style={{ marginLeft: '10px', width: '200px' }} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Initial Guess x0: <input type="number" value={x0Value} onChange={(e) => setX0Value(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
            <label style={{ marginLeft: '20px' }}>Initial Guess x1: <input type="number" value={x1Value} onChange={(e) => setX1Value(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
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
            <p style={{ marginTop: '10px' }}>Enter function and initial guesses to calculate root...</p>
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
              <h4>Secant Method Pseudocode</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {`# Pseudocode for the Secant Method

This algorithm is a root-finding method that uses a succession of roots of secant lines to better approximate a root of a function. It is similar to Newton's method but avoids the need for an analytical derivative.

**FUNCTION** Secant(f, x0, x1, tol, max_iter)

  // **INPUTS:**
  // f: The function for which we are finding a root.
  // x0, x1: Two initial guesses for the root.
  // tol: The desired tolerance for convergence.
  // max_iter: The maximum number of iterations.

  // **INITIALIZATION:**
  current_x0 = x0
  current_x1 = x1

  // Check if initial guesses are already roots
  IF abs(f(current_x0)) < tol THEN
    RETURN current_x0
  END IF
  IF abs(f(current_x1)) < tol THEN
    RETURN current_x1
  END IF

  // **ITERATION:**
  FOR iter FROM 1 TO max_iter DO
    f_x0 = f(current_x0)
    f_x1 = f(current_x1)

    // Check for function values being too close (potential division by zero)
    IF abs(f_x1 - f_x0) < tol THEN
      OUTPUT "Error: Function values at the two points are too close."
      RETURN null
    END IF

    // Calculate the next approximation using the Secant formula
    next_x = current_x1 - (f_x1 * (current_x1 - current_x0)) / (f_x1 - f_x0)

    // Yield current state for visualization (current_x0, current_x1, next_x)

    // Check for convergence
    IF abs(next_x - current_x1) < tol THEN
      RETURN next_x
    END IF

    // Update for next iteration
    current_x0 = current_x1
    current_x1 = next_x

  END FOR

  // If max_iter reached without convergence
  OUTPUT "Secant method did not converge after " + max_iter + " iterations."
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

export default SecantComponent;
