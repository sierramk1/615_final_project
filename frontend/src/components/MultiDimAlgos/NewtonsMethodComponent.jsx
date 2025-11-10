import React, { useState, useEffect, useRef } from 'react';
import { newtonsMethod } from '../../js/newtons_method.js';
import GraphWithControls from '../common/GraphWithControls.jsx';
import { TextField, Button, Box, Grid, Typography } from '@mui/material';
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function NewtonsMethodComponent() {
  const [funcStr, setFuncStr] = useState('(1 - x)^2 + 100 * (y - x^2)^2');
  const [gradStr, setGradStr] = useState('[-2 * (1 - x) - 400 * x * (y - x^2), 200 * (y - x^2)]');
  const [hessianStr, setHessianStr] = useState('[[2 - 400 * y + 1200 * x^2, -400 * x], [-400 * x, 200]]');
  const [initialGuessStr, setInitialGuessStr] = useState('0, 0');
  const [path, setPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const [showGraph, setShowGraph] = useState(true);
  const [numDimensions, setNumDimensions] = useState(2);
  const [convergenceData, setConvergenceData] = useState([]);

  const handleDimChange = (e) => {
    const newDim = parseInt(e.target.value, 10);
    if (!isNaN(newDim) && newDim > 0) {
      setNumDimensions(newDim);
    }
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
        for (let i = 0; i < numDimensions; i++) {
          scope[`x${i + 1}`] = vars[i];
        }
        if (numDimensions === 2) {
          scope.x = vars[0];
          scope.y = vars[1];
        }
        return math.evaluate(funcStr, scope);
      };
      const grad = (vars) => {
        const [x, y] = vars;
        return gradStr.replace(/[\[\]]/g, '').split(',').map(e => math.evaluate(e.trim(), {x, y}));
      };

    const hessian = (vars) => {
      const [x, y] = vars;
      return hessianStr
        .replace(/[\[\]]/g, '')
        .split(',')
        .map(e => math.evaluate(e.trim(), {x, y}))
        .reduce((rows, val, i, arr) => {
          if (i % 2 === 0) rows.push([val]);
          else rows[rows.length - 1].push(val);
          return rows;
        }, []);
    };
      const { path: newPath } = newtonsMethod(func, grad, hessian, initialGuess, 1e-6, 50);
      setPath(newPath);
      const newConvergenceData = newPath.map((point, index) => ({
        iteration: index,
        value: func(point),
      }));
      setConvergenceData(newConvergenceData);
      setCurrentStep(0);
    } catch (error) {
      console.error(error);
      alert('Error parsing function or gradient: ' + error.message);
    }
  };

  useEffect(() => {
    handleOptimize();
  }, [numDimensions]);

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

  const x = [];
  const y = [];
  const z = [];
  if (numDimensions === 2) {
    for (let i = -2; i <= 2; i += 0.1) {
      const rowX = [];
      const rowY = [];
      const rowZ = [];
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

  const pathX = numDimensions === 2 ? path.slice(0, currentStep + 1).map(p => p[0]) : [];
  const pathY = numDimensions === 2 ? path.slice(0, currentStep + 1).map(p => p[1]) : [];
  const pathZ = numDimensions === 2 ? path.slice(0, currentStep + 1).map(p => plotFunc(p[0], p[1])) : [];

  const plotData = numDimensions === 2 ? [
    {
      x,
      y,
      z,
      type: 'surface',
      colorscale: 'Viridis',
    },
    {
      x: pathX,
      y: pathY,
      z: pathZ,
      type: 'scatter3d',
      mode: 'lines+markers',
      line: { color: 'red', width: 4 },
      marker: { size: 4, color: 'white' },
    },
  ] : [];

  const layout = {
    title: "Newton's Method Path",
    scene: {
      xaxis: { title: 'x' },
      yaxis: { title: 'y' },
      zaxis: { title: 'f(x, y)' },
    },
    width: 800,
    height: 600,
  };

  const pseudocode = (
    <>
      <h4>Newton's Method Pseudocode</h4>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {`
      FUNCTION NewtonsMethod(f, g, h, x0, tol, max_iter)

        // INPUTS:
        // f: The objective function to minimize.
        // g: The gradient of the function f.
        // h: The Hessian of the function f.
        // x0: The initial starting point (vector).
        // tol: The tolerance for convergence.
        // max_iter: The maximum number of iterations.

        current_x = x0
        path = [current_x]

        FOR i FROM 1 TO max_iter DO
          gradient = g(current_x)
          hessian = h(current_x)
          
          // Solve H*s = -g for the step s
          step = -inv(hessian) * gradient
          next_x = current_x + step
          path.push(next_x)

          IF |f(next_x) - f(current_x)| < tol THEN
            BREAK
          END IF

          current_x = next_x
        END FOR

        RETURN path
      END FUNCTION
      `}
      </pre>
    </>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Newton's Method is an optimization algorithm for finding the local minimum of a function. It uses the second derivative (the Hessian) to find the minimum more quickly than Gradient Descent.
          </Typography>
          <TextField
            label="Number of Dimensions"
            type="number"
            value={numDimensions}
            onChange={handleDimChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Function f(x1, x2, ...)"
            value={funcStr}
            onChange={(e) => setFuncStr(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Gradient g(x1, x2, ...)"
            value={gradStr}
            onChange={(e) => setGradStr(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Hessian H(x1, x2, ...)"
            value={hessianStr}
            onChange={(e) => setHessianStr(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Initial Guess (e.g., 0, 0)"
            value={initialGuessStr}
            onChange={(e) => setInitialGuessStr(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button onClick={handleOptimize} variant="contained">Optimize</Button>
        </Grid>
        <Grid item xs={12} md={8}>
          {numDimensions === 2 ? (
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
              pseudocodeContent={pseudocode}
            />
          ) : (
            <div>
              <Typography variant="h6">Convergence Plot</Typography>
              <Plot
                data={[
                  {
                    x: convergenceData.map(d => d.iteration),
                    y: convergenceData.map(d => d.value),
                    type: 'scatter',
                    mode: 'lines+markers',
                  },
                ]}
                layout={{
                  title: 'Function Value vs. Iteration',
                  xaxis: { title: 'Iteration' },
                  yaxis: { title: 'Function Value' },
                }}
              />
              <Typography variant="h6">Iteration Coordinates</Typography>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Iteration</th>
                      {Array.from({ length: numDimensions }, (_, i) => (
                        <th key={i} style={{ border: '1px solid #ddd', padding: '8px' }}>{`x${i + 1}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {path.map((point, index) => (
                      <tr key={index}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index}</td>
                        {point.map((coord, i) => (
                          <td key={i} style={{ border: '1px solid #ddd', padding: '8px' }}>{coord.toFixed(4)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p>Iteration: {currentStep} / {path.length > 0 ? path.length - 1 : 0}</p>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NewtonsMethodComponent;