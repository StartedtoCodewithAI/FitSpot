import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookSession from './pages/BookSession';
import MyCodes from './pages/MyCodes';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/book-session" element={<BookSession />} />
        <Route path="/my-codes" element={<MyCodes />} />
      </Routes>
    </Router>
  );
}
