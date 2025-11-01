import React from 'react';
import { Link } from 'react-router-dom';
import BisectionComponent from './BisectionComponent.jsx';
import GoldenSearchComponent from './GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './NewtonRaphsonComponent.jsx';
import SecantComponent from './SecantComponent.jsx';
import GradientDescentComponent from './GradientDescentComponent.jsx';
import NewtonsMethodComponent from './NewtonsMethodComponent.jsx';

function AlgorithmsPage() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#FFF4E6', // New background color, matching homepage
      fontFamily: 'Roboto, Arial, sans-serif' // New font family
    }}>
      {/* --- NEW TOP HEADER AND NAVIGATION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3em', margin: 0, marginRight: '15px' }}>Optimization Algorithms</h1>
          <img src="/character.png" alt="Owl Character" style={{ maxWidth: '70px', height: 'auto' }} />
        </div>
        <Link to="/" style={{
          padding: '10px 20px',
          fontSize: '1.0em',
          backgroundColor: '#72A8C8',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>Back to Home</Link>
      </div>

      <div style={{ margin: '0 0 40px 0', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        <a href="#bisection-component" style={{ padding: '8px 15px', backgroundColor: '#72A8C8', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Bisection</a>
        <a href="#golden-search-component" style={{ padding: '8px 15px', backgroundColor: '#72A8C8', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Golden Search</a>
        <a href="#newton-raphson-component" style={{ padding: '8px 15px', backgroundColor: '#72A8C8', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Newton-Raphson</a>
        <a href="#secant-component" style={{ padding: '8px 15px', backgroundColor: '#72A8C8', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Secant</a>
        <a href="#gradient-descent-component" style={{ padding: '8px 15px', backgroundColor: '#72A8C8', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Gradient Descent</a>
        <a href="#newtons-method-component" style={{ padding: '8px 15px', backgroundColor: '#72A8C8', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Newton's Method</a>
      </div>
      {/* --- END NEW TOP HEADER AND NAVIGATION --- */}

      {/* --- One-Dimensional Algorithms --- */}
      <h2 style={{ marginTop: '40px', paddingBottom: '10px', fontSize: '2.5em' }}>One-Dimensional Algorithms</h2> 
      <div id="bisection-component"> 
        <BisectionComponent />
      </div>
      <div id="golden-search-component"> 
        <GoldenSearchComponent />
      </div>
      <div id="newton-raphson-component"> 
        <NewtonRaphsonComponent />
      </div>
      <div id="secant-component"> 
        <SecantComponent />
      </div>

      {/* --- Multi-Dimensional Algorithms --- */}
      <h2 style={{ marginTop: '40px', paddingBottom: '10px', fontSize: '2.5em' }}>Multi-Dimensional Algorithms</h2> 
      <div id="gradient-descent-component"> 
        <GradientDescentComponent />
      
      </div>
      <div id="newtons-method-component"> 
        <NewtonsMethodComponent />
      </div>

    </div>
  );
}

export default AlgorithmsPage;
