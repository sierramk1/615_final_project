import React, { useState, useEffect, useCallback, useRef } from "react";
import { secant } from "../../js/secant.js";
import * as math from "mathjs";
import { TextField, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";

function SecantComponent() {
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
  const [currentRoot, setCurrentRoot] = useState(null);
  const [error, setError] = useState(null);
  const [errorFields, setErrorFields] = useState({});
  const [plotData, setPlotData] = useState([]);

  // Plot scaling states
  const [staticXBounds, setStaticXBounds] = useState([0, 0]);
  const [staticYBounds, setStaticYBounds] = useState([0, 0]);

  // Toggle state for graph/description
  const [showGraph, setShowGraph] = useState(true);

  // Memoized function from user input
  const myFunction = useCallback(
    (x) => {
      try {
        return math.evaluate(funcString, { x: x });
      } catch (err) {
        console.warn("Invalid expression:", funcString, err.message);
        return NaN;
      }
    },
    [funcString]
  );

  // --- Algorithm Execution and Step Generation ---
  useEffect(() => {
    // Reset states
    setError(null);
    setErrorFields({});
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
    const fields = {};
    let hasError = false;

    if (isNaN(x0)) {
      fields.x0 = true;
      hasError = true;
    }
    if (isNaN(x1)) {
      fields.x1 = true;
      hasError = true;
    }
    if (isNaN(tol)) {
      fields.tolerance = true;
      hasError = true;
    }
    if (isNaN(maxIter)) {
      fields.maxIterations = true;
      hasError = true;
    }

    if (hasError) {
      setError("Please enter valid numbers for all inputs.");
      setErrorFields(fields);
      return;
    }

    try {
      const f_x0 = myFunction(x0);
      const f_x1 = myFunction(x1);

      if (isNaN(f_x0) || isNaN(f_x1)) {
        setError(
          "Function evaluation failed for initial guesses. Check your function string or initial guesses."
        );
        setErrorFields({ funcString: true });
        return;
      }

      // Collect all steps from the generator
      const steps = Array.from(secant(myFunction, x0, x1, tol, maxIter));
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        setCurrentRoot(steps[steps.length - 1].x2);
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = Math.min(x0, x1) - Math.abs(x1 - x0) * 0.5;
      const initialPlotRangeEnd = Math.max(x0, x1) + Math.abs(x1 - x0) * 0.5;

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
    } catch (e) {
      setError(e.message);
      setErrorFields({ funcString: true });
    }
  }, [funcString, x0Value, x1Value, tolerance, maxIterations, myFunction]);

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

  // --- Plot Data Generation for Current Frame ---
  useEffect(() => {
    if (
      animationSteps.length === 0 ||
      error ||
      staticXBounds[0] === staticXBounds[1]
    ) {
      setPlotData([]);
      return;
    }

    const currentStep = animationSteps[currentStepIndex];
    const { x0, x1, x2 } = currentStep;

    const numPoints = 200;
    const x_plot_for_func = Array.from(
      { length: numPoints },
      (_, i) =>
        staticXBounds[0] +
        (i * (staticXBounds[1] - staticXBounds[0])) / (numPoints - 1)
    );
    const y_plot_for_func = x_plot_for_func.map((x) => myFunction(x));

    const newPlotData = [
      {
        x: x_plot_for_func,
        y: y_plot_for_func,
        type: "scatter",
        mode: "lines",
        name: "f(x)",
        line: { color: "lightblue", width: 1 },
      },
      {
        x: staticXBounds,
        y: [0, 0],
        mode: "lines",
        line: { color: "gray", dash: "dot" },
        name: "y=0",
      },
    ];

    // Plot current points on the curve
    newPlotData.push({
      x: [x0, x1],
      y: [myFunction(x0), myFunction(x1)],
      mode: "markers",
      marker: { color: "red", size: 10, symbol: "circle" },
      name: "Current Points (x0, x1)",
    });

    // Secant line
    const slope = (myFunction(x1) - myFunction(x0)) / (x1 - x0);
    const intercept = myFunction(x0) - slope * x0;
    const secant_y_values = x_plot_for_func.map((x) => slope * x + intercept);
    newPlotData.push({
      x: x_plot_for_func,
      y: secant_y_values,
      mode: "lines",
      line: { color: "green", dash: "dash" },
      name: "Secant Line",
    });

    // Next guess on x-axis
    newPlotData.push({
      x: [x2],
      y: [0],
      mode: "markers",
      marker: { color: "purple", size: 10, symbol: "circle" },
      name: "Next Guess (x_n+1)",
    });

    setPlotData(newPlotData);
  }, [
    currentStepIndex,
    animationSteps,
    error,
    myFunction,
    staticXBounds,
    staticYBounds,
  ]);

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
          {/* Description */}
          <Typography
            variant="body2"
            sx={{ fontSize: "1em", lineHeight: 1.75, marginBottom: 1 }}
          >
            The Secant method is a root-finding algorithm that uses a
            succession of roots of secant lines to better approximate a root of
            a function. It is similar to Newton's method but avoids the need
            for an analytical derivative by approximating it with a finite
            difference.
          </Typography>

          {/* Input fields */}
          <Grid container spacing={2} sx={{ width: "100%" }}>
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
          </Grid>

          {/* Iteration & Root Display */}
          {!error && currentRoot !== null && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "0.85em" }}
            >
              <strong>Final Root:</strong>{" "}
              <strong>{currentRoot.toFixed(6)}</strong>
            </Typography>
          )}
          {!error && currentRoot === null && animationSteps.length === 0 && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "0.85em", color: "text.secondary" }}
            >
              Enter function and initial guesses to calculate root...
            </Typography>
          )}
          {animationSteps.length > 0 && !error && (
            <Typography variant="body2" sx={{ fontSize: "0.85em" }}>
              Iteration: {currentStepIndex + 1} / {animationSteps.length}
            </Typography>
          )}

          {/* Error Alert - at the bottom */}
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
                text: `Plot of f(x) = ${funcString}`,
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
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleReset}
            animationSteps={animationSteps}
            currentStepIndex={currentStepIndex}
            error={error}
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

