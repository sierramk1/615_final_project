import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, Grid } from '@mui/material';

function ExamplesPage() {
  const examples = [
    {
      name: 'Linear Regression',
      description: 'An example of using optimization algorithms to perform linear regression on generated data.',
      route: '/examples/linear-regression',
    },
    // Add more examples here
  ];

  return (
    <div style={{
      padding: '0px', 
      backgroundColor: '#F4F2EF',
      fontFamily: 'Roboto, Arial, sans-serif',
      minHeight: '100vh'
    }}>
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
            <Button
              component={Link}
              to="/one-dimensional"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
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
              One-Dimensional
            </Button>
            <Button
              component={Link}
              to="/multi-dimensional"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
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
            <Button
              component={Link}
              to="/gen-ai-guide"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
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
              Gen-AI Guide
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <div style={{ height: 'calc(100vh - 77px)', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', color: '#666', padding: '20px 20px 0px 20px' }}>Examples</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '0px 40px 20px 40px', flexGrow: 1 }}>
          {examples.map((example) => (
            <Link 
              to={example.route} 
              key={example.name} 
              style={{ textDecoration: 'none', flexGrow: 1 }}
            >
              <Card 
                sx={{ 
                  backgroundColor: '#72A8C8', 
                  color: 'white', 
                  borderRadius: '8px',
                  border: '1px solid white',
                  height: '100%',
                  width: '100%',
                  '&:hover': { 
                    backgroundColor: '#5a8fa8',
                    cursor: 'pointer'
                  }
                }}
              >
                <Box sx={{ padding: '16px' }}>
                  <Typography variant="h5" component="div" sx={{ textShadow: '1px 1px 0px black' }}>
                    {example.name}
                  </Typography>
                  <Typography variant="body2" color="inherit">
                    {example.description}
                  </Typography>
                </Box>
              </Card>
            </Link>
          ))}
        </Box>
      </div>
    </div>
  );
}

export default ExamplesPage;