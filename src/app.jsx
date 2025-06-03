import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Gyms from "./pages/Gyms";

export default function App() {
  return (
    <div>
      <nav style={{ padding: "1rem", backgroundColor: "#007bff", color: "#fff" }}>
        <Link to="/" style={{ marginRight: "1rem", color: "#fff" }}>Home</Link>
        <Link to="/gyms" style={{ color: "#fff" }}>Gyms</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
      </Routes>
    </div>
  );
}
