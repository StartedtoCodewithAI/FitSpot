import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const activeStyle = {
    fontWeight: "bold",
    color: "#007bff",
    textDecoration: "underline",
  };

  const linkStyle = {
    margin: "0 1rem",
    color: "#333",
    textDecoration: "none",
    fontSize: "1.2rem",
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ddd", textAlign: "center" }}>
      <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : linkStyle)} end>
        Home
      </NavLink>
      <NavLink to="/gyms" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Gyms
      </NavLink>
    </nav>
  );
}
