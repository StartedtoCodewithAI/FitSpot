import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Gyms from "./pages/Gyms";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
