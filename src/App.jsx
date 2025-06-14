// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import About from './pages/About';
import MyCodes from './pages/MyCodes';
import PrivateRoute from './components/PrivateRoute';
import BookSession from './pages/BookSession';

export default function App() {
  return (
    <Router>
      <style>{`
        html, body, #root {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }
      `}</style>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/mycodes" element={<MyCodes />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        {/* Remove or keep Signup/Login/About as needed for your app */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/book/:gymId" element={<BookSession />} />
      </Routes>
    </Router>
  );
}
