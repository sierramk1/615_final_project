
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, Button, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";
import * as math from 'mathjs';
import { solveNewtonRaphson } from '../../js/newton_raphson.js';
import { createInterpolatedFunction } from '../../js/utils.js';

function NewtonRaphsonComponent({ optimizationType, data }) {
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 2");
  const [x0Value, setX0Value] = useState("1.0");
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
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    try {
      // Call the client-side solveNewtonRaphson function
      const resultSteps = solveNewtonRaphson(
        optimizationType,
        funcString, // expression
        x0,          // initialGuess
        data,        // data (will be used if optimizationType is 'data')
        tol,         // tolerance
        maxIter      // maxIterations
      );

      setAnimationSteps(resultSteps);
      setResult(resultSteps[resultSteps.length - 1].x1);

    } catch (err) {
      setError(err.message || 'An error occurred during optimization.');
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
            // Use the client-side createInterpolatedFunction
            const interpolatedFunc = createInterpolatedFunction(data);
            return interpolatedFunc(x);
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

    if (isNaN(x0)) {
        setPlotData([]);
        return;
    }

    const initialPlotRangeStart = x0 - 5;
    const initialPlotRangeEnd = x0 + 5;

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
        const { x0: currentX0, x1: currentX1 } = currentStep;

        // Current point on the curve
        newPlotData.push({
          x: [currentX0],
          y: [myFunction(currentX0)],
          mode: "markers",
          marker: { color: "red", size: 10, symbol: "circle" },
          name: "Current Guess (x_n)",
        });

        // Tangent line (numerical derivative for interpolated function)
        const h = 1e-5;
        const slope = (myFunction(currentX0 + h) - myFunction(currentX0 - h)) / (2 * h);
        const intercept = myFunction(currentX0) - slope * currentX0;
        const tangent_y_values = x_temp_plot.map((x) => slope * x + intercept);
        newPlotData.push({
          x: x_temp_plot,
          y: tangent_y_values,
          mode: "lines",
          line: { color: "green", dash: "dash" },
          name: "Tangent Line",
        });

        // Next guess on x-axis
        newPlotData.push({
          x: [currentX1],
          y: [0],
          mode: "markers",
          marker: { color: "purple", size: 10, symbol: "circle" },
          name: "Next Guess (x_n+1)",
        });
      }
      setPlotData(newPlotData);

  }, [funcString, x0Value, optimizationType, data, myFunction, result, animationSteps, currentStepIndex]);

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
            The Newton-Raphson method is an iterative root-finding algorithm that uses the tangent line to approximate the function.
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
            <Grid item xs={12}>
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
                  <h4>Newton-Raphson Method Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
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
                </>
              }
          />
        </div>
      </div>
    </div>
  );
}

export default NewtonRaphsonComponent;

