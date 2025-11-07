
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, Button, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";
import Spline from 'cubic-spline';
import * as math from 'mathjs';

function GoldenSearchComponent({ optimizationType, data }) {
  // Input states
  const [funcString, setFuncString] = useState("(x-2)^2");
  const [aValue, setAValue] = useState("-1");
  const [bValue, setBValue] = useState("5");
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

    const a = parseFloat(aValue);
    const b = parseFloat(bValue);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    const payload = {
      optimizationType,
      initialGuess: { a, b },
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
      const response = await fetch('http://localhost:8000/api/optimize/golden-search', {
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
        const lastStep = resData.steps[resData.steps.length - 1];
        const finalResult = myFunction(lastStep.b) < myFunction(lastStep.d) ? lastStep.b : lastStep.d;
        setResult(finalResult);
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
    const a = parseFloat(aValue);
    const b = parseFloat(bValue);

    if (isNaN(a) || isNaN(b) || a >= b) {
        setPlotData([]);
        return;
    }

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
        const { a: currentA, b: currentB, c: currentC, d: currentD } = currentStep;

        // Kept and Discarded Intervals
        const keptInterval = (myFunction(currentB) < myFunction(currentD)) ? [currentA, currentD] : [currentB, currentC];
        const discardedInterval = (myFunction(currentB) < myFunction(currentD)) ? [currentD, currentC] : [currentA, currentB];

        newPlotData.push({
          x: [discardedInterval[0], discardedInterval[1], discardedInterval[1], discardedInterval[0], discardedInterval[0]],
          y: [staticYBounds[0], staticYBounds[0], staticYBounds[1], staticYBounds[1], staticYBounds[0]],
          type: 'scatter',
          fill: 'toself',
          fillcolor: 'rgba(255, 0, 0, 0.2)',
          line: { color: 'transparent' },
          name: 'Discarded Interval',
        });

        newPlotData.push({
          x: [keptInterval[0], keptInterval[1], keptInterval[1], keptInterval[0], keptInterval[0]],
          y: [staticYBounds[0], staticYBounds[0], staticYBounds[1], staticYBounds[1], staticYBounds[0]],
          type: 'scatter',
          fill: 'toself',
          fillcolor: 'rgba(0, 255, 0, 0.2)',
          line: { color: 'transparent' },
          name: 'Kept Interval',
        });

        // Active segment
        const x_active_segment = x_temp_plot.filter(
          (x_val) => x_val >= currentA && x_val <= currentC
        );
        const y_active_segment = x_active_segment.map((x_val) => myFunction(x_val));

        newPlotData.push({
          x: x_active_segment,
          y: y_active_segment,
          type: "scatter",
          mode: "lines",
          name: "f(x) in [a,c]",
          line: { color: "blue", width: 3 },
        });

        // Current A and C lines
        newPlotData.push({
          x: [currentA, currentA],
          y: staticYBounds,
          mode: "lines",
          line: { color: "red", dash: "dash" },
          name: "Current A",
        });
        newPlotData.push({
          x: [currentC, currentC],
          y: staticYBounds,
          mode: "lines",
          line: { color: "red", dash: "dash" },
          name: "Current C",
        });

        // Inner points
        newPlotData.push({
          x: [currentB, currentD],
          y: [myFunction(currentB), myFunction(currentD)],
          mode: "markers",
          marker: { color: "blue", size: 10, symbol: "circle" },
          name: "Inner Points",
        });

        // Y=0 line
        newPlotData.push({
          x: staticXBounds,
          y: [0, 0],
          mode: "lines",
          line: { color: "gray", dash: "dot" },
          name: "y=0",
        });
      }
      setPlotData(newPlotData);

  }, [funcString, aValue, bValue, optimizationType, data, myFunction, result, animationSteps, currentStepIndex]);

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
            The Golden Section Search is a technique for finding the extremum (minimum or maximum) of a strictly unimodal function.
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
          </Grid>

          <Button onClick={handleOptimize} variant="contained" sx={{ backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}>Optimize</Button>

          {result !== null && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "1.2em" }}
            >
              <strong>Final Minimum:</strong>{" "}
              <strong>{result.toFixed(6)}</strong>
            </Typography>
          )}
          {animationSteps.length > 0 && (
            <Typography variant="body2" sx={{ marginTop: 1, fontSize: "1.2em" }}>
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
