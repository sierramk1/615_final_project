import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import OneDAlgorithmViewer from './OneDAlgorithmViewer.jsx';
import MultiDimAlgorithmDisplay from './MultiDimAlgorithmViewer.jsx';

function AlgorithmsPage() {
  const location = useLocation();
  const [showOneDSection, setShowOneDSection] = useState(location.state?.showOneD !== undefined ? location.state.showOneD : true);

  useEffect(() => {
    if (location.state?.showOneD !== undefined) {
      setShowOneDSection(location.state.showOneD);
    }
  }, [location.state]);

  return (
    <div style={{
      padding: '0px', 
      backgroundColor: '#F4F2EF', // Main content area background color
      fontFamily: 'Roboto, Arial, sans-serif' 
    }}>
      {/* --- TOP HEADER AND NAVIGATION --- */}
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
          {/* OptiLearn as a Link to Home */}
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
            {/* One-Dimensional / Multi-Dimensional buttons in Header */}
            <Button
              onClick={() => setShowOneDSection(true)}
              sx={{
                color: showOneDSection ? '#3C667E' : '#666',
                fontSize: '1.2em',
                fontWeight: showOneDSection ? 'bold' : 'normal',
                textDecoration: showOneDSection ? 'underline' : 'none',
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
              onClick={() => setShowOneDSection(false)}
              sx={{
                color: !showOneDSection ? '#3C667E' : '#666',
                fontSize: '1.2em',
                fontWeight: !showOneDSection ? 'bold' : 'normal',
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- Algorithm Content --- */}
      <div style={{ padding: '0px', height: 'calc(100vh - 77px)' }}> 
        {showOneDSection ? (
          <>
            {/* Render the new OneDAlgorithmViewer component */}
            <OneDAlgorithmViewer />
          </>
        ) : (
          <>
          <MultiDimAlgorithmDisplay />
          </>
        )}
      </div>

    </div>
  );
}

export default AlgorithmsPage;
