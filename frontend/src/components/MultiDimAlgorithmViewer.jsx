
import React, { useState } from 'react';
import { Select, MenuItem, FormControl, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import GradientDescentComponent from './MultiDimAlgos/GradientDescentComponent.jsx';
import NewtonsMethodComponent from './MultiDimAlgos/NewtonsMethodComponent.jsx';

function MultiDimAlgorithmDisplay() {
  const [selectedAlgo, setSelectedAlgo] = useState('gradientDescent');
  const [optimizationType, setOptimizationType] = useState('function'); // Keep for consistency, adjust if needed

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
    console.log('Selected Algo:', event.target.value);
  };

  const handleOptimizationTypeChange = (event, newType) => {
    if (newType !== null) {
      setOptimizationType(newType);
      console.log('Optimization Type:', newType);
    }
  };

  const renderSelectedAlgo = () => {
    console.log('Rendering:', selectedAlgo);
    const props = { optimizationType }; // Data prop removed for now
    switch (selectedAlgo) {
      case 'gradientDescent':
        return <GradientDescentComponent {...props} />;
      case 'newtonsMethod':
        return <NewtonsMethodComponent {...props} />;
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
            <MenuItem value="gradientDescent">Gradient Descent</MenuItem>
            <MenuItem value="newtonsMethod">Newton's Method</MenuItem>
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
          {/* Data optimization toggle removed for now */}
        </ToggleButtonGroup>
      </div>

      {/* File upload section removed for now */}

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px 20px' }}>
        {renderSelectedAlgo()}
      </div>
    </div>
  );
}

export default MultiDimAlgorithmDisplay;
