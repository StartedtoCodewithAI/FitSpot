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
      {/* ...styles and Navbar... */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/my-codes" element={<MyCodes />} />
        {/* ...other routes... */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/book/:gymId" element={<BookSession />} />
      </Routes>
    </Router>
  );
}
