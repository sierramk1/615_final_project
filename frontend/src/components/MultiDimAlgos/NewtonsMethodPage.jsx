import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Typography, Box, Grid, ToggleButton, ToggleButtonGroup, AppBar, Toolbar, Menu, MenuItem, IconButton, FormControlLabel, Checkbox, FormControl, InputLabel, Select, Slider } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NewtonsMethodComponent from './NewtonsMethodComponent';
import multiDAlgorithmsData from './multiDAlgorithmsData';
import { newtonsMethod } from '../../js/newtons_method.js';
import * as math from 'mathjs';

function NewtonsMethodPage() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (path) => {
        navigate(path);
        handleMenuClose();
    };

    const [funcStr, setFuncStr] = useState('(1 - x)^2 + 100 * (y - x^2)^2');
    const [gradStr, setGradStr] = useState('[-2 + 2*x - 400*x*y + 400*x^3, 200*y - 200*x^2]');
    const [hessianStr, setHessianStr] = useState('[[2 - 400*y + 1200*x^2, -400*x], [-400*x, 200]]');
    const [initialGuessStr, setInitialGuessStr] = useState('0, 0');
    const [tolerance, setTolerance] = useState(1e-6);
    const [maxIterations, setMaxIterations] = useState(50);
    const [error, setError] = useState(null);
    const [autoCalcDerivatives, setAutoCalcDerivatives] = useState(true);
    const [path, setPath] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef(null);
    const [showGraph, setShowGraph] = useState(true);
    const [numDimensions, setNumDimensions] = useState(2);
    const [convergenceData, setConvergenceData] = useState([]);
    const [iterationCount, setIterationCount] = useState(0);
    const [finalMinimum, setFinalMinimum] = useState(null);
    const [numDimensionsInput, setNumDimensionsInput] = useState('2');
    const [contourData, setContourData] = useState({});
    const [fixedDimValues, setFixedDimValues] = useState({});
    const [xAxisDim, setXAxisDim] = useState(0);
    const [yAxisDim, setYAxisDim] = useState(1);

    const pseudocodeContent = (
        <>
            <h4>Multi-dimensional Newton's Method Pseudocode</h4>
            <pre
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: '500px', overflowY: 'auto' }}
            >
                {`# Pseudocode for Multi-dimensional Newton's Method

FUNCTION NewtonsMethod(f, grad_f, hessian_f, x0, tol, max_iter)

  // INPUTS:
  // f: Function to minimize
  // grad_f: Gradient of f
  // hessian_f: Hessian of f
  // x0: Initial point (vector)
  // tol: Tolerance for convergence
  // max_iter: Maximum iterations

  FOR iter FROM 1 TO max_iter DO

    grad = grad_f(x0)
    IF norm(grad) < tol THEN
      RETURN x0
    END IF

    // Update using Newton step
    x0 = x0 - inverse(hessian_f(x0)) * grad

  END FOR

  RETURN x0
END FUNCTION
`}
            </pre>
        </>
    );

    useEffect(() => {
        if (autoCalcDerivatives) {
            try {
                const varNames = numDimensions === 2 ? ['x', 'y'] : Array.from({ length: numDimensions }, (_, i) => `x${i + 1}`);
                
                // Gradient
                const gradParts = varNames.map(v => math.derivative(funcStr, v).toString());
                setGradStr(`[${gradParts.join(', ')}]`);
        
                // Hessian
                const hessianMatrix = varNames.map((v1, i) => {
                    const firstDeriv = gradParts[i];
                    return varNames.map(v2 => {
                        return math.derivative(firstDeriv, v2).toString();
                    });
                });
                setHessianStr(`[${hessianMatrix.map(row => `[${row.join(', ')}]`).join(', ')}]`);
        
            } catch (e) {
                console.error("Error calculating derivatives:", e);
                setGradStr('');
                setHessianStr('');
            }
        }
    }, [funcStr, autoCalcDerivatives, numDimensions]);

    const handleDimChange = (e) => {
        const val = e.target.value;
        setNumDimensionsInput(val);

        const newDim = parseInt(val, 10);
        if (!isNaN(newDim) && newDim > 0) {
            if (newDim !== numDimensions) {
                setNumDimensions(newDim);
                setXAxisDim(0);
                setYAxisDim(1);
                if (newDim > 2) {
                    const funcParts = [];
                    for (let i = 1; i <= newDim; i++) {
                        funcParts.push(`(x${i} - ${i})^2`);
                    }
                    setFuncStr(funcParts.join(' + '));

                    const gradParts = [];
                    for (let i = 1; i <= newDim; i++) {
                        gradParts.push(`2 * (x${i} - ${i})`);
                    }
                    setGradStr(`[${gradParts.join(', ')}]`);
                    setInitialGuessStr(new Array(newDim).fill(0).join(', '));

                    const hessianMatrix = Array(newDim).fill(0).map(() => Array(newDim).fill(0));
                    for (let i = 0; i < newDim; i++) {
                        hessianMatrix[i][i] = 2;
                    }
                    setHessianStr(JSON.stringify(hessianMatrix).replace(/"/g, ''));

                } else if (newDim === 2) {
                    setFuncStr('(1 - x)^2 + 100 * (y - x^2)^2');
                    setGradStr('[-2 + 2*x - 400*x*y + 400*x^3, 200*y - 200*x^2]');
                    setHessianStr('[[2 - 400*y + 1200*x^2, -400*x], [-400*x, 200]]');
                    setInitialGuessStr('0, 0');
                }
            }
        }
    };

    useEffect(() => {
        if (numDimensions > 2) {
            const newFixedDimValues = {};
            const initialGuess = initialGuessStr.split(',').map(Number);

            for (let i = 0; i < numDimensions; i++) {
                if (i !== xAxisDim && i !== yAxisDim) {
                    if (fixedDimValues[i] !== undefined) {
                        newFixedDimValues[i] = fixedDimValues[i];
                    } else if (initialGuess.length === numDimensions && !isNaN(initialGuess[i])) {
                        newFixedDimValues[i] = initialGuess[i];
                    } else {
                        newFixedDimValues[i] = 0;
                    }
                }
            }
            setFixedDimValues(newFixedDimValues);
        }
    }, [numDimensions, initialGuessStr, xAxisDim, yAxisDim]);

    const handleFixedDimChange = (dimIndex, value) => {
        setFixedDimValues(prev => ({
            ...prev,
            [dimIndex]: value,
        }));
    };

    const plotFuncSlice = useCallback((x_val, y_val) => {
        if (!funcStr) return 0;
        try {
            const vars = [];
            for (let i = 0; i < numDimensions; i++) {
                if (i === xAxisDim) {
                    vars[i] = x_val;
                } else if (i === yAxisDim) {
                    vars[i] = y_val;
                } else {
                    vars[i] = fixedDimValues[i];
                }
            }

            const scope = {};
            for (let i = 0; i < numDimensions; i++) {
                scope[`x${i + 1}`] = vars[i];
            }
            return math.evaluate(funcStr, scope);
        } catch (e) {
            console.error("Error evaluating slice function:", e);
            return 0;
        }
    }, [funcStr, numDimensions, xAxisDim, yAxisDim, fixedDimValues]);

    const handleOptimize = () => {
        setError(null);
        if (tolerance <= 0) {
            setError('Tolerance must be greater than 0 for this algorithm.');
            return;
        }
        if (maxIterations <= 0) {
            setError('Max iterations must be greater than 0 for this algorithm.');
            return;
        }
        if (numDimensions === 1) {
            setError('Please use a one-dimensional algorithm for 1D problems.');
            return;
        }
        try {
            const initialGuess = initialGuessStr.split(',').map(Number);
            if (initialGuess.length !== numDimensions) {
                setError(`Initial guess must have ${numDimensions} dimensions.`);
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
                    scope[`x${i + 1}`] = vars[i];
                }
                if (numDimensions === 2) {
                    scope.x = vars[0];
                    scope.y = vars[1];
                }
                try {
                    const result = math.evaluate(gradStr, scope);
                    if (result && typeof result.toArray === 'function') {
                        return result.toArray();
                    }
                    return result;
                } catch (err) {
                    console.error('Error evaluating gradient:', err);
                    throw new Error(`Error in gradient expression: ${err.message}`);
                }
            };

            const hessian = (vars) => {
                const scope = {};
                for (let i = 0; i < numDimensions; i++) {
                    scope[`x${i + 1}`] = vars[i];
                }
                if (numDimensions === 2) {
                    scope.x = vars[0];
                    scope.y = vars[1];
                }

                try {
                    const result = math.evaluate(hessianStr, scope);
                    if (result && typeof result.toArray === 'function') {
                        return result.toArray();
                    }
                    return result;
                } catch (err) {
                    console.error('Error evaluating Hessian:', err);
                    throw new Error(`Error in Hessian expression: ${err.message}`);
                }
            };

            try {
                const initialFuncVal = func(initialGuess);
                const initialGradVal = grad(initialGuess);
                const initialHessianVal = hessian(initialGuess);

                if (
                    !isFinite(initialFuncVal) ||
                    !Array.isArray(initialGradVal) ||
                    initialGradVal.some(v => !isFinite(v)) ||
                    !Array.isArray(initialHessianVal) ||
                    initialHessianVal.some(row => !Array.isArray(row) || row.some(v => !isFinite(v)))
                ) {
                    setError("Initial function, gradient, or Hessian evaluation resulted in non-finite or non-array values. Please check your function, gradient, Hessian, and initial guess.");
                    return;
                }
            } catch (validationError) {
                setError(`Error during initial function/gradient/Hessian validation: ${validationError.message}. Please check your function, gradient, and Hessian strings.`);
                return;
            }

            try {
                const result = newtonsMethod(func, grad, hessian, initialGuess, tolerance, maxIterations);

                if (!result?.path) {
                    setError("Newton's method failed. Check your function, gradient, and Hessian.");
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
                setError("Newton's method failed: " + err.message);
                setPath([]);
                setConvergenceData([]);
                setCurrentStep(0);
                setIterationCount(0);
                setFinalMinimum(null);
            }
        } catch (error) {
            console.error('Error parsing function, gradient, or Hessian:', error);
            setError('Error parsing function, gradient, or Hessian: ' + error.message);
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
                setCurrentStep(prev => {
                    if (prev < path.length - 1) {
                        return prev + 1;
                    } else {
                        clearInterval(intervalRef.current);
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, 100);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, path]);

    const plotFunc = useCallback((x, y) => {
        if (!funcStr) return 0;
        try {
            return math.evaluate(funcStr, { x, y });
        } catch (e) {
            return 0;
        }
    }, [funcStr]);

    const getPlotData = useCallback(() => {
        if (numDimensions === 2) {
            const xCoords = [], yCoords = [], zCoords = [];
            for (let i = -2; i <= 2; i += 0.2) {
                const rowX = [], rowY = [], rowZ = [];
                for (let j = -1; j <= 3; j += 0.2) {
                    rowX.push(i);
                    rowY.push(j);
                    rowZ.push(plotFunc(i, j));
                }
                xCoords.push(rowX);
                yCoords.push(rowY);
                zCoords.push(rowZ);
            }

            const pathX = path?.slice(0, currentStep + 1).map(p => p[0]) || [];
            const pathY = path?.slice(0, currentStep + 1).map(p => p[1]) || [];
            const pathZ = path?.slice(0, currentStep + 1).map(p => plotFunc(p[0], p[1])) || [];

            return [
                { x: xCoords, y: yCoords, z: zCoords, type: 'surface', colorscale: 'Viridis', opacity: 0.7 },
                { x: pathX, y: pathY, z: pathZ, type: 'scatter3d', mode: 'lines+markers', line: { color: 'red', width: 4 }, marker: { size: 4, color: 'white' } }
            ];
        } else if (numDimensions > 2) {
            let ready = true;
            for (let i = 0; i < numDimensions; i++) {
                if (i !== xAxisDim && i !== yAxisDim) {
                    if (fixedDimValues[i] === undefined) {
                        ready = false;
                        break;
                    }
                }
            }
            if (!ready) return [];

            const x_min = path.length > 1 ? Math.min(...path.map(p => p[xAxisDim])) - 1 : -5;
            const x_max = path.length > 1 ? Math.max(...path.map(p => p[xAxisDim])) + 1 : 5;
            const y_min = path.length > 1 ? Math.min(...path.map(p => p[yAxisDim])) - 1 : -5;
            const y_max = path.length > 1 ? Math.max(...path.map(p => p[yAxisDim])) + 1 : 5;

            const x_coords = Array.from({ length: 30 }, (_, i) => x_min + i * (x_max - x_min) / 29);
            const y_coords = Array.from({ length: 30 }, (_, i) => y_min + i * (y_max - y_min) / 29);

            const z = [];
            for (const y_val of y_coords) {
                const row = [];
                for (const x_val of x_coords) {
                    row.push(plotFuncSlice(x_val, y_val));
                }
                z.push(row);
            }

            return [
                { 
                    x: x_coords,
                    y: y_coords,
                    z: z,
                    type: 'contour',
                    colorscale: 'Viridis',
                    contours: {
                        coloring: 'heatmap',
                    }
                },
                {
                    x: path.slice(0, currentStep + 1).map(p => p[xAxisDim]),
                    y: path.slice(0, currentStep + 1).map(p => p[yAxisDim]),
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { color: 'red', width: 4 },
                    marker: { size: 8, color: 'white' }
                }
            ];
        }
        return [];
    }, [numDimensions, funcStr, path, currentStep, xAxisDim, yAxisDim, fixedDimValues, plotFunc, plotFuncSlice]);

    const getLayout = useCallback(() => {
        if (numDimensions === 2) {
            return {
                title: "Newton's Method Path",
                scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x, y)' } },
                autosize: true,
            };
        } else if (numDimensions > 2) {
            return {
                title: `Contour Plot Slice (x${xAxisDim + 1} vs x${yAxisDim + 1})`,
                xaxis: { title: `x${xAxisDim + 1}` },
                yaxis: { title: `x${yAxisDim + 1}` },
                autosize: true,
            };
        }
        return {};
    }, [numDimensions, xAxisDim, yAxisDim]);

    return (
        <div style={{
            padding: '0px',
            backgroundColor: '#F4F2EF',
            fontFamily: 'Roboto, Arial, sans-serif',
            minHeight: '100vh'
        }}>
            <AppBar
                position="static"
                sx={{
                    backgroundColor: '#FFF5E6',
                    height: '77px',
                    boxShadow: 'none',
                    borderBottom: '1px solid #ccc'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <img
                            src="/character.png"
                            alt="Owl Character"
                            style={{ maxWidth: '50px', height: 'auto', marginRight: '10px' }}
                        />
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#72A8C8',
                                fontFamily: 'Roboto',
                                fontWeight: '700',
                                fontSize: '38px',
                                lineHeight: '100%',
                                letterSpacing: '0%',
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            OptiLearn
                        </Typography>
                    </Link>

                    <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Button
                            component={Link}
                            to="/one-dimensional"
                            sx={{
                                color: '#666',
                                fontSize: '1.2em',
                                fontWeight: 'normal',
                                textDecoration: 'none',
                                textTransform: 'none',
                                minWidth: '180px',
                                padding: '0',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            One-Dimensional
                        </Button>
                        <Button
                            component={Link}
                            to="/multi-dimensional"
                            sx={{
                                color: '#3C667E',
                                fontSize: '1.2em',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                textTransform: 'none',
                                minWidth: '180px',
                                padding: '0',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Multi-Dimensional
                        </Button>
                        <Button
                            component={Link}
                            to="/gen-ai-guide"
                            sx={{
                                color: '#666',
                                fontSize: '1.2em',
                                fontWeight: 'normal',
                                textDecoration: 'none',
                                textTransform: 'none',
                                minWidth: '180px',
                                padding: '0',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Gen-AI Guide
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <div style={{ padding: '20px', minHeight: 'calc(100vh - 77px)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        onClick={handleMenuClick}
                        sx={{
                            backgroundColor: '#72A8C8',
                            '&:hover': { backgroundColor: '#5a8fa8' },
                            color: 'white',
                            borderRadius: '25px',
                            textTransform: 'none',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            padding: '10px 25px',
                            marginBottom: '20px',
                        }}
                        endIcon={<ArrowDropDownIcon />}
                    >
                        Newton's Method
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {multiDAlgorithmsData.map((algo) => (
                            <MenuItem key={algo.name} onClick={() => handleMenuItemClick(algo.route)}>
                                {algo.name}
                            </MenuItem>
                        ))}
                    </Menu>

                    <ToggleButtonGroup
                        value="function"
                        exclusive
                        aria-label="optimization type"
                        sx={{ marginBottom: '20px' }}
                    >
                        <ToggleButton value="function" aria-label="function optimization">
                            Function
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

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
                            Newton’s Method is a second-order optimization algorithm that uses both the gradient and the Hessian to locate a local minimum of a differentiable function. At each iteration, it updates the current point by solving a linear system involving the Hessian to determine the search direction. When the Hessian is well-behaved and the starting point is reasonable, the method converges very quickly.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic', marginBottom: 2 }}
                        >
                            Note: The choice of starting points or interval can affect which root or minimum is found, especially for functions with multiple solutions.
                        </Typography>
                        <TextField label="Number of Dimensions" type="number" value={numDimensionsInput} onChange={handleDimChange} fullWidth margin="normal" />
                        <TextField label="Function f(x1, x2, ...)" value={funcStr} onChange={(e) => setFuncStr(e.target.value)} fullWidth margin="normal" placeholder="(1 - x)^2 + 100 * (y - x^2)^2" />
                        <FormControlLabel
                            control={<Checkbox checked={autoCalcDerivatives} onChange={(e) => setAutoCalcDerivatives(e.target.checked)} />}
                            label="Automatically Calculate Gradient and Hessian"
                        />
                        <TextField
                            label="Gradient g(x1, x2, ...)"
                            value={gradStr}
                            onChange={(e) => setGradStr(e.target.value)}
                            fullWidth
                            margin="normal"
                            placeholder="[-2 + 2*x - 400*x*y + 400*x^3, 200*y - 200*x^2]"
                            disabled={autoCalcDerivatives}
                            InputProps={{
                                style: {
                                    backgroundColor: autoCalcDerivatives ? '#f0f0f0' : 'inherit'
                                }
                            }}
                        />
                        <TextField
                            label="Hessian H(x1, x2, ...)"
                            value={hessianStr}
                            onChange={(e) => setHessianStr(e.target.value)}
                            fullWidth
                            margin="normal"
                            placeholder="[[2 - 400*y + 1200*x^2, -400*x], [-400*x, 200]]"
                            disabled={autoCalcDerivatives}
                            InputProps={{
                                style: {
                                    backgroundColor: autoCalcDerivatives ? '#f0f0f0' : 'inherit'
                                }
                            }}
                        />
                        <TextField label="Initial Guess" value={initialGuessStr} onChange={(e) => setInitialGuessStr(e.target.value)} fullWidth margin="normal" />
                        <TextField label="Tolerance" type="number" value={tolerance} onChange={(e) => {
                            if (parseFloat(e.target.value) >= 0 || e.target.value === "") {
                                setTolerance(Number(e.target.value));
                            }
                        }} fullWidth margin="normal" inputProps={{ step: "1e-7" }} />
                        <TextField label="Max Iterations" type="number" value={maxIterations} onChange={(e) => setMaxIterations(Number(e.target.value))} fullWidth margin="normal" />
                        {error && <Alert severity="warning" sx={{ fontSize: "1em", padding: "12px", marginTop: 1 }}>{error}</Alert>}
                        <Button
                            onClick={handleOptimize}
                            variant="contained"
                            fullWidth
                            sx={{ mt: 2, backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}
                        >
                            Optimize
                        </Button>
                        {numDimensions > 2 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6">Cross-Section Controls</Typography>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>X-Axis</InputLabel>
                                    <Select
                                        value={xAxisDim}
                                        label="X-Axis"
                                        onChange={(e) => {
                                            if (e.target.value === yAxisDim) setYAxisDim(xAxisDim);
                                            setXAxisDim(e.target.value);
                                        }}
                                    >
                                        {Array.from({ length: numDimensions }, (_, i) => (
                                            <MenuItem key={i} value={i}>{`x${i + 1}`}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Y-Axis</InputLabel>
                                    <Select
                                        value={yAxisDim}
                                        label="Y-Axis"
                                        onChange={(e) => {
                                            if (e.target.value === xAxisDim) setXAxisDim(yAxisDim);
                                            setYAxisDim(e.target.value);
                                        }}
                                    >
                                        {Array.from({ length: numDimensions }, (_, i) => (
                                            <MenuItem key={i} value={i}>{`x${i + 1}`}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {Object.entries(fixedDimValues).map(([dimIndex, value]) => (
                                    <Box key={dimIndex} sx={{ mt: 1 }}>
                                        <Typography id={`slider-x${parseInt(dimIndex, 10) + 1}`} gutterBottom>
                                            {`x${parseInt(dimIndex, 10) + 1}`} Value
                                        </Typography>
                                        <Slider
                                            value={value}
                                            onChange={(e, newValue) => handleFixedDimChange(parseInt(dimIndex, 10), newValue)}
                                            aria-labelledby={`slider-x${parseInt(dimIndex, 10) + 1}`}
                                            step={0.1}
                                            min={-5}
                                            max={5}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                        {path.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6">
                                    <strong>Minimum:</strong> <strong>[${finalMinimum?.map(v => v.toFixed(4)).join(', ')}]</strong>
                                </Typography>
                                <Typography variant="body1">
                                    Iteration: {currentStep > 0 ? currentStep : 0} / {path.length - 1}
                                </Typography>
                            </Box>
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
                        <NewtonsMethodComponent
                            path={path}
                            currentStep={currentStep}
                            isPlaying={isPlaying}
                            onPlayPause={() => setIsPlaying(!isPlaying)}
                            onPrevStep={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            onNextStep={() => setCurrentStep(prev => Math.min(path.length - 1, prev + 1))}
                            onReset={() => setCurrentStep(0)}
                            pseudocodeContent={pseudocodeContent}
                            showGraph={showGraph}
                            onToggleGraph={() => setShowGraph(!showGraph)}
                            plotData={getPlotData()}
                            layout={getLayout()}
                            numDimensions={numDimensions}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewtonsMethodPage;
