import React, { useState } from "react";
import { Link } from "react-router-dom";

// Dummy authentication state (replace with real auth logic)
const isAuthenticated = true; // set to false to show Login instead of Logout

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Example search handler (replace with your actual search logic)
  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${search}`);
    setSearch("");
  };

  return (
    <nav style={{
      background: "#eee",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Hamburger for mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "inline-block",
            background: "none",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer",
            marginRight: "1rem",
            minWidth: "44px",
            minHeight: "44px",
            lineHeight: "1",
            color: "#333"
          }}
          className="navbar-hamburger"
        >
          ☰
        </button>
        {/* Brand / Logo */}
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", flex: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "black" }}>FitSpot</Link>
        </div>
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: "4px",
          border: "1px solid #ccc",
          marginRight: "1rem",
          padding: "0.2rem 0.5rem"
        }}>
          <input
            type="text"
            placeholder="Search gyms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "0.2rem 0.3rem",
              fontSize: "1rem"
            }}
          />
          <button
            type="submit"
            style={{
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.3rem 0.7rem",
              marginLeft: "0.3rem",
              cursor: "pointer"
            }}
          >
            🔍
          </button>
        </form>
        {/* Profile/Avatar Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.6rem",
              marginLeft: "0.5rem"
            }}
            aria-label="Profile menu"
          >
            👤
          </button>
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "2.5rem",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "7px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                minWidth: "130px",
                zIndex: 10
              }}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <Link to="/profile" style={{ display: "block", padding: "0.7rem 1rem", color: "#333", textDecoration: "none" }}>Profile</Link>
              <Link to="/my-codes" style={{ display: "block", padding: "0.7rem 1rem", color: "#333", textDecoration: "none" }}>My Codes</Link>
              {isAuthenticated
                ? <button style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.7rem 1rem",
                    background: "none",
                    border: "none",
                    color: "#d32f2f",
                    cursor: "pointer"
                  }}>Logout</button>
                : <Link to="/login" style={{ display: "block", padding: "0.7rem 1rem", color: "#333", textDecoration: "none" }}>Login</Link>
              }
            </div>
          )}
        </div>
      </div>
      {/* Navigation Links */}
      <div
        style={{
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem"
        }}
        className="navbar-links-mobile"
      >
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/gyms" onClick={() => setMenuOpen(false)}>Gyms</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
        <Link to="/book-session" onClick={() => setMenuOpen(false)}>Book Session</Link>
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          justifyContent: "center"
        }}
        className="navbar-links-desktop"
      >
        <Link to="/">Home</Link>
        <Link to="/gyms">Gyms</Link>
        <Link to="/about">About</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/book-session">Book Session</Link>
      </div>
      {/* Responsive CSS (add to your main CSS if you want to move it out of here) */}
      <style>
        {`
        @media (max-width: 700px) {
          .navbar-links-desktop { display: none !important; }
          .navbar-hamburger { display: inline-block !important; }
          .navbar-links-mobile { display: flex !important; }
        }
        @media (min-width: 701px) {
          .navbar-links-desktop { display: flex !important; }
          .navbar-hamburger { display: none !important; }
          .navbar-links-mobile { display: none !important; }
        }
        `}
      </style>
    </nav>
  );
}
