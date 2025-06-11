import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import Profile from './pages/profile';
import Signup from './pages/Signup';
import Login from './pages/Login';        // Import Login page
import About from './pages/About';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />      {/* Login Route */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
