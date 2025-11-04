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
        
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'row', gap: '15px', justifyContent: 'center' }}> {/* Added justifyContent: 'center' */}
          <Link to="/algorithms" style={{
            width: '195px', // Fixed width
            height: '45px', // Fixed height
            display: 'flex', // Use flex to center text
            justifyContent: 'center', // Center text horizontally
            alignItems: 'center', // Center text vertically
            fontSize: '1.3em', 
            backgroundColor: '#3C667E',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '50px', // Fully rounded
            cursor: 'pointer'
          }}>Explore</Link>
          
          <button style={{
            width: '195px', // Fixed width
            height: '45px', // Fixed height
            display: 'flex', // Use flex to center text
            justifyContent: 'center', // Center text horizontally
            alignItems: 'center', // Center text vertically
            fontSize: '1.3em',
            backgroundColor: '#72A8C8',
            color: 'white',
            border: 'none',
            borderRadius: '50px', // Fully rounded
            cursor: 'pointer'
          }}>Compare</button>
        </div>
      </div>
      
      <div style={{ marginLeft: '50px' }}> {/* Container for the image */}
        <img src="/character.png" alt="Cartoon Character" style={{ maxWidth: '300px', height: 'auto' }} /> {/* Image added */}
      </div>
    </div>
  );
}

export default HomePage;
