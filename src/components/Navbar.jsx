import React from "react";
import { Link } from "react-router-dom";
// Add this import if you have an AvatarUpload component
import AvatarUpload from "./AvatarUpload";

export default function Navbar() {
  return (
    <nav style={{
      background: "#eee",
      padding: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        <Link to="/" style={{ textDecoration: "none", color: "black" }}>FitSpot</Link>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/">Home</Link>
        <Link to="/gyms">Gyms</Link>
        <Link to="/about">About</Link>
        <Link to="/profile">Profile</Link>
        {/* Add avatar/profile upload here */}
        <AvatarUpload />
      </div>
    </nav>
  );
}
