import React from 'react';
import GraphWithControls from '../common/GraphWithControls.jsx';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

function NewtonsMethodComponent({
  path,
  currentStep,
  isPlaying,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  pseudocodeContent,
  showGraph,
  onToggleGraph,
  plotData,
  layout,
  numDimensions,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <GraphWithControls
            plotData={plotData}
            layout={layout}
            showGraph={showGraph}
            onToggleGraph={onToggleGraph}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onPrevStep={onPrevStep}
            onNextStep={onNextStep}
            onReset={onReset}
            animationSteps={path}
            currentStepIndex={currentStep}
            pseudocodeContent={pseudocodeContent}
          />
          {showGraph && path.length > 0 && (
            <Box sx={{ mt: 2, overflowX: 'auto', bgcolor: 'background.paper' }}>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Iteration</TableCell>
                      {Array.from({ length: numDimensions }, (_, i) => (
                        <TableCell key={i}>x{i + 1}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {path.map((point, index) => {
                      const isFirstTen = index < 10;
                      const isEveryTenthUpToHundred = index >= 10 && index < 100 && index % 10 === 0;
                      const isEveryHundredthUpToThousand = index >= 100 && index < 1000 && index % 100 === 0;
                      const isEveryThousandthAfterThousand = index >= 1000 && index % 1000 === 0;
                      const isLastIteration = index === path.length - 1;

                      if (isFirstTen || isEveryTenthUpToHundred || isEveryHundredthUpToThousand || isEveryThousandthAfterThousand || isLastIteration) {
                        return (
                          <TableRow key={index}>
                            <TableCell>{index}</TableCell>
                            {point.map((coord, i) => (
                              <TableCell key={i}>{coord.toFixed(4)}</TableCell>
                            ))}
                          </TableRow>
                        );
                      }
                      return null;
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default NewtonsMethodComponent;