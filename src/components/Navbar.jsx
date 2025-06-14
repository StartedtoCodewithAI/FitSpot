import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Dummy data for notifications
const notifications = [
  { id: 1, text: "Your session is confirmed!" },
  { id: 2, text: "New gym added near you." },
  { id: 3, text: "Profile updated successfully." },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const [user, setUser] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  // Listen for Supabase auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const closeMenus = (e) => {
      if (
        (notifRef.current && notifRef.current.contains(e.target)) ||
        (profileRef.current && profileRef.current.contains(e.target))
      ) {
        return;
      }
      setProfileOpen(false);
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${search}`);
    setSearch("");
  };

  // Supabase login
  const handleLogin = async () => {
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");
    if (!email || !password) {
      alert("Email and password are required!");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert("Logged in!");
    setProfileOpen(false);
  };

  // Supabase logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    else alert("Logged out!");
    setProfileOpen(false);
  };

  const handleDarkModeToggle = () => setDarkMode((d) => !d);

  const clearNotifications = () => setNotifList([]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/gyms", label: "Gyms" },
    { to: "/about", label: "About" },
    { to: "/profile", label: "Profile" },
    { to: "/book-session", label: "Book Session" },
  ];

  return (
    <nav
      style={{
        background: darkMode ? "#222" : "#eee",
        color: darkMode ? "#fff" : "#222",
        padding: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        minHeight: "72px",
        transition: "background 0.3s, color 0.3s",
        position: "relative",
        zIndex: 20
      }}
      aria-label="Main navigation"
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
            fontSize: "2.2rem",
            cursor: "pointer",
            color: darkMode ? "#fff" : "#333",
            marginRight: "1rem",
            minWidth: "52px",
            minHeight: "52px",
            lineHeight: "1",
            display: "inline-block"
          }}
          className="navbar-hamburger"
          aria-label="Toggle navigation menu"
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
          aria-label="Search gyms"
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
            aria-label="Search gyms"
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
            aria-label="Submit search"
          >
            🔍
          </button>
        </form>

        {/* Notifications */}
        <div style={{ position: "relative", marginRight: "1rem" }} ref={notifRef}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: darkMode ? "#fff" : "#333",
              position: "relative",
              minWidth: "44px",
              minHeight: "44px"
            }}
            aria-label="Show notifications"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            tabIndex={0}
          >
            🔔
            {notifList.length > 0 && (
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
                aria-label={`${notifList.length} unread notifications`}
              >
                {notifList.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "2.2rem",
                background: darkMode ? "#222" : "#fff",
                color: darkMode ? "#fff" : "#222",
                border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                minWidth: "220px",
                padding: "0.8rem 0.4rem",
                zIndex: 30,
                maxHeight: "60vh",
                overflowY: "auto"
              }}
              aria-label="Notifications dropdown"
              tabIndex={0}
            >
              <div style={{ fontWeight: "bold", marginBottom: "0.7rem" }}>Notifications</div>
              {notifList.length === 0 ? (
                <div style={{ color: "#888", fontSize: "0.95rem" }}>No new notifications.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {notifList.map(n =>
                    <li key={n.id} style={{ padding: "0.5rem 0" }}>
                      {n.text}
                    </li>
                  )}
                </ul>
              )}
              <button
                onClick={clearNotifications}
                style={{
                  marginTop: "0.7rem",
                  background: "#FF5252",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.35rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  width: "100%"
                }}
                aria-label="Clear all notifications"
              >
                Clear all
              </button>
            </div>
          )}
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
            marginRight: "1rem",
            minWidth: "44px",
            minHeight: "44px"
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Profile/Avatar Dropdown */}
        <div style={{ position: "relative" }} ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.7rem",
              marginLeft: "0.5rem",
              color: darkMode ? "#FFD700" : "#111",
              borderRadius: "50%",
              overflow: "hidden",
              minWidth: "44px",
              minHeight: "44px"
            }}
            aria-label="Profile menu"
            tabIndex={0}
          >
            {/* Show first letter of email or 👤 */}
            {user && user.email
              ? <span role="img" aria-label="Profile">{user.email[0].toUpperCase()}</span>
              : <span role="img" aria-label="Profile">👤</span>
            }
          </button>
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "2.5rem",
                background: darkMode ? "#222" : "#fff",
                color: darkMode ? "#FFD700" : "#222",
                border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                borderRadius: "7px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                minWidth: "170px",
                zIndex: 40
              }}
              aria-label="Profile dropdown"
              tabIndex={0}
            >
              <div style={{ padding: "0.9rem 1rem", color: darkMode ? "#FFD700" : "#333", fontWeight: 500 }}>
                {user ? `Hi, ${user.email}!` : "Welcome!"}
              </div>
              <Link to="/profile" style={{ display: "block", padding: "0.7rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none" }}>
                Profile
              </Link>
              <Link to="/my-codes" style={{ display: "block", padding: "0.7rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none" }}>
                My Codes
              </Link>
              <Link to="/book-session" style={{ display: "block", padding: "0.7rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none" }}>
                Book Session
              </Link>
              {user ? (
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
                  aria-label="Logout"
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
                  aria-label="Login"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animated Mobile Navigation */}
      <div
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(.55,0,.1,1)",
          background: darkMode ? "#222" : "#f8f8f8",
          marginTop: "0.7rem",
          borderRadius: "8px",
          boxShadow: menuOpen ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
          width: "100vw",
          left: 0,
          right: 0
        }}
        className="navbar-links-mobile"
        aria-label="Mobile navigation"
      >
        <ul style={{ listStyle: "none", margin: 0, padding: "1rem 0" }}>
          {navLinks.map(link => (
            <li key={link.to} style={{ margin: "0.7rem 0", textAlign: "center", fontSize: "1.22rem" }}>
              <Link
                to={link.to}
                style={{
                  color: location.pathname === link.to ? (darkMode ? "#FFD700" : "#1976d2") : (darkMode ? "#fff" : "#333"),
                  fontWeight: location.pathname === link.to ? "bold" : "normal",
                  textDecoration: "none",
                  fontSize: "1.18rem",
                  padding: "0.6rem 1.1rem",
                  borderRadius: "8px",
                  display: "block"
                }}
                onClick={() => setMenuOpen(false)}
                tabIndex={0}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop Navigation */}
      <div
        style={{
          display: "flex",
          gap: "1.3rem",
          marginTop: "1rem",
          justifyContent: "center"
        }}
        className="navbar-links-desktop"
        aria-label="Desktop navigation"
      >
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              color: location.pathname === link.to ? (darkMode ? "#FFD700" : "#1976d2") : (darkMode ? "#fff" : "#333"),
              fontWeight: location.pathname === link.to ? "bold" : "normal",
              textDecoration: "none",
              fontSize: "1.07rem",
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
              background: location.pathname === link.to ? (darkMode ? "#333" : "#e3eafc") : "none"
            }}
            tabIndex={0}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Responsive CSS for Navbar */}
      <style>
        {`
        html, body { max-width: 100vw; overflow-x: hidden; }
        @media (max-width: 700px) {
          nav, .navbar-links-mobile { width: 100vw !important; }
          .navbar-links-mobile ul > li { padding: 10px 0; font-size: 1.18rem; }
          .navbar-hamburger { font-size: 2.2rem !important; min-width: 52px !important; min-height: 52px !important; }
        }
        @media (max-width: 480px) {
          .navbar-links-mobile ul > li { font-size: 1.21rem; }
        }
        @media (max-width: 700px) {
          .navbar-links-desktop { display: none !important; }
          .navbar-hamburger { display: inline-block !important; }
          .navbar-links-mobile { display: block !important; }
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
