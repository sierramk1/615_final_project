import React, { useState, useEffect, useCallback, useRef } from 'react';
import { secant } from '../js/secant.js'; // Now a generator
import * as math from 'mathjs'; // FIXED: Corrected import syntax
import Plot from 'react-plotly.js';

function SecantComponent() {
  // Input states
  const [funcString, setFuncString] = useState('x^3 - x - 2');
  const [x0Value, setX0Value] = useState('1.0');
  const [x1Value, setX1Value] = useState('2.0');
  const [tolerance, setTolerance] = useState('1e-6');
  const [maxIterations, setMaxIterations] = useState('100');
  const [mode, setMode] = useState("symbolic"); // symbolic or data
  const [dataPoints, setDataPoints] = useState([]);


  // State to trigger calculation automatically (removed manual trigger)
  // const [triggerCalculation, setTriggerCalculation] = useState(0);

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

  // --- File Upload Handler ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/upload-data", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setDataPoints(data.points); // store x,y pairs from backend 
  };

  // --- FUNCTION FOR ALGORITHM ---
    const myFunction = useCallback((x) => {
      if (mode === "symbolic") {
        try {
          return math.evaluate(funcString, { x });
        } catch (err) {
          console.warn("Invalid function:", err.message);
          return NaN;
        }
      } else if (mode === "data") {
        if (!dataPoints || dataPoints.length === 0) return NaN;
        for (let i = 0; i < dataPoints.length - 1; i++) {
          const p1 = dataPoints[i];
          const p2 = dataPoints[i + 1];
          if (x >= p1.x && x <= p2.x) {
            const t = (x - p1.x) / (p2.x - p1.x);
            return p1.y + t * (p2.y - p1.y);
          }
        }
        return NaN; // outside range
      }
    }, [mode, funcString, dataPoints]);

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
  }, [funcString, x0Value, x1Value, tolerance, maxIterations, myFunction]); // Now depends directly on inputs

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
      name: 'Next Guess (x_n+1)'
    });

    setPlotData(newPlotData);

  }, [currentStepIndex, animationSteps, error, myFunction, staticXBounds, staticYBounds]);

  return (
    <div style={{ padding: '10px', margin: '20px 0' }}> {/* Removed border */}
      {/* Removed h3 title */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '40px' }}> {/* Removed justifyContent: 'space-between' */}
        <div style={{ width: '25%', paddingRight: '10px' }}> {/* Left side: Inputs and Controls */}
          {/* Description moved here */}
          <p style={{ marginBottom: '20px' }}>The Secant method is a root-finding algorithm that uses a succession of roots of secant lines to better approximate a root of a function. It is similar to Newton's method but avoids the need for an analytical derivative by approximating it with a finite difference.</p>

          {/* Input fields */}
          <div style={{ marginBottom: '10px' }}>
            <label>Function f(x): <input type="text" value={funcString} onChange={(e) => setFuncString(e.target.value)} style={{ marginLeft: '10px', width: '200px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Function Source: </label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="symbolic">User Typed Function</option>
              <option value="data">Use Uploaded Data</option>
            </select>
          </div>
          {mode === "data" && (
            <div style={{ marginBottom: '10px' }}>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <label>Initial Guess x0: <input type="number" value={x0Value} onChange={(e) => setX0Value(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Initial Guess x1: <input type="number" value={x1Value} onChange={(e) => setX1Value(e.target.value)} style={{ marginLeft: '10px', width: '80px' }} /></label>
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
          ) : currentRoot !== null ? (
            <p style={{ marginTop: '10px' }}><strong>Final Root:</strong> <strong>{currentRoot.toFixed(6)}</strong></p>
          ) : (
            <p style={{ marginTop: '10px' }}>Enter function and initial guesses to calculate root...</p>
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
              <h4>Secant Method Pseudocode</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {`# Pseudocode for the Secant Method

This algorithm is a root-finding method that uses a succession of roots of secant lines to better approximate a root of a function. It is similar to Newton's method but avoids the need for an analytical derivative by approximating it with a finite difference.

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
