
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, Button, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";
import Spline from 'cubic-spline';
import * as math from 'mathjs';

function SecantComponent({ optimizationType, data }) {
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 2");
  const [x0Value, setX0Value] = useState("1.0");
  const [x1Value, setX1Value] = useState("2.0");
  const [tolerance, setTolerance] = useState("1e-6");
  const [maxIterations, setMaxIterations] = useState("100");

  // Animation states
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Output states
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorFields, setErrorFields] = useState({});
  const [plotData, setPlotData] = useState([]);

  // Plot scaling states
  const [staticXBounds, setStaticXBounds] = useState([0, 0]);
  const [staticYBounds, setStaticYBounds] = useState([0, 0]);

  // Toggle state for graph/description
  const [showGraph, setShowGraph] = useState(true);

  const handleOptimize = async () => {
    setError(null);
    setErrorFields({});
    setResult(null);
    setAnimationSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const x0 = parseFloat(x0Value);
    const x1 = parseFloat(x1Value);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    const payload = {
      optimizationType,
      initialGuess: { x0, x1 },
      tolerance: tol,
      maxIterations: maxIter,
    };

    if (optimizationType === 'function') {
      payload.expression = funcString;
    } else if (optimizationType === 'data') {
      if (!data) {
        setError("Please upload a data file.");
        return;
      }
      payload.data = data;
    }

    try {
      const response = await fetch('http://localhost:8000/api/optimize/secant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        setError(resData.error || 'An error occurred.');
      } else {
        setAnimationSteps(resData.steps);
        setResult(resData.steps[resData.steps.length - 1].x2);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  const myFunction = useCallback(
    (x) => {
        if (optimizationType === 'function') {
            try {
                return math.evaluate(funcString, { x: x });
            } catch (err) {
                return NaN;
            }
        } else if (optimizationType === 'data' && data) {
            const xs = data.map(p => p.x);
            const ys = data.map(p => p.y);
            const spline = new Spline(xs, ys);
            return spline.at(x);
        }
        return NaN;
    },
    [funcString, optimizationType, data]
  );

  // --- Animation Control and Navigations ---
  useEffect(() => {
    if (
      isPlaying &&
      animationSteps.length > 0 &&
      currentStepIndex < animationSteps.length - 1
    ) {
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
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) =>
      Math.min(animationSteps.length - 1, prev + 1)
    );
  };

  useEffect(() => {
    const x0 = parseFloat(x0Value);
    const x1 = parseFloat(x1Value);

    if (isNaN(x0) || isNaN(x1)) {
        setPlotData([]);
        return;
    }

    const initialPlotRangeStart = Math.min(x0, x1) - 2;
    const initialPlotRangeEnd = Math.max(x0, x1) + 2;

    const numPoints = 200;
    const x_temp_plot = Array.from(
      { length: numPoints },
      (_, i) =>
        initialPlotRangeStart +
        (i * (initialPlotRangeEnd - initialPlotRangeStart)) / (numPoints - 1)
    );
    const y_temp_plot = x_temp_plot.map((x) => myFunction(x));

    const finiteYValues = y_temp_plot.filter((y) => isFinite(y));
    if (finiteYValues.length === 0) {
      setStaticYBounds([-1, 1]);
    } else {
      const yMin = Math.min(...finiteYValues);
      const yMax = Math.max(...finiteYValues);
      const yAxisPadding = (yMax - yMin) * 0.1 || 0.1;
      setStaticYBounds([yMin - yAxisPadding, yMax + yAxisPadding]);
    }
    setStaticXBounds([initialPlotRangeStart, initialPlotRangeEnd]);

    const newPlotData = [
        {
          x: x_temp_plot,
          y: y_temp_plot,
          type: "scatter",
          mode: "lines",
          name: optimizationType === 'function' ? `f(x) = ${funcString}` : 'Interpolated Function',
        },
      ];

      if (animationSteps.length > 0) {
        const currentStep = animationSteps[currentStepIndex];
        const { x0: currentX0, x1: currentX1, x2: currentX2 } = currentStep;

        // Plot current points on the curve
        newPlotData.push({
          x: [currentX0, currentX1],
          y: [myFunction(currentX0), myFunction(currentX1)],
          mode: "markers",
          marker: { color: "red", size: 10, symbol: "circle" },
          name: "Current Points (x0, x1)",
        });

        // Secant line
        const slope = (myFunction(currentX1) - myFunction(currentX0)) / (currentX1 - currentX0);
        const intercept = myFunction(currentX0) - slope * currentX0;
        const secant_y_values = x_temp_plot.map((x) => slope * x + intercept);
        newPlotData.push({
          x: x_temp_plot,
          y: secant_y_values,
          mode: "lines",
          line: { color: "green", dash: "dash" },
          name: "Secant Line",
        });

        // Next guess on x-axis
        newPlotData.push({
          x: [currentX2],
          y: [0],
          mode: "markers",
          marker: { color: "purple", size: 10, symbol: "circle" },
          name: "Next Guess (x_n+1)",
        });
      }
      setPlotData(newPlotData);

  }, [funcString, x0Value, x1Value, optimizationType, data, myFunction, result, animationSteps, currentStepIndex]);

  return (
    <div
      style={{
        padding: "0px",
        margin: "0px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: "20px",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            width: "40%",
            paddingRight: "10px",
            marginLeft: "20px",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "1em", lineHeight: 1.75, marginBottom: 1 }}
          >
            The Secant method is a root-finding algorithm that uses a succession of roots of secant lines to better approximate a root of a function.
          </Typography>

          <Grid container spacing={2} sx={{ width: "100%" }}>
            {optimizationType === 'function' && (
                <>
                <Grid item xs={12}>
                <TextField
                    label="Function f(x)"
                    value={funcString}
                    onChange={(e) => setFuncString(e.target.value)}
                    error={errorFields.funcString}
                    variant="outlined"
                    size="small"
                    fullWidth
                />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Tolerance"
                    type="number"
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                    error={errorFields.tolerance}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Iterations"
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
                    error={errorFields.maxIterations}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
                </>
            )}
            <Grid item xs={6}>
              <TextField
                label="Initial Guess x0"
                type="number"
                value={x0Value}
                onChange={(e) => setX0Value(e.target.value)}
                error={errorFields.x0}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Initial Guess x1"
                type="number"
                value={x1Value}
                onChange={(e) => setX1Value(e.target.value)}
                error={errorFields.x1}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          <Button onClick={handleOptimize} variant="contained" sx={{ backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}>Optimize</Button>

          {result !== null && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "1.2em" }}
            >
              <strong>Final Root:</strong>{" "}
              <strong>{result.toFixed(6)}</strong>
            </Typography>
          )}
          {animationSteps.length > 0 && (
            <Typography variant="body2" sx={{ fontSize: "1.2em" }}>
              Iteration: {currentStepIndex + 1} / {animationSteps.length}
            </Typography>
          )}

          {error && (
            <Alert
              severity="warning"
              sx={{ fontSize: "1em", padding: "12px", marginTop: 1 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <div
          style={{
            width: "60%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <GraphWithControls
            plotData={plotData}
            layout={{
              width: "100%",
              height: "100%",
              title: {
                text: optimizationType === 'function' ? `Plot of f(x) = ${funcString}`: 'Plot of Interpolated Function',
                font: { size: 14 },
              },
              xaxis: {
                title: { text: "x", font: { size: 12 } },
                range: staticXBounds,
              },
              yaxis: {
                title: { text: "f(x)", font: { size: 12 } },
                range: staticYBounds,
              },
              hovermode: "closest",
              margin: { l: 50, r: 30, t: 40, b: 40 },
              autosize: true,
            }}
            config={{ responsive: true }}
            showGraph={showGraph}
            onToggleGraph={() => setShowGraph(!showGraph)}
            animationSteps={animationSteps}
            currentStepIndex={currentStepIndex}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleReset}
            pseudocodeContent={
                <>
                  <h4>Secant Method Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
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
                </>
              }
          />
        </div>
      </div>
    </div>
  );
}

export default SecantComponent;
