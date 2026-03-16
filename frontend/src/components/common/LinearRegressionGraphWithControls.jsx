import React from 'react';
import { Button, Box, Slider } from '@mui/material';
import { SkipPrevious, PlayArrow, Pause, SkipNext, Replay } from '@mui/icons-material';
import Plot from 'react-plotly.js';

function LinearRegressionGraphWithControls({
  plotData = [],
  layout,
  config,
  animationSteps = [],
  currentStepIndex,
  isPlaying,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSliderChange,
}) {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {plotData.length > 0 ? (
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
            <p style={{ fontSize: '0.9em' }}>No data to display. Please generate data first.</p>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginTop: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={onPrevStep}
            disabled={currentStepIndex === 0}
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
            disabled={animationSteps.length < 2}
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
            disabled={currentStepIndex >= animationSteps.length - 1}
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
            disabled={animationSteps.length === 0}
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
          <Slider
            value={currentStepIndex}
            onChange={(e, val) => onSliderChange(val)}
            min={0}
            max={animationSteps.length - 1}
            step={1}
            sx={{
              color: '#72A8C8',
              width: '200px',
              marginLeft: '20px',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default LinearRegressionGraphWithControls;
