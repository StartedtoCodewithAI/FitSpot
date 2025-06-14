import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import notifications from "../data/notifications";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  // Fetch user session and profile
  useEffect(() => {
    async function fetchUserAndProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user || null;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();
        setProfile(profileData || null);
      } else {
        setProfile(null);
      }
    }

    fetchUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data || null));
      } else {
        setProfile(null);
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

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

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

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
        padding: "1rem 0.5rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        boxShadow: "0 1px 7px #0002",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 900,
        margin: "0 auto"
      }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "2rem",
            color: darkMode ? "#FFD700" : "#111",
            marginRight: "0.7rem",
            display: "inline-block"
          }}
          className="navbar-hamburger"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div style={{ fontWeight: "bold", fontSize: "1.3rem", flex: "1 1 auto", minWidth: 0 }}>
          <Link to="/" style={{ textDecoration: "none", color: darkMode ? "#fff" : "#111" }}>
            FitSpot
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gap: "0.2rem"
          }}
        >
          {/* Notifications */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.5rem",
                color: darkMode ? "#fff" : "#333",
                position: "relative",
                minWidth: "44px",
                minHeight: "44px",
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
                  minWidth: "180px",
                  maxWidth: "85vw",
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
                marginLeft: "0.1rem",
                color: darkMode ? "#FFD700" : "#111",
                borderRadius: "50%",
                overflow: "hidden",
                minWidth: "44px",
                minHeight: "44px"
              }}
              aria-label="Profile menu"
              tabIndex={0}
            >
              {user && profile && profile.avatar_url
                ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: darkMode ? "2px solid #FFD700" : "2px solid #2563eb"
                      }}
                    />
                  )
                : user && user.email
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
                  minWidth: "140px",
                  maxWidth: "80vw",
                  zIndex: 40
                }}
                aria-label="Profile dropdown"
                tabIndex={0}
              >
                <div style={{ padding: "0.7rem 1rem", color: darkMode ? "#FFD700" : "#333", fontWeight: 500, fontSize: "1rem" }}>
                  {user ? `Hi, ${user.email}!` : "Welcome!"}
                </div>
                <Link to="/profile" style={{ display: "block", padding: "0.6rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none", fontSize: "1rem" }}>
                  Profile
                </Link>
                <Link to="/my-codes" style={{ display: "block", padding: "0.6rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none", fontSize: "1rem" }}>
                  My Codes
                </Link>
                <Link to="/book-session" style={{ display: "block", padding: "0.6rem 1rem", color: darkMode ? "#fff" : "#333", textDecoration: "none", fontSize: "1rem" }}>
                  Book Session
                </Link>
                {user ? (
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 1rem",
                      background: "none",
                      border: "none",
                      color: "#d32f2f",
                      cursor: "pointer",
                      fontSize: "1rem"
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
                      padding: "0.6rem 1rem",
                      background: "none",
                      border: "none",
                      color: darkMode ? "#FFD700" : "#333",
                      cursor: "pointer",
                      fontSize: "1rem"
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
        }}
        className="navbar-links-mobile"
      >
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: "block",
              padding: "1rem",
              color: darkMode ? "#FFD700" : "#222",
              textDecoration: "none",
              fontWeight: 600,
              borderBottom: "1px solid #ddd"
            }}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop Nav Links */}
      <div
        className="navbar-links-desktop"
        style={{
          display: "flex",
          gap: "1.2rem",
          position: "absolute",
          right: "1.5rem",
          top: "1rem"
        }}
      >
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              color: darkMode ? "#FFD700" : "#222",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem"
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
