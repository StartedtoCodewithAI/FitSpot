import React from "react";
import { Link } from "react-router-dom";
import FitSpotLogo from "../FitSpot.png";

export default function Navbar() {
  return (
    <nav style={{ display: "flex", padding: "1rem", alignItems: "center", background: "#eee" }}>
      <img src={FitSpotLogo} alt="FitSpot Logo" style={{ height: "40px", marginRight: "1rem" }} />
      <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
      <Link to="/gyms" style={{ marginRight: "1rem" }}>Gyms</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
