import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";
import ThemeToggle from "./ThemeToggle";

// i18n-ready labels
const NAV_LABELS = {
  brand: "FitSpot",
  gyms: "Gyms",
  about: "About",
  profile: "Profile",
  myCodes: "My Codes",
  login: "Login",
  signup: "Sign Up",
  logout: "Logout",
};

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setUser(sessionData?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  }

  // Close mobile menu when route changes
  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("hashchange", closeMenu);
    return () => window.removeEventListener("hashchange", closeMenu);
  }, []);

  return (
    <nav className="nav-root" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        {/* Brand/Logo */}
        <div className="nav-brand" style={{ display: "flex", alignItems: "center" }}>
          <NavLink to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={fitspotLogo}
              alt={`${NAV_LABELS.brand} Logo`}
              style={{ height: 38, marginRight: 12, borderRadius: 8 }}
            />
            <span
              style={{
                color: "var(--color-primary)",
                fontWeight: 800,
                fontSize: "1.25rem",
                letterSpacing: ".5px"
              }}
            >
              {NAV_LABELS.brand}
            </span>
          </NavLink>
        </div>

        {/* Desktop links */}
        <div className="navbar-links-desktop">
          <NavLink to="/gyms" className={({ isActive }) => (isActive ? "active" : "")}>
            {NAV_LABELS.gyms}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            {NAV_LABELS.about}
          </NavLink>
          {user && (
            <>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                {NAV_LABELS.profile}
              </NavLink>
              <NavLink to="/my-codes" className={({ isActive }) => (isActive ? "active" : "")}>
                {NAV_LABELS.myCodes}
              </NavLink>
            </>
          )}
        </div>

        {/* Right section: Hamburger, Theme, Auth, Avatar, Notifications */}
        <div className="nav-icons">
          {/* Notification bell example, only shown if you have notifications logic */}
          {/* <button className="nav-notif" aria-label="Notifications">
            <span role="img" aria-label="bell">🔔</span>
            <span className="nav-notif-badge">3</span>
          </button> */}

          {/* Hamburger for mobile */}
          <button
            className="navbar-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? "✖" : "☰"}
          </button>
          <ThemeToggle aria-label="Toggle dark mode" />
          {!user ? (
            <>
              <NavLink to="/login" className="nav-btn">
                {NAV_LABELS.login}
              </NavLink>
              <NavLink to="/signup" className="nav-btn">
                {NAV_LABELS.signup}
              </NavLink>
            </>
          ) : (
            <>
              {/* Avatar and dropdown (optional, if user has avatar) */}
              {/* <button className="nav-profile-btn" aria-label="Open profile menu">
                <img className="nav-avatar" src={user.avatar_url} alt="Profile" />
              </button> */}
              <button className="nav-profile-logout" onClick={handleLogout}>
                {NAV_LABELS.logout}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className="navbar-links-mobile"
        id="mobile-nav"
        hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        <NavLink to="/gyms" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
          {NAV_LABELS.gyms}
        </NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
          {NAV_LABELS.about}
        </NavLink>
        {user && (
          <>
            <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              {NAV_LABELS.profile}
            </NavLink>
            <NavLink to="/my-codes" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              {NAV_LABELS.myCodes}
            </NavLink>
          </>
        )}
        {!user ? (
          <>
            <NavLink to="/login" onClick={() => setMenuOpen(false)} className="nav-btn">
              {NAV_LABELS.login}
            </NavLink>
            <NavLink to="/signup" onClick={() => setMenuOpen(false)} className="nav-btn">
              {NAV_LABELS.signup}
            </NavLink>
          </>
        ) : (
          <button
            className="nav-profile-logout"
            style={{ width: "100%", textAlign: "left" }}
            onClick={handleLogout}
          >
            {NAV_LABELS.logout}
          </button>
        )}
      </div>
    </nav>
  );
}
