import React, { useState, useEffect, useCallback, useRef } from 'react';
import { goldenSearch } from '../js/golden_search.js'; // Now a generator
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function GoldenSearchComponent() {
  // Input states
  const [funcString, setFuncString] = useState('(x-2)^2'); // Default function
  const [aValue, setAValue] = useState('-1'); // Default 'a'
  const [cValue, setCValue] = useState('5'); // Default 'c'
  const [tolerance, setTolerance] = useState('1e-6');
  const [maxIterations, setMaxIterations] = useState('100');

  // State to trigger calculation automatically (removed manual trigger)
  // const [triggerCalculation, setTriggerCalculation] = useState(0);

  // Animation states
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Output states
  const [currentMin, setCurrentMin] = useState(null);
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
    setCurrentMin(null);
    setAnimationSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Parse inputs
    const a = parseFloat(aValue);
    const c = parseFloat(cValue);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    // Validate inputs
    if (isNaN(a) || isNaN(c) || isNaN(tol) || isNaN(maxIter)) {
      setError("Please enter valid numbers for all inputs.");
      return;
    }
    if (a >= c) {
      setError("'a' must be less than 'c'.");
      return;
    }

    try {
      const f_a = myFunction(a);
      const f_c = myFunction(c);

      if (isNaN(f_a) || isNaN(f_c)) {
        setError("Function evaluation failed for initial interval. Check your function string or interval.");
        return;
      }

      // Collect all steps from the generator
      const steps = Array.from(goldenSearch(myFunction, a, c, tol, maxIter));
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        // The minimum is either b or d from the last step
        const lastStep = steps[steps.length - 1];
        setCurrentMin(myFunction(lastStep.b) < myFunction(lastStep.d) ? lastStep.b : lastStep.d);
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = Math.min(a, c) - (Math.abs(c - a) * 0.5); 
      const initialPlotRangeEnd = Math.max(a, c) + (Math.abs(c - a) * 0.5);
      
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
  }, [funcString, aValue, cValue, tolerance, maxIterations, myFunction]); // Now depends directly on inputs

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

  // --- Plot Data Generation for Current Frame ---
  useEffect(() => {
    if (animationSteps.length === 0 || error || staticXBounds[0] === staticXBounds[1]) {
      setPlotData([]);
      return;
    }

    const currentStep = animationSteps[currentStepIndex];
    const { a, b, d, c } = currentStep;

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
      { // The active function segment (darker, thicker)
        x: x_plot_for_func.filter(x_val => x_val >= a && x_val <= c), // Filter for the full bracket
        y: x_plot_for_func.filter(x_val => x_val >= a && x_val <= c).map(x_val => myFunction(x_val)),
        type: 'scatter',
        mode: 'lines',
        name: 'f(x) in [a,c]',
        line: { color: 'blue', width: 3 } // Darker color, thicker line
      },
      { // Vertical line for 'a'
        x: [a, a],
        y: staticYBounds, 
        mode: 'lines',
        line: { color: 'red', dash: 'dash' },
        name: 'Current A'
      },
      { 
        x: [c, c],
        y: staticYBounds, 
        mode: 'lines',
        line: { color: 'red', dash: 'dash' },
        name: 'Current C'
      }
    ];

    // Determine which segment is kept/discarded for the *next* step
    if (currentStepIndex + 1 < animationSteps.length) {
        const nextStep = animationSteps[currentStepIndex + 1];
        const a_next = nextStep.a;
        const c_next = nextStep.c;

        if (a_next === a) { // The right part is discarded
            newPlotData.push({
                x: [a, c_next],
                y: [staticYBounds[0], staticYBounds[0]],
                mode: 'lines',
                line: { color: 'green', width: 5, opacity: 0.6 },
                name: 'Kept Segment'
            });
            newPlotData.push({
                x: [c_next, c],
                y: [staticYBounds[0], staticYBounds[0]],
                mode: 'lines',
                line: { color: 'red', width: 5, opacity: 0.6 },
                name: 'Discarded Segment'
            });
        } else { // The left part is discarded
            newPlotData.push({
                x: [a_next, c],
                y: [staticYBounds[0], staticYBounds[0]],
                mode: 'lines',
                line: { color: 'green', width: 5, opacity: 0.6 },
                name: 'Kept Segment'
            });
            newPlotData.push({
                x: [a, a_next],
                y: [staticYBounds[0], staticYBounds[0]],
                mode: 'lines',
                line: { color: 'red', width: 5, opacity: 0.6 },
                name: 'Discarded Segment'
            });
        }
    }

    // Plot inner points b and d
    newPlotData.push({
        x: [b, d],
        y: [myFunction(b), myFunction(d)],
        mode: 'markers',
        marker: { color: 'blue', size: 10, symbol: 'circle' },
        name: 'Inner Points'
    });

    setPlotData(newPlotData);

  }, [currentStepIndex, animationSteps, error, myFunction, staticXBounds, staticYBounds]);

  return (
    <div style={{ padding: '10px', margin: '20px 0' }}> {/* Removed border */}
      <h3 style={{ fontSize: '2em' }}>Golden Search</h3>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}> {/* Added gap */}
        <div style={{ width: '25%', paddingRight: '10px' }}> {/* Left side: Inputs and Controls */}
          {/* Description moved here */}
          <p style={{ marginBottom: '20px' }}>The Golden Section Search is a technique for finding the extremum (minimum or maximum) of a strictly unimodal function by successively narrowing the range of values inside which the extremum is known to exist. It uses the golden ratio (approximately 1.618) to determine the placement of test points, ensuring the interval shrinks by a constant factor at each step.</p>

          {/* Input fields */}
          <div style={{ marginBottom: '10px' }}>
            <label>Function f(x): <input type="text" value={funcString} onChange={(e) => setFuncString(e.target.value)} style={{ marginLeft: '10px', width: '200px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Interval a: <input type="number" value={aValue} onChange={(e) => setAValue(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Interval c: <input type="number" value={cValue} onChange={(e) => setCValue(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Tolerance: <input type="number" value={tolerance} onChange={(e) => setTolerance(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Max Iterations: <input type="number" value={maxIterations} onChange={(e) => setMaxIterations(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>

          {/* Iteration & Root Display */}
          {error ? (
            <p style={{ color: 'orange', marginTop: '10px' }}>Warning: {error}</p>
          ) : currentMin !== null ? (
            <p style={{ marginTop: '10px' }}><strong>Final Minimum:</strong> <strong>{currentMin.toFixed(6)}</strong></p>
          ) : (
            <p style={{ marginTop: '10px' }}>Enter function and interval to calculate minimum...</p>
          )}
          {animationSteps.length > 0 && !error && (
            <p>Iteration: {currentStepIndex + 1} / {animationSteps.length}</p>
          )}

          {/* Control Buttons */}
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}> 
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
            <button onClick={() => setShowGraph(!showGraph)} style={{ backgroundColor: '#72A8C8', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer' }}>
              {showGraph ? 'Show Pseudocode' : 'Show Graph'}
            </button>
          </div>
        </div>

        <div style={{ width: '75%', marginLeft: '40px' }}> {/* Right side: Graph or Pseudocode + Description */}
          {showGraph ? (
            plotData.length > 0 && !error && (
              <Plot
                data={plotData}
                layout={{
                  width: '100%', // Use 100% width to fill parent div
                  height: 600, // Increased height
                  title: `Plot of f(x) = ${funcString}`,
                  xaxis: { title: 'x', range: staticXBounds }, // Use static range
                  yaxis: { title: 'f(x)', range: staticYBounds }, // Use static range
                  hovermode: 'closest'
                }}
                config={{ responsive: true }}
              />
            )
          ) : (
            <div style={{ marginTop: '0px', padding: '10px', border: '1px solid black', backgroundColor: 'white' }}>
              <h4>Golden Section Search Pseudocode</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {`# Pseudocode for the Golden Section Search Method

This algorithm finds the extremum (minimum or maximum) of a strictly unimodal function by successively narrowing the range of values inside which the extremum is known to exist. It uses the golden ratio (approximately 1.618) to determine the placement of test points, ensuring the interval shrinks by a constant factor at each step.

**FUNCTION** GoldenSectionSearch(f, a, c, tol, max_iter)

  // **INPUTS:**
  // f: The unimodal function to minimize.
  // a, c: The endpoints of the interval [a, c] that brackets the minimum.
  // tol: The desired tolerance for the interval width.
  // max_iter: The maximum number of iterations.

  // **CONSTANTS:**
  // gr: The golden ratio (approximately 1.618)
  gr = (1 + sqrt(5)) / 2

  // **INITIALIZATION:**
  // Calculate the two inner points b and d using the golden ratio
  b = c - (c - a) / gr
  d = a + (c - a) / gr

  // **ITERATION:**
  FOR iter FROM 1 TO max_iter DO
    // Yield current state for visualization (a, b, d, c)

    // Check for convergence
    IF abs(c - a) < tol THEN
      RETURN (a + c) / 2 // Return the midpoint of the final interval
    END IF

    // Compare function values at inner points to narrow the bracket
    IF f(b) < f(d) THEN
      c = d // New bracket is [a, d]
    ELSE
      a = b // New bracket is [b, c]
    END IF

    // Recalculate inner points for the new, smaller bracket
    b = c - (c - a) / gr
    d = a + (c - a) / gr

  END FOR

  // If max_iter reached without convergence
  RETURN (a + c) / 2 // Return the midpoint of the last interval

**END FUNCTION**`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoldenSearchComponent;
