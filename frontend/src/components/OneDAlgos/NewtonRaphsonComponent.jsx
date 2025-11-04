import React, { useState, useEffect, useCallback, useRef } from "react";
import { newtonRaphson } from "../../js/newton_raphson.js";
import * as math from "mathjs";
import { TextField, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";

function NewtonRaphsonComponent() {
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 2");
  const [fpString, setFpString] = useState("3*x^2 - 1");
  const [x0Value, setX0Value] = useState("1.0");
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

  // Memoized derivative function from user input
  const myDerivativeFunction = useCallback(
    (x) => {
      try {
        return math.evaluate(fpString, { x: x });
      } catch (err) {
        console.warn("Invalid derivative expression:", fpString, err.message);
        return NaN;
      }
    },
    [fpString]
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
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    // Validate inputs
    const fields = {};
    let hasError = false;

    if (isNaN(x0)) {
      fields.x0 = true;
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
      const fp_x0 = myDerivativeFunction(x0);

      if (isNaN(f_x0) || isNaN(fp_x0)) {
        setError(
          "Function or derivative evaluation failed for initial guess. Check your function strings or initial guess."
        );
        setErrorFields({ funcString: true, fpString: true });
        return;
      }

      // Collect all steps from the generator
      const steps = Array.from(
        newtonRaphson(myFunction, myDerivativeFunction, x0, tol, maxIter)
      );
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        setCurrentRoot(steps[steps.length - 1].x1);
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = x0 - 2;
      const initialPlotRangeEnd = x0 + 2;

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
      setErrorFields({ funcString: true, fpString: true });
    }
  }, [
    funcString,
    fpString,
    x0Value,
    tolerance,
    maxIterations,
    myFunction,
    myDerivativeFunction,
  ]);

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
    const { x0, x1 } = currentStep;

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

    // Current point on the curve
    newPlotData.push({
      x: [x0],
      y: [myFunction(x0)],
      mode: "markers",
      marker: { color: "red", size: 10, symbol: "circle" },
      name: "Current Guess (x_n)",
    });

    // Tangent line
    const slope = myDerivativeFunction(x0);
    const intercept = myFunction(x0) - slope * x0;
    const tangent_y_values = x_plot_for_func.map((x) => slope * x + intercept);
    newPlotData.push({
      x: x_plot_for_func,
      y: tangent_y_values,
      mode: "lines",
      line: { color: "green", dash: "dash" },
      name: "Tangent Line",
    });

    // Next guess on x-axis
    newPlotData.push({
      x: [x1],
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
    myDerivativeFunction,
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
            The Newton-Raphson method is an iterative root-finding algorithm
            that uses the tangent line to approximate the function. Starting
            with an initial guess and its derivative, it calculates the tangent
            to the function at that point and finds where the tangent intersects
            the x-axis. This intersection point becomes the next, improved guess
            for the root.
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
            <Grid item xs={12}>
              <TextField
                label="Derivative f'(x)"
                value={fpString}
                onChange={(e) => setFpString(e.target.value)}
                error={errorFields.fpString}
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
              sx={{ marginTop: 1, fontSize: "1.2em" }}
            >
              <strong>Final Root:</strong>{" "}
              <strong>{currentRoot.toFixed(6)}</strong>
            </Typography>
          )}
          {!error && currentRoot === null && animationSteps.length === 0 && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "1.2em", color: "text.secondary" }}
            >
              Enter function and initial guess to calculate root...
            </Typography>
          )}
          {animationSteps.length > 0 && !error && (
            <Typography variant="body2" sx={{ fontSize: "1.2em" }}>
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
