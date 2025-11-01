import React, { useState, useEffect, useCallback, useRef } from 'react';
import { bisection } from '../js/bisection.js'; // Now a generator
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

// Custom hook for debouncing values (no longer used for main calculation, but kept for reference if needed elsewhere)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function BisectionComponent() {
  // Input states
  const [funcString, setFuncString] = useState('x*x - 4');
  const [aValue, setAValue] = useState('0');
  const [bValue, setBValue] = useState('5');
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
      return NaN; // Return a function that always returns NaN on error
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
    const a = parseFloat(aValue);
    const b = parseFloat(bValue);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    // Validate inputs
    if (isNaN(a) || isNaN(b) || isNaN(tol) || isNaN(maxIter)) {
      setError("Please enter valid numbers for all inputs.");
      return;
    }
    if (a >= b) {
      setError("'a' must be less than 'b'.");
      return;
    }

    try {
      const f_a = myFunction(a);
      const f_b = myFunction(b);

      if (isNaN(f_a) || isNaN(f_b)) {
        setError("Function evaluation failed for initial interval. Check your function string or interval.");
        return;
      }

      if (f_a * f_b >= 0) {
        setError("f(a) and f(b) must have opposite signs for bisection to work.");
        return;
      }
      
      // Collect all steps from the generator
      const steps = Array.from(bisection(myFunction, a, b, tol, maxIter));
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        setCurrentRoot(steps[steps.length - 1].mid); // Final root is the last midpoint
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = Math.min(a, b) - (Math.abs(b - a) * 0.5); 
      const initialPlotRangeEnd = Math.max(a, b) + (Math.abs(b - a) * 0.5);
      
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
  }, [triggerCalculation, funcString, aValue, bValue, tolerance, maxIterations, myFunction]); // DEPENDS ON triggerCalculation and input values

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
    const { a, b, mid } = currentStep;

    const numPoints = 200;
    const x_plot_for_func = Array.from({ length: numPoints }, (_, i) => staticXBounds[0] + i * (staticXBounds[1] - staticXBounds[0]) / (numPoints - 1));
    const y_plot_for_func = x_plot_for_func.map(x => myFunction(x));

    const x_active_segment = x_plot_for_func.filter(x_val => x_val >= a && x_val <= b);
    const y_active_segment = x_active_segment.map(x_val => myFunction(x_val));

    const newPlotData = [
      { 
        x: x_plot_for_func,
        y: y_plot_for_func,
        type: 'scatter',
        mode: 'lines',
        name: 'f(x)',
        line: { color: 'lightblue', width: 1 } 
      },
      { 
        x: x_active_segment,
        y: y_active_segment,
        type: 'scatter',
        mode: 'lines',
        name: 'f(x) in [a,b]',
        line: { color: 'blue', width: 3 } 
      },
      { 
        x: [a, a],
        y: staticYBounds, 
        mode: 'lines',
        line: { color: 'red', dash: 'dash' },
        name: 'Current A'
      },
      { 
        x: [b, b],
        y: staticYBounds, 
        mode: 'lines',
        line: { color: 'red', dash: 'dash' },
        name: 'Current B'
      }
    ];

    if (mid !== null) {
      newPlotData.push({ 
        x: [mid],
        y: [myFunction(mid)],
        mode: 'markers',
        marker: { color: 'green', size: 10, symbol: 'circle' },
        name: 'Midpoint'
      });
      newPlotData.push({ 
        x: staticXBounds,
        y: [0, 0],
        mode: 'lines',
        line: { color: 'gray', dash: 'dot' },
        name: 'y=0'
      });
    }
    setPlotData(newPlotData);

  }, [currentStepIndex, animationSteps, error, myFunction, staticXBounds, staticYBounds]);

  return (
    <div style={{ border: 'none', padding: '10px', margin: '20px 0' }}> {/* Removed border */}
      <h3 style={{ fontSize: '2em' }}>Bisection Method</h3>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '45%', paddingRight: '10px' }}> {/* Left side: Inputs and Controls */}
          <p style={{ marginBottom: '20px' }}>The Bisection Method is a root-finding algorithm that repeatedly bisects an interval and then selects a subinterval in which a root must lie for further processing. It requires the function to be continuous and for the initial interval [a, b] to have f(a) and f(b) with opposite signs, guaranteeing a root within that interval.</p>
          <div>
            <label>Function f(x): <input type="text" value={funcString} onChange={(e) => setFuncString(e.target.value)} style={{ marginLeft: '10px', width: '200px' }} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Interval a: <input type="number" value={aValue} onChange={(e) => setAValue(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
            <label style={{ marginLeft: '20px' }}>Interval b: <input type="number" value={bValue} onChange={(e) => setBValue(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Tolerance: <input type="number" value={tolerance} onChange={(e) => setTolerance(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
            <label style={{ marginLeft: '20px' }}>Max Iterations: <input type="number" value={maxIterations} onChange={(e) => setMaxIterations(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Changed to column layout */}
            <button onClick={handleCalculate} disabled={false} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>Calculate</button>
            <button onClick={handlePlayPause} disabled={animationSteps.length < 2 || error} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={handlePrevStep} disabled={currentStepIndex === 0 || error} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>
              Prev Step
            </button>
            <button onClick={handleNextStep} disabled={currentStepIndex >= animationSteps.length - 1 || error} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>
              Next Step
            </button>
            <button onClick={handleReset} disabled={animationSteps.length === 0 || error} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>
              Reset
            </button>
            {animationSteps.length > 0 && !error && (
              <span style={{ marginLeft: '10px' }}>Iteration: {currentStepIndex + 1} / {animationSteps.length}</span>
            )}
            <button onClick={() => setShowGraph(!showGraph)} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>
              {showGraph ? 'Show Pseudocode' : 'Show Graph'}
            </button>
          </div>

          {error ? (
            <p style={{ color: 'orange', marginTop: '10px' }}>Warning: {error}</p>
          ) : currentRoot !== null ? (
            <p style={{ marginTop: '10px' }}>Final Root: <strong>{currentRoot.toFixed(6)}</strong></p>
          ) : (
            <p style={{ marginTop: '10px' }}>Enter function and interval to calculate root...</p>
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
              <h4>Bisection Method Pseudocode</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {`# Pseudocode for the Bisection Method

This algorithm is a root-finding method that repeatedly bisects an interval and then selects a subinterval in which a root must lie for further processing. It requires the function to be continuous and for the initial interval [a, b] to have f(a) and f(b) with opposite signs, guaranteeing a root within that interval.

**FUNCTION** Bisection(f, a, b, tol, max_iter)
  
  // **INPUTS:**
  // f: The function for which we are finding a root.
  // a, b: The endpoints of the interval [a, b].
  // tol: The desired tolerance (how close to the root we need to be).
  // max_iter: The maximum number of iterations.

  // **PRECONDITION:** Check if a root is guaranteed to be in the interval.
  // This requires f(a) and f(b) to have opposite signs.
  IF f(a) * f(b) >= 0 THEN
    OUTPUT "Error: Root is not guaranteed in this interval (f(a) and f(b) must have opposite signs)."
    RETURN null
  END IF

  // Initialize iteration counter
  iterations = 0

  // Loop until the maximum number of iterations is reached
  WHILE iterations < max_iter DO
    // Calculate the midpoint of the interval
    c = (a + b) / 2

    // **CHECK FOR CONVERGENCE:**
    // 1. If the function value at the midpoint is very close to zero.
    // 2. If the width of the interval is smaller than the tolerance.
    IF f(c) == 0 OR (b - a) / 2 < tol THEN
      OUTPUT "Root found."
      RETURN c
    END IF

    // **UPDATE THE INTERVAL:**
    // If the sign change is between a and c, the root is in the left half.
    IF f(a) * f(c) < 0 THEN
      b = c // The new interval is [a, c]
    // Otherwise, the root is in the right half.
    ELSE
      a = c // The new interval is [c, b]
    END IF

    // Increment the iteration counter
    iterations = iterations + 1

  END WHILE

  // If the loop completes without convergence, the method has failed.
  OUTPUT "Method failed to converge after " + max_iter + " iterations." 
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

export default BisectionComponent;
