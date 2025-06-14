import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import notifications from "../data/notifications";

// CSS variables for purple palette (add these to your global CSS for best results)
/*
:root {
  --color-primary: #6C47FF;
  --color-primary-dark: #4B1FA4;
  --color-accent: #E76BF3;
  --color-bg-light: #FAF9FF;
  --color-bg-dark: #181528;
  --color-text-light: #222;
  --color-text-dark: #fff;
  --color-success: #27ae60;
  --color-danger: #ff5252;
  --color-border: #E6E0F8;
}
*/

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

  // Main navigation links
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/gyms", label: "Explore" },
    { to: "/my-sessions", label: "My Sessions" }
  ];

  // Determine color variables based on mode
  const colorVars = darkMode
    ? {
        navBg: "var(--color-bg-dark, #181528)",
        text: "var(--color-text-dark, #fff)",
        primary: "var(--color-primary, #6C47FF)",
        primaryDark: "var(--color-primary-dark, #4B1FA4)",
        accent: "var(--color-accent, #E76BF3)",
        border: "var(--color-border, #4B1FA4)",
        fabTxt: "#fff"
      }
    : {
        navBg: "var(--color-bg-light, #FAF9FF)",
        text: "var(--color-text-light, #222)",
        primary: "var(--color-primary, #6C47FF)",
        primaryDark: "var(--color-primary-dark, #4B1FA4)",
        accent: "var(--color-accent, #E76BF3)",
        border: "var(--color-border, #E6E0F8)",
        fabTxt: "#fff"
      };

  return (
    <nav
      style={{
        background: colorVars.navBg,
        color: colorVars.text,
        padding: "1rem 0.5rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        boxShadow: "0 1px 7px #0002",
        borderBottom: `1.5px solid ${colorVars.border}`
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 900,
        margin: "0 auto"
      }}>
        {/* Hamburger for mobile */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "2rem",
            color: colorVars.primary,
            marginRight: "0.7rem",
            display: "inline-block"
          }}
          className="navbar-hamburger"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        {/* Brand */}
        <div style={{ fontWeight: "bold", fontSize: "1.3rem", flex: "1 1 auto", minWidth: 0 }}>
          <Link to="/" style={{ textDecoration: "none", color: colorVars.primaryDark }}>
            FitSpot
          </Link>
        </div>

        {/* Main navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gap: "0.2rem"
          }}
        >
          {/* Nav Links (hidden on mobile, visible on desktop) */}
          <div className="navbar-links-desktop" style={{
            display: "flex",
            gap: "1.2rem"
          }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: colorVars.primaryDark,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "1rem"
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Book Session FAB/Link */}
          <Link
            to="/book-session"
            style={{
              background: colorVars.primary,
              color: colorVars.fabTxt,
              borderRadius: "50%",
              width: 45,
              height: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              margin: "0 0.8rem",
              boxShadow: `0 2px 8px ${colorVars.primary}55`,
              textDecoration: "none",
              fontWeight: 700,
              border: `2px solid ${colorVars.navBg}`,
              transition: "background 0.2s",
            }}
            className="book-fab"
            aria-label="Book a session"
          >
            +
          </Link>

          {/* Notification bell */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.5rem",
                color: colorVars.primaryDark,
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
              <span role="img" aria-label="Notifications">🔔</span>
              {notifList.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-8px",
                    background: colorVars.accent,
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: "0.8rem",
                    padding: "2px 7px",
                    fontWeight: "bold",
                    border: `2px solid ${colorVars.navBg}`
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
                  background: colorVars.navBg,
                  color: colorVars.text,
                  border: `1px solid ${colorVars.border}`,
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
                    background: colorVars.accent,
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
              color: colorVars.primaryDark,
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
                color: colorVars.primaryDark,
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
                        border: `2px solid ${colorVars.primary}`
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
                  background: colorVars.navBg,
                  color: colorVars.primaryDark,
                  border: `1px solid ${colorVars.border}`,
                  borderRadius: "7px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  minWidth: "170px",
                  zIndex: 40
                }}
                aria-label="Profile dropdown"
                tabIndex={0}
              >
                <div style={{ padding: "0.7rem 1rem", color: colorVars.primaryDark, fontWeight: 500, fontSize: "1rem" }}>
                  {user ? `Hi, ${user.email}!` : "Welcome!"}
                </div>
                <Link to="/profile" style={{ display: "block", padding: "0.6rem 1rem", color: colorVars.text, textDecoration: "none", fontSize: "1rem" }}>
                  Account
                </Link>
                <Link to="/my-codes" style={{ display: "block", padding: "0.6rem 1rem", color: colorVars.text, textDecoration: "none", fontSize: "1rem" }}>
                  Rewards
                </Link>
                <Link to="/about" style={{ display: "block", padding: "0.6rem 1rem", color: colorVars.text, textDecoration: "none", fontSize: "1rem" }}>
                  About
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
                      color: "var(--color-danger, #ff5252)",
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
                      color: colorVars.primaryDark,
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
          background: colorVars.navBg,
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
              color: colorVars.primaryDark,
              textDecoration: "none",
              fontWeight: 600,
              borderBottom: `1px solid ${colorVars.border}`
            }}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        {/* Book Session as a button in mobile nav */}
        <Link
          to="/book-session"
          style={{
            display: "block",
            margin: "1rem auto",
            width: "80%",
            background: colorVars.primary,
            color: "#fff",
            borderRadius: "8px",
            padding: "0.7rem",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.2rem",
            textDecoration: "none"
          }}
          onClick={() => setMenuOpen(false)}
        >
          Book Session
        </Link>
      </div>
    </nav>
  );
}
