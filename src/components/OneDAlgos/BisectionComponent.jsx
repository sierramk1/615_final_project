import React, { useState, useEffect, useCallback, useRef } from "react";
import { bisection } from "../../js/bisection.js"; // Now a generator
import * as math from "mathjs";
import { TextField, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";

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
  const [funcString, setFuncString] = useState("x*x - 4");
  const [aValue, setAValue] = useState("0");
  const [bValue, setBValue] = useState("5");
  const [tolerance, setTolerance] = useState("1e-6");
  const [maxIterations, setMaxIterations] = useState("100");

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
        return NaN; // Return a function that always returns NaN on error
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
    const a = parseFloat(aValue);
    const b = parseFloat(bValue);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    // Validate inputs
    const fields = {};
    let hasError = false;

    if (isNaN(a)) {
      fields.a = true;
      hasError = true;
    }
    if (isNaN(b)) {
      fields.b = true;
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

    if (a >= b) {
      setError("'a' must be less than 'b'.");
      setErrorFields({ a: true, b: true });
      return;
    }

    try {
      const f_a = myFunction(a);
      const f_b = myFunction(b);

      if (isNaN(f_a) || isNaN(f_b)) {
        setError(
          "Function evaluation failed for initial interval. Check your function string or interval."
        );
        setErrorFields({ funcString: true });
        return;
      }

      if (f_a * f_b >= 0) {
        setError(
          "f(a) and f(b) must have opposite signs for bisection to work."
        );
        setErrorFields({ a: true, b: true });
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
      const initialPlotRangeStart = Math.min(a, b) - Math.abs(b - a) * 0.5;
      const initialPlotRangeEnd = Math.max(a, b) + Math.abs(b - a) * 0.5;

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
  }, [funcString, aValue, bValue, tolerance, maxIterations, myFunction]); // Now depends directly on inputs

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
    const { a, b, mid } = currentStep;

    const numPoints = 200;
    const x_plot_for_func = Array.from(
      { length: numPoints },
      (_, i) =>
        staticXBounds[0] +
        (i * (staticXBounds[1] - staticXBounds[0])) / (numPoints - 1)
    );
    const y_plot_for_func = x_plot_for_func.map((x) => myFunction(x));

    const x_active_segment = x_plot_for_func.filter(
      (x_val) => x_val >= a && x_val <= b
    );
    const y_active_segment = x_active_segment.map((x_val) => myFunction(x_val));

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
        x: x_active_segment,
        y: y_active_segment,
        type: "scatter",
        mode: "lines",
        name: "f(x) in [a,b]",
        line: { color: "blue", width: 3 },
      },
      {
        x: [a, a],
        y: staticYBounds,
        mode: "lines",
        line: { color: "red", dash: "dash" },
        name: "Current A",
      },
      {
        x: [b, b],
        y: staticYBounds,
        mode: "lines",
        line: { color: "red", dash: "dash" },
        name: "Current B",
      },
    ];

    if (mid !== null) {
      newPlotData.push({
        x: [mid],
        y: [myFunction(mid)],
        mode: "markers",
        marker: { color: "green", size: 10, symbol: "circle" },
        name: "Midpoint",
      });
      newPlotData.push({
        x: staticXBounds,
        y: [0, 0],
        mode: "lines",
        line: { color: "gray", dash: "dot" },
        name: "y=0",
      });
    }
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
            The Bisection Method is a root-finding algorithm that repeatedly
            bisects an interval and then selects a sub-interval in which a root
            must lie for further processing. It requires the function to be
            continuous and for the initial interval [a, b] to have f(a) and f(b)
            with opposite signs, guaranteeing a root within that interval.
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
                label="Interval a"
                type="number"
                value={aValue}
                onChange={(e) => setAValue(e.target.value)}
                error={errorFields.a}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Interval b"
                type="number"
                value={bValue}
                onChange={(e) => setBValue(e.target.value)}
                error={errorFields.b}
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
              Enter function and interval to calculate root...
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
          {" "}
          {/* Right side: Graph or Pseudocode + Description */}
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
                <h4>Bisection Method Pseudocode</h4>
                <pre
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
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
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default BisectionComponent;
