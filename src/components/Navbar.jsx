import React from "react";
import { Link } from "react-router-dom";
import FitSpotLogo from '../assets/FitSpot.png';

function Navbar() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#f8f8f8' }}>
      <img src={FitSpotLogo} alt="FitSpot Logo" style={{ height: '40px', marginRight: '20px' }} />
      <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
        <li style={{ marginRight: '15px' }}>
          <Link to="/">Home</Link>
        </li>
        <li style={{ marginRight: '15px' }}>
          <Link to="/gyms">Gyms</Link>
        </li>
        <li style={{ marginRight: '15px' }}>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
