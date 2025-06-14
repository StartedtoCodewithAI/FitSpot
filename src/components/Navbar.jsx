import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{background: "#eee", padding: "1rem", display: "flex", gap: "1rem"}}>
      <Link to="/">Home</Link>
      <Link to="/gyms">Gyms</Link>
      <Link to="/about">About</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
