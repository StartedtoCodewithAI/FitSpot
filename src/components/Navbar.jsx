import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import notifications from "../data/notifications";

// Uses CSS variables for colors (see CSS section below)
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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

  const clearNotifications = () => setNotifList([]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/gyms", label: "Explore" },
    { to: "/my-sessions", label: "My Sessions" }
  ];

  return (
    <nav className="nav-root">
      <div className="nav-inner">
        {/* Hamburger for mobile */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="navbar-hamburger"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        {/* Brand */}
        <div className="nav-brand">
          <Link to="/">FitSpot</Link>
        </div>

        {/* Desktop nav */}
        <div className="navbar-links-desktop">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}>{label}</Link>
          ))}
        </div>

        {/* Book Session FAB/Link */}
        <Link to="/book-session" className="nav-fab" aria-label="Book a session">
          +
        </Link>

        {/* Notification bell and profile */}
        <div className="nav-icons">
          {/* Notification bell */}
          <div ref={notifRef} className="nav-notif-wrap">
            <button
              className="nav-notif"
              aria-label="Show notifications"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              tabIndex={0}
            >
              <span role="img" aria-label="Notifications">🔔</span>
              {notifList.length > 0 && (
                <span className="nav-notif-badge">{notifList.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="nav-notif-dropdown" tabIndex={0}>
                <div className="nav-notif-title">Notifications</div>
                {notifList.length === 0 ? (
                  <div className="nav-notif-none">No new notifications.</div>
                ) : (
                  <ul className="nav-notif-list">
                    {notifList.map(n =>
                      <li key={n.id}>{n.text}</li>
                    )}
                  </ul>
                )}
                <button onClick={clearNotifications} className="nav-notif-clear">
                  Clear all
                </button>
              </div>
            )}
          </div>
          {/* Profile/Avatar Dropdown */}
          <div ref={profileRef} className="nav-profile-wrap">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="nav-profile-btn"
              aria-label="Profile menu"
              tabIndex={0}
            >
              {user && profile && profile.avatar_url
                ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="nav-avatar"
                    />
                  )
                : user && user.email
                  ? <span className="nav-avatar">{user.email[0].toUpperCase()}</span>
                  : <span className="nav-avatar">👤</span>
              }
            </button>
            {profileOpen && (
              <div className="nav-profile-dropdown" tabIndex={0}>
                <div className="nav-profile-title">
                  {user ? `Hi, ${user.email}!` : "Welcome!"}
                </div>
                <Link to="/profile">Account</Link>
                <Link to="/my-codes">Rewards</Link>
                <Link to="/about">About</Link>
                {user ? (
                  <button onClick={handleLogout} className="nav-profile-logout">
                    Logout
                  </button>
                ) : (
                  <button onClick={handleLogin} className="nav-profile-login">
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="navbar-links-mobile" style={{display: menuOpen ? 'flex' : 'none'}}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link
          to="/book-session"
          className="nav-mobile-book"
          onClick={() => setMenuOpen(false)}
        >
          Book Session
        </Link>
      </div>
    </nav>
  );
}
