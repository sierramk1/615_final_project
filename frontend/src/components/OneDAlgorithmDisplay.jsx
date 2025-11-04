import React, { useState } from 'react';
import BisectionComponent from './BisectionComponent.jsx';
import GoldenSearchComponent from './GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './NewtonRaphsonComponent.jsx';
import SecantComponent from './SecantComponent.jsx';

function OneDAlgorithmDisplay() {
  const [selectedAlgo, setSelectedAlgo] = useState('bisection');

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <select 
          onChange={handleSelectChange}
          value={selectedAlgo}
          style={{
            padding: '8px 15px',
            fontSize: '2.5em', // Make it look like a header
            backgroundColor: '#72A8C8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: '20px'
          }}
        >
          <option value="bisection">Bisection Method</option>
          <option value="goldenSearch">Golden Search Method</option>
          <option value="newtonRaphson">Newton-Raphson Method</option>
          <option value="secant">Secant Method</option>
        </select>
      </div>

      {selectedAlgo === 'bisection' && <div id="bisection-component"><BisectionComponent /></div>}
      {selectedAlgo === 'goldenSearch' && <div id="golden-search-component"><GoldenSearchComponent /></div>}
      {selectedAlgo === 'newtonRaphson' && <div id="newton-raphson-component"><NewtonRaphsonComponent /></div>}
      {selectedAlgo === 'secant' && <div id="secant-component"><SecantComponent /></div>}
    </div>
  );
}

export default OneDAlgorithmDisplay;
