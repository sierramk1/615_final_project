import React, { useState } from 'react';
import BisectionComponent from './BisectionComponent.jsx';
import GoldenSearchComponent from './GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './NewtonRaphsonComponent.jsx';
import SecantComponent from './SecantComponent.jsx';

function OneDAlgorithmViewer() {
  const [selectedAlgo, setSelectedAlgo] = useState('bisection');

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

  return (
    <div style={{ marginTop: '20px' }}> {/* Removed marginLeft from here */}
      <div style={{ marginBottom: '20px', marginLeft: '44px', display: 'flex', alignItems: 'center' }}> {/* Dropdown container, indented */}
        <select 
          onChange={handleSelectChange}
          value={selectedAlgo}
          style={{
            fontSize: '28px', 
            backgroundColor: 'transparent', 
            color: 'black', 
            border: 'none', 
            cursor: 'pointer',
            fontFamily: 'Roboto', 
            fontWeight: '500', 
            lineHeight: '100%',
            letterSpacing: '0%',
            WebkitAppearance: 'none', 
            MozAppearance: 'none',
            appearance: 'none',
            paddingRight: '0px' 
          }}
        >
          <option value="bisection">Bisection Method</option>
          <option value="goldenSearch">Golden Search Method</option>
          <option value="newtonRaphson">Newton-Raphson Method</option>
          <option value="secant">Secant Method</option>
        </select>
        {/* CSS-drawn caret */}
        <span style={{
          width: '10px', 
          height: '10px', 
          borderBottom: '3px solid #1E1E1E',
          borderRight: '3px solid #1E1E1E',
          transform: 'rotate(45deg)', 
          marginLeft: '8px', // ✅ this was missing
          }}
        />
      </div>

      {/* Render the selected algorithm component */}
      {selectedAlgo === 'bisection' && <BisectionComponent />}
      {selectedAlgo === 'goldenSearch' && <GoldenSearchComponent />}
      {selectedAlgo === 'newtonRaphson' && <NewtonRaphsonComponent />}
      {selectedAlgo === 'secant' && <SecantComponent />}
    </div>
  );
}

export default OneDAlgorithmViewer;
