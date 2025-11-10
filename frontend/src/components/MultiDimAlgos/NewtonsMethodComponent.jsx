import React, { useState, useEffect, useRef } from 'react';
import { newtonsMethod } from '../../js/newtons_method.js';
import GraphWithControls from '../common/GraphWithControls.jsx';
import { TextField, Button, Box, Grid, Typography } from '@mui/material';
import * as math from 'mathjs';
import Plot from 'react-plotly.js';

function NewtonsMethodComponent() {
  const [funcStr, setFuncStr] = useState('(1 - x)^2 + 100 * (y - x^2)^2');
  const [gradStr, setGradStr] = useState('[0, 0]'); // safe default
  const [hessianStr, setHessianStr] = useState('[[1, 0], [0, 1]]'); // safe default
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
          if (!Array.isArray(result)) throw new Error('Gradient must return an array');
          return result;
        } catch (err) {
          console.error('Error evaluating gradient:', err);
          return Array(numDimensions).fill(0); // fallback
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
          if (!Array.isArray(result)) throw new Error('Hessian must return a 2D array');
          return result;
        } catch (err) {
          console.error('Error evaluating Hessian:', err);
          return Array(numDimensions).fill(0).map(() => Array(numDimensions).fill(0)); // fallback
        }
      };


      const result = newtonsMethod(func, grad, hessian, initialGuess, 1e-6, 50);
      if (!result?.path) {
        alert("Newton's method failed. Check your function, gradient, and Hessian.");
        return;
      }

      setPath(result.path || []);
      const newConvergenceData = (result.path || []).map((point, i) => ({
        iteration: i,
        value: func(point),
      }));
      setConvergenceData(newConvergenceData);
      setCurrentStep(0);

    } catch (error) {
      console.error(error);
      alert('Error parsing function, gradient, or Hessian: ' + error.message);
    }
  };

  useEffect(() => handleOptimize(), [numDimensions]);

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

  const pathX = numDimensions === 2 && path?.length ? path.slice(0, currentStep + 1).map(p => p[0]) : [];
  const pathY = numDimensions === 2 && path?.length ? path.slice(0, currentStep + 1).map(p => p[1]) : [];
  const pathZ = numDimensions === 2 && path?.length ? path.slice(0, currentStep + 1).map(p => plotFunc(p[0], p[1])) : [];

  const plotData = numDimensions === 2 ? [
    { x, y, z, type: 'surface', colorscale: 'Viridis' },
    { x: pathX, y: pathY, z: pathZ, type: 'scatter3d', mode: 'lines+markers', line: { color: 'red', width: 4 }, marker: { size: 4, color: 'white' } }
  ] : [];

  const layout = {
    title: "Newton's Method Path",
    scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x, y)' } },
    width: 800,
    height: 600,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Controls */}
        <Grid item xs={12} md={4}>
          <TextField label="Number of Dimensions" type="number" value={numDimensions} onChange={handleDimChange} fullWidth margin="normal" />
          <TextField label="Function f(x1, x2, ...)" value={funcStr} onChange={(e) => setFuncStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Gradient g(x1, x2, ...)" value={gradStr} onChange={(e) => setGradStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Hessian H(x1, x2, ...)" value={hessianStr} onChange={(e) => setHessianStr(e.target.value)} fullWidth margin="normal" />
          <TextField label="Initial Guess" value={initialGuessStr} onChange={(e) => setInitialGuessStr(e.target.value)} fullWidth margin="normal" />
          <Button onClick={handleOptimize} variant="contained">Optimize</Button>
        </Grid>

        {/* Graph */}
        <Grid item xs={12} md={8}>
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
          <p>Iteration: {currentStep} / {path?.length ? path.length - 1 : 0}</p>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NewtonsMethodComponent;
