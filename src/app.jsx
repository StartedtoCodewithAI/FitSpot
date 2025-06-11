import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import Profile from './pages/profile';
import Signup from './pages/Signup'; // <- Add this import

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} /> {/* Add Signup Route */}
      </Routes>
    </Router>
  );
}
