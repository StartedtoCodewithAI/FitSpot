import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      background: "#eee",
      padding: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      {/* Brand / Logo */}
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        <Link to="/" style={{ textDecoration: "none", color: "black" }}>FitSpot</Link>
      </div>
      {/* Navigation Links */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/">Home</Link>
        <Link to="/gyms">Gyms</Link>
        <Link to="/about">About</Link>
        <Link to="/profile">Profile</Link>
        {/* Profile Avatar placeholder */}
        <span title="Profile" style={{ fontSize: "1.6rem", marginLeft: "0.5rem" }}>👤</span>
        {/* Logout button placeholder */}
        <button
          style={{
            marginLeft: "1rem",
            padding: "0.3rem 0.9rem",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
