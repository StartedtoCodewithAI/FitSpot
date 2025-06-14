import React, { useState } from "react";
import { Link } from "react-router-dom";

// Dummy authentication and notifications state.
// In a real app, replace with actual state management/auth logic.
const isAuthenticatedDefault = true;
const userName = "Alex";
const unreadNotifications = 3;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(isAuthenticatedDefault);
  const [darkMode, setDarkMode] = useState(false);

  // Example search handler (replace with your search logic)
  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${search}`);
    setSearch("");
  };

  // Dummy logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setProfileOpen(false);
    alert("Logged out!");
  };

  // Dummy login handler
  const handleLogin = () => {
    setIsAuthenticated(true);
    setProfileOpen(false);
    alert("Logged in!");
  };

  const handleDarkModeToggle = () => setDarkMode((d) => !d);

  return (
    <nav
      style={{
        background: darkMode ? "#222" : "#eee",
        color: darkMode ? "#fff" : "#222",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        minHeight: "72px",
        transition: "background 0.3s, color 0.3s"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {/* Hamburger for mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer",
            color: darkMode ? "#fff" : "#333",
            marginRight: "1rem",
            minWidth: "44px",
            minHeight: "44px",
            lineHeight: "1"
          }}
          className="navbar-hamburger"
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Brand / Logo */}
        <div style={{ fontWeight: "bold", fontSize: "1.3rem", flex: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: darkMode ? "#fff" : "#111" }}>
            FitSpot
          </Link>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            alignItems: "center",
            background: darkMode ? "#333" : "#fff",
            borderRadius: "4px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            marginRight: "1rem",
            padding: "0.2rem 0.5rem"
          }}
        >
          <input
            type="text"
            placeholder="Search gyms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: darkMode ? "#fff" : "#111",
              padding: "0.2rem 0.3rem",
              fontSize: "1rem"
            }}
          />
          <button
            type="submit"
            style={{
              background: darkMode ? "#444" : "#333",
              color: "#fff",
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

        {/* Notifications */}
        <div style={{ position: "relative", marginRight: "1rem" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: darkMode ? "#fff" : "#333"
            }}
            aria-label="Notifications"
          >
            🔔
            {unreadNotifications > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-8px",
                  background: "#FF5252",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "0.8rem",
                  padding: "2px 7px",
                  fontWeight: "bold",
                  border: "2px solid #fff"
                }}
              >
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={handleDarkModeToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.7rem",
            color: darkMode ? "#FFD700" : "#111",
            marginRight: "1rem"
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Profile/Avatar Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.6rem",
              marginLeft: "0.5rem",
              color: darkMode ? "#FFD700" : "#111"
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
                background: darkMode ? "#222" : "#fff",
                border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                borderRadius: "7px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                minWidth: "150px",
                zIndex: 10
              }}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div style={{ padding: "0.9rem 1rem", color: darkMode ? "#FFD700" : "#333", fontWeight: 500 }}>
                {isAuthenticated ? `Hi, ${userName}!` : "Welcome!"}
              </div>
              <Link to="/profile" style={{ display: "block", padding: "0.7rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none" }}>Profile</Link>
              <Link to="/my-codes" style={{ display: "block", padding: "0.7rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none" }}>My Codes</Link>
              <Link to="/book-session" style={{ display: "block", padding: "0.7rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none" }}>Book Session</Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.7rem 1rem",
                    background: "none",
                    border: "none",
                    color: "#d32f2f",
                    cursor: "pointer"
                  }}
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.7rem 1rem",
                    background: "none",
                    border: "none",
                    color: darkMode ? "#FFD700" : "#333",
                    cursor: "pointer"
                  }}
                >
                  Login
                </button>
              )}
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
      {/* Responsive CSS for Navbar */}
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
