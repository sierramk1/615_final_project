import React, { useState } from 'react';
import { Select, MenuItem, FormControl } from '@mui/material';
import BisectionComponent from './OneDAlgos/BisectionComponent.jsx';
import GoldenSearchComponent from './OneDAlgos/GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './OneDAlgos/NewtonRaphsonComponent.jsx';
import SecantComponent from './OneDAlgos/SecantComponent.jsx';

function OneDAlgorithmDisplay() {
  const [selectedAlgo, setSelectedAlgo] = useState('bisection');

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

  return (
    <div style={{ marginTop: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', padding: '10px 20px 0 20px', display: 'flex', alignItems: 'center' }}>
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
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px 20px' }}>
        {selectedAlgo === 'bisection' && <div id="bisection-component" style={{ height: '100%' }}><BisectionComponent /></div>}
        {selectedAlgo === 'goldenSearch' && <div id="golden-search-component" style={{ height: '100%' }}><GoldenSearchComponent /></div>}
        {selectedAlgo === 'newtonRaphson' && <div id="newton-raphson-component" style={{ height: '100%' }}><NewtonRaphsonComponent /></div>}
        {selectedAlgo === 'secant' && <div id="secant-component" style={{ height: '100%' }}><SecantComponent /></div>}
      </div>
    </div>
  );
}

export default OneDAlgorithmDisplay;
