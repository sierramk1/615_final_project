
import React, { useState } from 'react';
import { Select, MenuItem, FormControl, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import BisectionComponent from './OneDAlgos/BisectionComponent.jsx';
import GoldenSearchComponent from './OneDAlgos/GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './OneDAlgos/NewtonRaphsonComponent.jsx';
import SecantComponent from './OneDAlgos/SecantComponent.jsx';

function OneDAlgorithmDisplay() {
  const [selectedAlgo, setSelectedAlgo] = useState('bisection');
  const [optimizationType, setOptimizationType] = useState('function');
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

  const handleOptimizationTypeChange = (event, newType) => {
    if (newType !== null) {
      setOptimizationType(newType);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const parsedData = csv.split('\n').map(row => {
          const [x, y] = row.split(',').map(Number);
          return { x, y };
        });
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  const renderSelectedAlgo = () => {
    const props = { optimizationType, data };
    switch (selectedAlgo) {
      case 'bisection':
        return <BisectionComponent {...props} />;
      case 'goldenSearch':
        return <GoldenSearchComponent {...props} />;
      case 'newtonRaphson':
        return <NewtonRaphsonComponent {...props} />;
      case 'secant':
        return <SecantComponent {...props} />;
      default:
        return null;
    }
  }

  return (
    <div style={{ marginTop: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', padding: '10px 20px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <Select
            value={selectedAlgo}
            onChange={handleSelectChange}
            displayEmpty
            sx={{
              fontSize: '1.5em',
              color: 'inherit',
              fontWeight: 'bold',
              borderRadius: '50px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiSelect-select': {
                backgroundColor: 'transparent',
                borderRadius: '50px',
                padding: '8px 32px 8px 20px',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              },
            }}
          >
            <MenuItem value="bisection">Bisection Method</MenuItem>
            <MenuItem value="goldenSearch">Golden Search Method</MenuItem>
            <MenuItem value="newtonRaphson">Newton-Raphson Method</MenuItem>
            <MenuItem value="secant">Secant Method</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={optimizationType}
          exclusive
          onChange={handleOptimizationTypeChange}
          aria-label="optimization type"
        >
          <ToggleButton value="function" aria-label="function optimization">
            Function
          </ToggleButton>
          <ToggleButton value="data" aria-label="data optimization">
            Data
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {optimizationType === 'data' && (
        <div style={{ padding: '10px 20px' }}>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
          />
          <Button onClick={handleFileUpload} variant="contained">Upload</Button>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px 20px' }}>
        {renderSelectedAlgo()}
      </div>
    </div>
  );
}

export default OneDAlgorithmDisplay;
