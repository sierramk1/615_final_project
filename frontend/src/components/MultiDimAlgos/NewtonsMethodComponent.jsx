import React, { useState, useEffect, useRef } from 'react';
import { newtonsMethod } from '../../js/newtons_method.js';
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
  Paper
} from '@mui/material';
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function NewtonsMethodComponent() {
  const [funcStr, setFuncStr] = useState('(1 - x)^2 + 100 * (y - x^2)^2');
  const [gradStr, setGradStr] = useState('[-2 + 2*x - 400*x*y + 400*x^3, 200*y - 200*x^2]');
  const [hessianStr, setHessianStr] = useState('[[2 - 400*y + 1200*x^2, -400*x], [-400*x, 200]]');
  const [initialGuessStr, setInitialGuessStr] = useState('0, 0');
  const [path, setPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const [showGraph, setShowGraph] = useState(true);
  const [numDimensions, setNumDimensions] = useState(2);
  const [convergenceData, setConvergenceData] = useState([]);
  const [iterationCount, setIterationCount] = useState(0);
  const [finalMinimum, setFinalMinimum] = useState(null);

  const handleDimChange = (e) => {
    const newDim = parseInt(e.target.value, 10);
    if (!isNaN(newDim) && newDim > 0) setNumDimensions(newDim);
  };

  const handleOptimize = () => {
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
          return result;
        } catch (err) {
          console.error('Error evaluating gradient:', err);
          throw new Error(`Error in gradient expression: ${err.message}`);
        }
      };

      const hessian = (vars) => {
        const scope = {};
        for (let i = 0; i < numDimensions; i++) {
          scope[`x${i + 1}`] = vars[i]; // x1, x2, ...
        }
        if (numDimensions === 2) {
          scope.x = vars[0];
          scope.y = vars[1];
        }

        try {
          const result = math.evaluate(hessianStr, scope);
          return result;
        } catch (err) {
          console.error('Error evaluating Hessian:', err);
          throw new Error(`Error in Hessian expression: ${err.message}`);
        }
      };


      try {
        const result = newtonsMethod(func, grad, hessian, initialGuess, 1e-6, 50);

        if (!result?.path) {
          alert("Newton's method failed. Check your function, gradient, and Hessian.");
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
          value: func(point),
        }));
        setConvergenceData(newConvergenceData);
        setCurrentStep(0);

      } catch (err) {
        console.warn("Newton's method failed:", err);
        alert("Newton's method failed: " + err.message);
        setPath([]);
        setConvergenceData([]);
        setCurrentStep(0);
        setIterationCount(0);
        setFinalMinimum(null);
      }
    } catch (error) {
      console.error('Error parsing function, gradient, or Hessian:', error);
      alert('Error parsing function, gradient, or Hessian: ' + error.message);
      setPath([]);
      setConvergenceData([]);
      setCurrentStep(0);
      setIterationCount(0);
      setFinalMinimum(null);
    }
  };

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     handleOptimize();
  //   }
  // }, [numDimensions]);


  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => (prev < path.length - 1 ? prev + 1 : prev));
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, path]);

  const plotFunc = (x, y) => {
    try {
      return math.evaluate(funcStr, { x, y });
    } catch (e) {
      return NaN;
    }
  };

  // Safe plotting arrays
  const x = [], y = [], z = [];
  if (numDimensions === 2) {
    for (let i = -2; i <= 2; i += 0.1) {
      const rowX = [], rowY = [], rowZ = [];
      for (let j = -1; j <= 3; j += 0.1) {
        rowX.push(i);
        rowY.push(j);
        rowZ.push(plotFunc(i, j));
      }
      x.push(rowX);
      y.push(rowY);
      z.push(rowZ);
    }
  }

  const pathX = path?.slice(0, currentStep + 1).map(p => p[0]) || [];
  const pathY = path?.slice(0, currentStep + 1).map(p => p[1]) || [];
  const pathZ = path?.slice(0, currentStep + 1).map(p => plotFunc(p[0], p[1])) || [];

  const plotData = numDimensions === 2 ? [
    { x, y, z, type: 'surface', colorscale: 'Viridis' },
    { x: pathX, y: pathY, z: pathZ, type: 'scatter3d', mode: 'lines+markers', line: { color: 'red', width: 4 }, marker: { size: 4, color: 'white' } }
  ] : [];

  const layout = {
    title: "Newton's Method Path",
    scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x, y)' } },
    autosize: true,
  };

  return (
    <Box sx={{ p: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Typography variant="body2" sx={{ fontSize: "1em", lineHeight: 1.75, marginBottom: 1 }}>
            Newton’s method leverages both first- and second-order derivatives — the gradient and the Hessian — to iteratively approximate the minimum of a function. Its quadratic convergence makes it fast, but the cost of computing and inverting the Hessian can be high for large problems.
          </Typography>
          <TextField label="Number of Dimensions" type="number" value={numDimensions} onChange={handleDimChange} fullWidth margin="normal" />
          <TextField label="Function f(x1, x2, ...)" value={funcStr} onChange={(e) => setFuncStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Gradient g(x1, x2, ...)" value={gradStr} onChange={(e) => setGradStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Hessian H(x1, x2, ...)" value={hessianStr} onChange={(e) => setHessianStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Initial Guess" value={initialGuessStr} onChange={(e) => setInitialGuessStr(e.target.value)} fullWidth margin="normal" />
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
                    {path.map((point, index) => (
                      <TableRow key={index}>
                        <TableCell>{index}</TableCell>
                        {point.map((coord, i) => (
                          <TableCell key={i}>{coord.toFixed(4)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
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
                  <h4>Multi-dimensional Newton's Method Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: '500px', overflowY: 'auto' }}
                  >
                    {`# Pseudocode for Multi-dimensional Newton's Method

**FUNCTION** NewtonsMethod(f, grad_f, hess_f, x0, tol, max_iter)

  // **INPUTS:**
  // f: The objective function to minimize.
  // grad_f: The gradient function of f.
  // hess_f: The Hessian matrix function of f.
  // x0: The initial starting point (vector).
  // tol: The tolerance for convergence.
  // max_iter: The maximum number of iterations.

  // **INITIALIZATION:**
  current_x = x0
  path = [x0] // Store the path for visualization

  // **ITERATION:**
  FOR iter FROM 1 TO max_iter DO
    // Calculate the gradient vector at the current point
    gradient_vector = grad_f(current_x)

    // Calculate the Hessian matrix at the current point
    hessian_matrix = hess_f(current_x)

    // Solve for the Newton step 's' using the equation: Hessian * s = -Gradient
    // This is equivalent to s = inverse(Hessian) * -Gradient
    TRY
      inverse_hessian = INVERT(hessian_matrix)
      step_s = MULTIPLY(inverse_hessian, NEGATE(gradient_vector))
    CATCH Error AS e
      OUTPUT "Error: Matrix inversion failed. Hessian may be singular."
      RETURN { convergence: false, path: path }
    END TRY

    // Calculate the next approximation
    next_x = SUBTRACT(current_x, step_s)

    // Add the next point to the path
    path.push(next_x)

    // Check for convergence (e.g., if the step size is small)
    IF NORM(SUBTRACT(next_x, current_x)) < tol THEN
      OUTPUT "Converged to a minimum."
      RETURN { xmin: next_x, convergence: true, iter: iter, path: path }
    END IF

    // Update for next iteration
    current_x = next_x

  END FOR

  // If max_iter reached without convergence
  OUTPUT "Newton's method did not converge after " + max_iter + " iterations."
  RETURN { xmin: current_x, convergence: false, iter: max_iter, path: path }

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

export default NewtonsMethodComponent;
