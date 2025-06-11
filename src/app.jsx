import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import Profile from './pages/profile';
import Signup from './pages/Signup';   // Import Signup page
import About from './pages/About';     // Import About page

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />     {/* Signup Route */}
        <Route path="/about" element={<About />} />       {/* About Route */}
      </Routes>
    </Router>
  );
}
