import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";
import ThemeToggle from "./ThemeToggle";

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
    <nav className="nav-root">
      <div className="nav-inner">
        {/* Left: Logo/Brand */}
        <div className="nav-brand" style={{ display: "flex", alignItems: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={fitspotLogo}
              alt="FitSpot Logo"
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
              FitSpot
            </span>
          </Link>
        </div>

        {/* Middle: Desktop links */}
        <div className="navbar-links-desktop">
          <Link to="/gyms">Gyms</Link>
          <Link to="/about">About</Link>
          {user && (
            <>
              <Link to="/profile">Profile</Link>
              <Link to="/my-codes">My Codes</Link>
            </>
          )}
        </div>

        {/* Right: Hamburger + Theme + Auth */}
        <div className="nav-icons">
          {/* Hamburger for mobile */}
          <button
            className="navbar-hamburger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? "✖" : "☰"}
          </button>
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/login" className="nav-profile-login">
                Login
              </Link>
              <Link to="/signup" className="nav-fab">
                Sign Up
              </Link>
            </>
          ) : (
            <button className="nav-profile-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="navbar-links-mobile">
          <Link to="/gyms" onClick={() => setMenuOpen(false)}>
            Gyms
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          {user && (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/my-codes" onClick={() => setMenuOpen(false)}>
                My Codes
              </Link>
            </>
          )}
          {!user ? (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="nav-profile-login">
                Login
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="nav-mobile-book">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              className="nav-profile-logout"
              style={{ width: "100%", textAlign: "left" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
