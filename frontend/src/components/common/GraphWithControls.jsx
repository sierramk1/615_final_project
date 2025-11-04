import React from 'react';
import { Button, Box } from '@mui/material';
import { SkipPrevious, PlayArrow, Pause, SkipNext, Replay } from '@mui/icons-material';
import Plot from 'react-plotly.js';

function GraphWithControls({
  plotData,
  layout,
  config,
  showGraph,
  onToggleGraph,
  isPlaying,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  animationSteps,
  currentStepIndex,
  error,
  pseudocodeContent
}) {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
          <Button
            onClick={onToggleGraph}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#72A8C8',
              fontSize: '0.8em',
              padding: '4px 12px',
              '&:hover': {
                backgroundColor: '#5a8fa8',
              },
            }}
          >
            {showGraph ? 'Show Pseudocode' : 'Show Graph'}
          </Button>
        </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {showGraph ? (
          <>
            {plotData.length > 0 && !error ? (
              <Box sx={{ borderRadius: '15px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, minHeight: 0 }}>
                <Plot
                  data={plotData}
                  layout={layout}
                  config={config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.9em' }}>No data to display. Please check your inputs.</p>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            borderRadius: '15px', 
            overflow: 'auto', 
            backgroundColor: 'white', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            flex: 1, 
            minHeight: 0,
            padding: '20px'
          }}>
            {pseudocodeContent}
          </Box>
        )}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center',
            marginTop: '10px',
            flexWrap: 'wrap'
          }}
        >
          <Button
            onClick={onPrevStep}
            disabled={!showGraph || currentStepIndex === 0 || error}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#72A8C8',
              fontSize: '0.8em',
              padding: '4px 12px',
              '&:hover': {
                backgroundColor: '#5a8fa8',
              },
            }}
          >
            <SkipPrevious />
          </Button>
          <Button
            onClick={onPlayPause}
            disabled={!showGraph || animationSteps.length < 2 || error}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#72A8C8',
              fontSize: '0.8em',
              padding: '4px 12px',
              '&:hover': {
                backgroundColor: '#5a8fa8',
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </Button>
          <Button
            onClick={onNextStep}
            disabled={!showGraph || currentStepIndex >= animationSteps.length - 1 || error}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#72A8C8',
              fontSize: '0.8em',
              padding: '4px 12px',
              '&:hover': {
                backgroundColor: '#5a8fa8',
              },
            }}
          >
            <SkipNext />
          </Button>
          <Button
            onClick={onReset}
            disabled={!showGraph || animationSteps.length === 0 || error}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#72A8C8',
              fontSize: '0.8em',
              padding: '4px 12px',
              '&:hover': {
                backgroundColor: '#5a8fa8',
              },
            }}
          >
            <Replay />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default GraphWithControls;