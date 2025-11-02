import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OneDAlgorithmViewer from './OneDAlgorithmViewer.jsx'; // New component
import GradientDescentComponent from './GradientDescentComponent.jsx';
import NewtonsMethodComponent from './NewtonsMethodComponent.jsx';

function AlgorithmsPage() {
  const [showOneDSection, setShowOneDSection] = useState(true); // State to toggle between 1D and Multi-D sections

  return (
    <div style={{
      padding: '0px', 
      backgroundColor: '#F4F2EF', // Main content area background color
      fontFamily: 'Roboto, Arial, sans-serif' 
    }}>
      {/* --- TOP HEADER AND NAVIGATION --- */}
      <div style={{
        width: '100%', 
        height: '77px',
        backgroundColor: '#FFF5E6', // Header background color
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px', 
        boxSizing: 'border-box', 
        borderBottom: '1px solid #ccc'
      }}>
        {/* OptiLearn as a Link to Home */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          color: '#72A8C8', 
          fontFamily: 'Roboto',
          fontWeight: '700',
          fontSize: '38px',
          lineHeight: '100%',
          letterSpacing: '0%',
          textAlign: 'center',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          <img src="/character.png" alt="Owl Character" style={{ maxWidth: '50px', height: 'auto', marginRight: '10px' }} />
          OptiLearn
        </Link>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* One-Dimensional / Multi-Dimensional buttons in Header */}
          <button 
            onClick={() => setShowOneDSection(true)}
            style={{
              background: 'none',
              border: 'none',
              color: showOneDSection ? '#3C667E' : '#666',
              fontSize: '1.2em',
              cursor: 'pointer',
              fontWeight: showOneDSection ? 'bold' : 'normal',
              textDecoration: showOneDSection ? 'underline' : 'none'
            }}
          >One-Dimensional</button>
          <button 
            onClick={() => setShowOneDSection(false)}
            style={{
              background: 'none',
              border: 'none',
              color: !showOneDSection ? '#3C667E' : '#666',
              fontSize: '1.2em',
              cursor: 'pointer',
              fontWeight: !showOneDSection ? 'bold' : 'normal',
              textDecoration: !showOneDSection ? 'underline' : 'none'
            }}
          >Multi-Dimensional</button>
        </div>
      </div>

      {/* --- Algorithm Content --- */}
      <div style={{ padding: '20px' }}> 
        {showOneDSection ? (
          <>
            {/* Render the new OneDAlgorithmViewer component */}
            <OneDAlgorithmViewer />
          </>
        ) : (
          <>
            {/* Multi-Dimensional Algorithms */}
            <h2 style={{ marginTop: '20px', paddingBottom: '10px', fontSize: '2.5em' }}>Multi-Dimensional Algorithms</h2> 
            <div id="gradient-descent-component"> 
              <GradientDescentComponent />
            </div>
            <div id="newtons-method-component"> 
              <NewtonsMethodComponent />
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default AlgorithmsPage;
