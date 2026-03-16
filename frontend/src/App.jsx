import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage.jsx';
import OneDAlgorithmsPage from './components/OneDAlgorithmsPage.jsx';
import MultiDAlgorithmsPage from './components/MultiDAlgorithmsPage.jsx';
import BlogPage from './components/BlogPage.jsx';
import BisectionPage from './components/OneDAlgos/BisectionPage.jsx';
import GoldenSearchPage from './components/OneDAlgos/GoldenSearchPage.jsx';
import NewtonRaphsonPage from './components/OneDAlgos/NewtonRaphsonPage.jsx';
import SecantPage from './components/OneDAlgos/SecantPage.jsx';
import GradientDescentPage from './components/MultiDimAlgos/GradientDescentPage.jsx';
import NewtonsMethodPage from './components/MultiDimAlgos/NewtonsMethodPage.jsx';
import ExamplesPage from './components/ExamplesMode.jsx';
import LinearRegressionExample from './components/Examples/LinearRegressionExample.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/one-dimensional" element={<OneDAlgorithmsPage />} />
      <Route path="/one-dimensional/bisection" element={<BisectionPage />} />
      <Route path="/one-dimensional/golden-search" element={<GoldenSearchPage />} />
      <Route path="/one-dimensional/newton-raphson" element={<NewtonRaphsonPage />} />
      <Route path="/one-dimensional/secant" element={<SecantPage />} />
      <Route path="/multi-dimensional" element={<MultiDAlgorithmsPage />} />
      <Route path="/multi-dimensional-algorithms/gradient-descent" element={<GradientDescentPage />} />
      <Route path="/multi-dimensional-algorithms/newtons-method" element={<NewtonsMethodPage />} />
      <Route path="/examples" element={<ExamplesPage />} />
      <Route path="/examples/linear-regression" element={<LinearRegressionExample />} />
      <Route path="/gen-ai-guide" element={<BlogPage />} />
    </Routes>
  );
}

export default App;
