import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row', // Arrange children in a row
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      backgroundColor: '#FFF4E6', // New background color
      color: '#333',
      fontFamily: 'Roboto, Arial, sans-serif' // New font family
    }}>
      <div style={{ maxWidth: '600px', marginRight: '50px' }}> {/* Container for text and buttons */}
        <h1 style={{ fontSize: '5.5em', marginBottom: '20px' }}>Welcome to OptiLearn!</h1> {/* Increased font size */}
        <p style={{ fontSize: '1.8em', maxWidth: '600px', margin: '20px 0' }}> {/* Increased font size */}
          Explore interactive and animated visualizations of various optimization and root-finding algorithms.
          Understand how these methods iteratively approach a solution by adjusting parameters and observing their dynamic behavior.
        </p>
        
        <div style={{ marginTop: '30px' }}>
          <Link to="/algorithms" style={{
            padding: '10px 20px',
            fontSize: '1.1em',
            backgroundColor: '#72A8C8', // New button color
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '15px',
            cursor: 'pointer'
          }}>Learn Algorithms</Link> {/* Changed text */}
          
          <button style={{
            padding: '10px 20px',
            fontSize: '1.1em',
            backgroundColor: '#72A8C8', // New button color
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>Compare Algorithms</button>
        </div>
      </div>
      
      <div style={{ marginLeft: '50px' }}> {/* Container for the image */}
        <img src="/character.png" alt="Cartoon Character" style={{ maxWidth: '300px', height: 'auto' }} /> {/* Image added */}
      </div>
    </div>
  );
}

export default HomePage;
