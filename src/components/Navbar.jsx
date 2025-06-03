import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link to="/" style={linkStyle}>Home</Link>
        </li>
        <li style={liStyle}>
          <Link to="/gyms" style={linkStyle}>Gyms</Link>
        </li>
        <li style={liStyle}>
          <Link to="/profile" style={linkStyle}>Profile</Link>
        </li>
      </ul>
    </nav>
  );
}

const navStyle = {
  padding: "1rem",
  backgroundColor: "#007bff",
};

const ulStyle = {
  display: "flex",
  listStyle: "none",
  margin: 0,
  padding: 0,
  justifyContent: "center",
  gap: "2rem",
};

const liStyle = {};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "1.2rem",
};
