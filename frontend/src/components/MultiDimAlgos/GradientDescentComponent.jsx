import React, { useState, useEffect, useRef } from 'react';
import { gradientDescent } from '../../js/gradient_descent.js';
import GraphWithControls from '../common/GraphWithControls.jsx';
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  // Tooltip, // Removed
  // IconButton // Removed
} from '@mui/material';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Removed
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function GradientDescentComponent() {
  const [funcStr, setFuncStr] = useState('(1 - x)^2 + 100 * (y - x^2)^2');
  const [gradStr, setGradStr] = useState('[-2 * (1 - x) - 400 * x * (y - x^2), 200 * (y - x^2)]');
  const [initialGuessStr, setInitialGuessStr] = useState('0, 0');
  const [learningRate, setLearningRate] = useState(0.001);
  const [tolerance, setTolerance] = useState(1e-6);
  const [maxIterations, setMaxIterations] = useState(10000);
  // const [useArmijo, setUseArmijo] = useState(true); // Removed

  const [path, setPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const [showGraph, setShowGraph] = useState(true);
  const [numDimensions, setNumDimensions] = useState(2);
  const [convergenceData, setConvergenceData] = useState([]);
  const [iterationCount, setIterationCount] = useState(0);
  const [finalMinimum, setFinalMinimum] = useState(null);
  // const [isZoomedIn, setIsZoomedIn] = useState(true); // Removed

  const handleDimChange = (e) => {
    const newDim = parseInt(e.target.value, 10);
    if (!isNaN(newDim) && newDim > 0) setNumDimensions(newDim);
  };

  const handleOptimize = () => {
    console.log("handleOptimize called"); // Confirm function call
    try {
      const initialGuess = initialGuessStr.split(',').map(Number);
      if (initialGuess.length !== numDimensions) {
        alert(`Initial guess must have ${numDimensions} dimensions.`);
        return;
      }

      const func = (vars) => {
        const scope = {};
        for (let i = 0; i < numDimensions; i++) scope[`x${i + 1}`] = vars[i];
        if (numDimensions === 2) {
          scope.x = vars[0];
          scope.y = vars[1];
        }
        return math.evaluate(funcStr, scope);
      };

      const grad = (vars) => {
        const scope = {};
        for (let i = 0; i < numDimensions; i++) {
          scope[`x${i + 1}`] = vars[i]; // x1, x2, ...
        }
        if (numDimensions === 2) {
          scope.x = vars[0];
          scope.y = vars[1];
        }
        try {
          const result = math.evaluate(gradStr, scope);
          // math.evaluate returns a Matrix if the expression is an array, convert to Array
          return Array.isArray(result) ? result : result.toArray();
        } catch (err) {
          console.error('Error evaluating gradient:', err);
          throw new Error(`Error in gradient expression: ${err.message}`);
        }
      };

      // --- Validation Logic Integrated ---
      // Test initial guess with func and grad to catch immediate errors
      try {
        const initialFuncVal = func(initialGuess);
        const initialGradVal = grad(initialGuess);

        if (!isFinite(initialFuncVal) || initialGradVal.some(isNaN) || initialGradVal.some(v => !isFinite(v))) {
          alert("Initial function or gradient evaluation resulted in non-finite values (NaN/Infinity). Please check your function, gradient, and initial guess.");
          return;
        }
      } catch (validationError) {
        alert(`Error during initial function/gradient validation: ${validationError.message}. Please check your function and gradient strings.`);
        return;
      }
      // --- End Validation Logic ---

      try {
        // Pass false for update_step_size to disable internal step size updates
        const result = gradientDescent(func, grad, initialGuess, learningRate, false, tolerance, maxIterations);
        if (!result?.path || result.path.length === 0) {
          alert("Gradient Descent failed or returned an empty path. Check your function and gradient.");
          setPath([]);
          setConvergenceData([]);
          setCurrentStep(0);
          setIterationCount(0);
          setFinalMinimum(null);
          return;
        }

        setPath(result.path);
        setIterationCount(result.iter);
        setFinalMinimum(result.xmin);
        const newConvergenceData = result.path.map((point, i) => ({
          iteration: i,
          value: func(point), // Use the function to evaluate the value at each point in the path
        }));
        setConvergenceData(newConvergenceData);
        setCurrentStep(0);

      } catch (err) {
        console.warn("Gradient Descent failed:", err);
        alert("Gradient Descent failed: " + err.message);
        setPath([]);
        setConvergenceData([]);
        setCurrentStep(0);
        setIterationCount(0);
        setFinalMinimum(null);
      }
    } catch (error) {
      console.error('Error parsing function or gradient:', error);
      alert('Error parsing function or gradient: ' + error.message);
      setPath([]);
      setConvergenceData([]);
      setCurrentStep(0);
      setIterationCount(0);
      setFinalMinimum(null);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => (prev < path.length - 1 ? prev + 1 : prev));
      }, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, path]);

  const plotFunc = (x, y) => {
    if (!funcStr) { // If function string is empty, return 0 to avoid errors
      return 0;
    }
    try {
      return math.evaluate(funcStr, { x, y });
    } catch (e) {
      // If evaluation fails, return 0 to avoid errors
      return 0;
    }
  };

  // Safe plotting arrays
  const xCoords = [], yCoords = [], zCoords = [];
  if (numDimensions === 2) {
    for (let i = -2; i <= 2; i += 0.2) { // Reduced density
      const rowX = [], rowY = [], rowZ = [];
      for (let j = -1; j <= 3; j += 0.2) { // Reduced density
        rowX.push(i);
        rowY.push(j);
        rowZ.push(plotFunc(i, j));
      }
      xCoords.push(rowX);
      yCoords.push(rowY);
      zCoords.push(rowZ);
    }
  }

  const pathX = path?.slice(0, currentStep + 1).map(p => p[0]) || [];
  const pathY = path?.slice(0, currentStep + 1).map(p => p[1]) || [];
  const pathZ = path?.slice(0, currentStep + 1).map(p => plotFunc(p[0], p[1])) || [];

  const plotData = numDimensions === 2 ? [
    { x: xCoords, y: yCoords, z: zCoords, type: 'surface', colorscale: 'Viridis', opacity: 0.7 },
    { x: pathX, y: pathY, z: pathZ, type: 'scatter3d', mode: 'lines+markers', line: { color: 'red', width: 4 }, marker: { size: 4, color: 'white' } }
  ] : [];

  const layout = {
    title: "Gradient Descent Path",
    scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x, y)' } },
    autosize: true,
  };

  return (
    <Box sx={{ p: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Typography variant="body2" sx={{ fontSize: "1em", lineHeight: 1.75, marginBottom: 1 }}>
            Gradient Descent is a first-order iterative optimization algorithm for finding the local minimum of a differentiable function. It takes steps proportional to the negative of the gradient of the function at the current point. The learning rate (step size) is crucial for convergence.
          </Typography>
          <TextField label="Number of Dimensions" type="number" value={numDimensions} onChange={handleDimChange} fullWidth margin="normal" />
          <TextField label="Function f(x1, x2, ...)" value={funcStr} onChange={(e) => setFuncStr(e.target.value)} fullWidth margin="normal" placeholder="(1 - x)^2 + 100 * (y - x^2)^2" />
          <TextField label="Gradient g(x1, x2, ...)" value={gradStr} onChange={(e) => setGradStr(e.target.value)} fullWidth margin="normal" placeholder="[-2 * (1 - x) - 400 * x * (y - x^2), 200 * (y - x^2)]" />
          <TextField label="Initial Guess (comma-separated)" value={initialGuessStr} onChange={(e) => setInitialGuessStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Learning Rate (alpha)" type="number" value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} fullWidth margin="normal" inputProps={{ step: "0.0001" }} />
          <TextField label="Tolerance" type="number" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} fullWidth margin="normal" inputProps={{ step: "1e-7" }} />
          <TextField label="Max Iterations" type="number" value={maxIterations} onChange={(e) => setMaxIterations(Number(e.target.value))} fullWidth margin="normal" />
          {/* Removed Armijo Line Search */}
          <Button 
            onClick={handleOptimize} 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2, backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}
          >
            Optimize
          </Button>
          {path.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                <strong>Minimum:</strong> <strong>[{finalMinimum?.map(v => v.toFixed(4)).join(', ')}]</strong>
              </Typography>
              <Typography variant="body1">
                Iteration: {currentStep > 0 ? currentStep : 0} / {path.length - 1}
              </Typography>
            </Box>
          )}
          {path.length > 0 && (
            <Box sx={{ mt: 2, overflowX: 'auto', bgcolor: 'background.paper' }}>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Iteration</TableCell>
                      {Array.from({ length: numDimensions }, (_, i) => (
                        <TableCell key={i}>x{i + 1}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {path.map((point, index) => {
                      // Sampling logic for table display
                      const isFirstTen = index < 10;
                      const isEveryTenthUpToHundred = index >= 10 && index < 100 && index % 10 === 0;
                      const isEveryHundredthUpToThousand = index >= 100 && index < 1000 && index % 100 === 0;
                      const isEveryThousandthAfterThousand = index >= 1000 && index % 1000 === 0;
                      const isLastIteration = index === path.length - 1;

                      if (isFirstTen || isEveryTenthUpToHundred || isEveryHundredthUpToThousand || isEveryThousandthAfterThousand || isLastIteration) {
                        return (
                          <TableRow key={index}>
                            <TableCell>{index}</TableCell>
                            {point.map((coord, i) => (
                              <TableCell key={i}>{coord.toFixed(4)}</TableCell>
                            ))}
                          </TableRow>
                        );
                      }
                      return null;
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          <Box sx={{ height: '100px' }} />
        </Grid>

        {/* Graph */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          {numDimensions === 2 && (
            <GraphWithControls
              plotData={plotData}
              layout={layout}
              showGraph={showGraph}
              onToggleGraph={() => setShowGraph(!showGraph)}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onPrevStep={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              onNextStep={() => setCurrentStep(prev => Math.min(path.length - 1, prev + 1))}
              onReset={() => setCurrentStep(0)}
              animationSteps={path}
              currentStepIndex={currentStep}
              pseudocodeContent={
                <>
                  <h4>Multi-dimensional Gradient Descent Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: '500px', overflowY: 'auto' }}
                  >
                    {`# Pseudocode for Multi-dimensional Gradient Descent

**FUNCTION** GradientDescent(f, grad_f, x0, alpha, tol, max_iter)

  // **INPUTS:**
  // f: The objective function to minimize.
  // grad_f: The gradient function of f.
  // x0: The initial starting point (vector).
  // alpha: The learning rate (step size).
  // tol: The tolerance for convergence.
  // max_iter: The maximum number of iterations.

  // **INITIALIZATION:**
  current_x = x0
  path = [x0] // Store the path for visualization

  // **ITERATION:**
  FOR iter FROM 1 TO max_iter DO
    // Calculate the gradient vector at the current point
    gradient_vector = grad_f(current_x)

    // Check for convergence based on gradient norm
    IF NORM(gradient_vector) < tol THEN
      OUTPUT "Converged to a minimum (gradient norm below tolerance)."
      RETURN { xmin: current_x, fval: f(current_x), iter: iter, path: path }
    END IF

    // Calculate the next approximation
    next_x = SUBTRACT(current_x, MULTIPLY(alpha, gradient_vector))

    // Add the next point to the path
    path.push(next_x)

    // Check for convergence based on step size
    IF NORM(SUBTRACT(next_x, current_x)) < tol THEN
      OUTPUT "Converged to a minimum (step size below tolerance)."
      RETURN { xmin: next_x, fval: f(next_x), iter: iter, path: path }
    END IF

    // Update for next iteration
    current_x = next_x

  END FOR

  // If max_iter reached without convergence
  OUTPUT "Gradient Descent did not converge after " + max_iter + " iterations."
  RETURN { xmin: current_x, fval: f(current_x), iter: max_iter, path: path }

**END FUNCTION**`}
                  </pre>
                </>
              }
            />
          )}
          {numDimensions !== 2 && (
            <Plot
              data={[
                { x: convergenceData?.map(d => d.iteration) || [], y: convergenceData?.map(d => d.value) || [], type: 'scatter', mode: 'lines+markers' },
              ]}
              layout={{ title: 'Function Value vs. Iteration', xaxis: { title: 'Iteration' }, yaxis: { title: 'Function Value' } }}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default GradientDescentComponent;
