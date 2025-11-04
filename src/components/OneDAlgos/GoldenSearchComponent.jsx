import React, { useState, useEffect, useCallback, useRef } from "react";
import { goldenSearch } from "../../js/golden_search.js";
import * as math from "mathjs";
import { TextField, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";

function GoldenSearchComponent() {
  // Input states
  const [funcString, setFuncString] = useState("(x-2)^2");
  const [aValue, setAValue] = useState("-1");
  const [cValue, setCValue] = useState("5");
  const [tolerance, setTolerance] = useState("1e-6");
  const [maxIterations, setMaxIterations] = useState("100");

  // Animation states
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Output states
  const [currentMin, setCurrentMin] = useState(null);
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
    const fields = {};
    let hasError = false;

    if (isNaN(a)) {
      fields.a = true;
      hasError = true;
    }
    if (isNaN(c)) {
      fields.c = true;
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

    if (a >= c) {
      setError("'a' must be less than 'c'.");
      setErrorFields({ a: true, c: true });
      return;
    }

    try {
      const f_a = myFunction(a);
      const f_c = myFunction(c);

      if (isNaN(f_a) || isNaN(f_c)) {
        setError(
          "Function evaluation failed for initial interval. Check your function string or interval."
        );
        setErrorFields({ funcString: true });
        return;
      }

      // Collect all steps from the generator
      const steps = Array.from(goldenSearch(myFunction, a, c, tol, maxIter));
      setAnimationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      if (steps.length > 0) {
        const lastStep = steps[steps.length - 1];
        setCurrentMin(
          myFunction(lastStep.b) < myFunction(lastStep.d)
            ? lastStep.b
            : lastStep.d
        );
      }

      // --- Calculate STATIC Plot Bounds ONCE for the initial interval ---
      const initialPlotRangeStart = Math.min(a, c) - Math.abs(c - a) * 0.5;
      const initialPlotRangeEnd = Math.max(a, c) + Math.abs(c - a) * 0.5;

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
  }, [funcString, aValue, cValue, tolerance, maxIterations, myFunction]);

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
    const { a, b, d, c } = currentStep;

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
        x: x_plot_for_func.filter((x_val) => x_val >= a && x_val <= c),
        y: x_plot_for_func
          .filter((x_val) => x_val >= a && x_val <= c)
          .map((x_val) => myFunction(x_val)),
        type: "scatter",
        mode: "lines",
        name: "f(x) in [a,c]",
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
        x: [c, c],
        y: staticYBounds,
        mode: "lines",
        line: { color: "red", dash: "dash" },
        name: "Current C",
      },
    ];

    // Determine which segment is kept/discarded for the *next* step
    if (currentStepIndex + 1 < animationSteps.length) {
      const nextStep = animationSteps[currentStepIndex + 1];
      const a_next = nextStep.a;
      const c_next = nextStep.c;

      if (a_next === a) {
        newPlotData.push({
          x: [a, c_next],
          y: [staticYBounds[0], staticYBounds[0]],
          mode: "lines",
          line: { color: "green", width: 5, opacity: 0.6 },
          name: "Kept Segment",
        });
        newPlotData.push({
          x: [c_next, c],
          y: [staticYBounds[0], staticYBounds[0]],
          mode: "lines",
          line: { color: "red", width: 5, opacity: 0.6 },
          name: "Discarded Segment",
        });
      } else {
        newPlotData.push({
          x: [a_next, c],
          y: [staticYBounds[0], staticYBounds[0]],
          mode: "lines",
          line: { color: "green", width: 5, opacity: 0.6 },
          name: "Kept Segment",
        });
        newPlotData.push({
          x: [a, a_next],
          y: [staticYBounds[0], staticYBounds[0]],
          mode: "lines",
          line: { color: "red", width: 5, opacity: 0.6 },
          name: "Discarded Segment",
        });
      }
    }

    newPlotData.push({
      x: [b, d],
      y: [myFunction(b), myFunction(d)],
      mode: "markers",
      marker: { color: "blue", size: 10, symbol: "circle" },
      name: "Inner Points",
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
            The Golden Section Search is a technique for finding the extremum
            (minimum or maximum) of a strictly unimodal function by
            successively narrowing the range of values inside which the extremum
            is known to exist. It uses the golden ratio (approximately 1.618)
            to determine the placement of test points, ensuring the interval
            shrinks by a constant factor at each step.
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
                label="Interval c"
                type="number"
                value={cValue}
                onChange={(e) => setCValue(e.target.value)}
                error={errorFields.c}
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
          {!error && currentMin !== null && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "0.85em" }}
            >
              <strong>Final Minimum:</strong>{" "}
              <strong>{currentMin.toFixed(6)}</strong>
            </Typography>
          )}
          {!error && currentMin === null && animationSteps.length === 0 && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "0.85em", color: "text.secondary" }}
            >
              Enter function and interval to calculate minimum...
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
                <h4>Golden Section Search Pseudocode</h4>
                <pre
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
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
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default GoldenSearchComponent;
