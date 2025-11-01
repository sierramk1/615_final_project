import React from 'react';
import Plot from 'react-plotly.js'; // Keep this import for other components
import BisectionComponent from './components/BisectionComponent.jsx';
import GoldenSearchComponent from './components/GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './components/NewtonRaphsonComponent.jsx';
import SecantComponent from './components/SecantComponent.jsx';
import GradientDescentComponent from './components/GradientDescentComponent.jsx';
import NewtonsMethodComponent from './components/NewtonsMethodComponent.jsx';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>OptiLearn: Algorithm Visualizer</h1>
      <p>Welcome to OptiLearn! This application provides interactive and animated visualizations of various optimization and root-finding algorithms. Explore how these methods iteratively approach a solution by adjusting parameters and observing their dynamic behavior on a graph.</p>
      
      {/* --- Navigation Buttons --- */}
      <div style={{ margin: '30px 0', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h3>Jump to Algorithm:</h3>
        <a href="#bisection-component" style={{ marginRight: '15px' }}>Bisection</a>
        <a href="#golden-search-component" style={{ marginRight: '15px' }}>Golden Search</a>
        <a href="#newton-raphson-component" style={{ marginRight: '15px' }}>Newton-Raphson</a>
        <a href="#secant-component" style={{ marginRight: '15px' }}>Secant</a>
        <a href="#gradient-descent-component" style={{ marginRight: '15px' }}>Gradient Descent</a>
        <a href="#newtons-method-component" style={{ marginRight: '15px' }}>Newton's Method</a>
      </div>

      {/* --- One-Dimensional Algorithms --- */}
      <h2 style={{ marginTop: '40px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>One-Dimensional Algorithms</h2>
      <div id="bisection-component"> {/* Added ID */}
        <BisectionComponent />
      </div>
      <div id="golden-search-component"> {/* Added ID */}
        <GoldenSearchComponent />
      </div>
      <div id="newton-raphson-component"> {/* Added ID */}
        <NewtonRaphsonComponent />
      </div>
      <div id="secant-component"> {/* Added ID */}
        <SecantComponent />
      </div>

      {/* --- Multi-Dimensional Algorithms --- */}
      <h2 style={{ marginTop: '40px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Multi-Dimensional Algorithms</h2>
      <div id="gradient-descent-component"> {/* Added ID */}
        <GradientDescentComponent />
      </div>
      <div id="newtons-method-component"> {/* Added ID */}
        <NewtonsMethodComponent />
      </div>

    </div>
  );
}

export default App;
