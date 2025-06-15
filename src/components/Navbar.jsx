import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";
import ThemeToggle from "./ThemeToggle";

// ---- CONFIG ----
const NAV_LABELS = {
  brand: "FitSpot",
  gyms: "Gyms",
  about: "About",
  profile: "Profile",
  myCodes: "My Codes",
  myBookings: "My Bookings", // Added label
  login: "Login",
  signup: "Sign Up",
  logout: "Logout",
};

const NAV_LINKS = [
  { to: "/gyms", label: NAV_LABELS.gyms, protected: true },
  { to: "/about", label: NAV_LABELS.about },
];
const USER_LINKS = [
  { to: "/profile", label: NAV_LABELS.profile },
  { to: "/my-codes", label: NAV_LABELS.myCodes },
  { to: "/my-bookings", label: NAV_LABELS.myBookings }, // Added here!
];

// ---- COMPONENT ----
export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setUser(sessionData?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.unsubscribe?.();
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Keyboard accessibility: close menu on Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = e => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Click outside overlay closes menu
  const overlayRef = useCallback(node => {
    if (!node) return;
    function handleClick(e) {
      if (e.target === node) setMenuOpen(false);
    }
    node.addEventListener("mousedown", handleClick);
    return () => node.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  }

  // User Initials (for avatar placeholder)
  function getInitials(user) {
    if (!user) return "";
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0,2).toUpperCase();
    }
    return "U";
  }

  return (
    <>
      <style>{`
        .nav-root {
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 8px rgba(24,40,68,0.08);
          border-bottom: 1px solid #e5e8ef;
          position: sticky;
          top: 0;
          z-index: 2000;
          box-sizing: border-box;
        }
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.7rem 2rem 0.7rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-brand img {
          height: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(24,40,68,0.06);
        }
        .nav-brand span {
          color: #2563eb;
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: .5px;
          white-space: nowrap;
          text-shadow: 0 1px 2px #00000010;
        }
        .navbar-links-desktop {
          display: flex;
          gap: 1.8rem;
          align-items: center;
        }
        .navbar-link {
          color: #202942;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.06rem;
          padding: .45rem 1.05rem;
          border-radius: 6px;
          transition: background .15s, color .15s;
          white-space: nowrap;
          position: relative;
        }
        .navbar-link.active, .navbar-link:hover {
          background: #f3f6ff;
          color: #2563eb;
          box-shadow: 0 1px 4px #2563eb15;
        }
        .navbar-link.active::after {
          content: '';
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
        }
        .navbar-link-disabled {
          pointer-events: none;
          opacity: 0.6;
          background: none !important;
          color: #aaa !important;
          cursor: not-allowed;
        }
        .nav-icons {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .navbar-hamburger {
          display: inline-flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 42px;
          height: 42px;
          border: none;
          background: none;
          border-radius: 10px;
          margin-left: 0.4rem;
          cursor: pointer;
          transition: background 0.13s;
        }
        .navbar-hamburger:hover {
          background: #f3f6ff;
        }
        .hamburger-icon, .hamburger-icon::before, .hamburger-icon::after {
          display: block;
          background: #222;
          height: 3.3px;
          border-radius: 2px;
          width: 28px;
          transition: all .21s cubic-bezier(.4,1,.3,1);
          content: '';
          position: relative;
        }
        .hamburger-icon::before, .hamburger-icon::after {
          content: '';
          position: absolute;
          left: 0; width: 28px; height: 3.3px; background: #222; border-radius: 2px;
        }
        .hamburger-icon::before {
          top: -9px;
        }
        .hamburger-icon::after {
          top: 9px;
        }
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon {
          background: transparent;
        }
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon::before {
          transform: translateY(9px) rotate(45deg);
        }
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon::after {
          transform: translateY(-9px) rotate(-45deg);
        }
        .nav-btn {
          margin-left: 0.2rem;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 16px;
          padding: 0.39rem 1.3rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background .16s, box-shadow .16s;
          box-shadow: 0 2px 6px #2563eb22;
        }
        .nav-btn:hover {
          background: #174bbd;
          color: #fff;
          box-shadow: 0 2px 12px #2563eb33;
        }
        .nav-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2563eb22;
          color: #2563eb;
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #2563eb55;
          margin-left: 0.6rem;
        }
        /* Hamburger menu overlay */
        .navbar-overlay {
          display: none;
        }
        .navbar-overlay.open {
          display: flex;
          position: fixed;
          inset: 0;
          background: rgba(24,30,40,0.17);
          z-index: 3000;
          justify-content: center;
          align-items: flex-start;
          animation: overlayFadeIn .18s;
        }
        @keyframes overlayFadeIn {
          from { opacity: 0;}
          to { opacity: 1;}
        }
        .navbar-links-mobile {
          background: #fff;
          border-radius: 22px;
          margin-top: 3.2rem;
          box-shadow: 0 8px 40px #2224;
          min-width: 90vw;
          max-width: 400px;
          width: 98vw;
          padding: 2.1rem 1.5rem 2rem 1.5rem;
          box-sizing: border-box;
          overflow-y: auto;
          animation: fadeInNavMenu .18s;
          display: flex;
          flex-direction: column;
        }
        @keyframes fadeInNavMenu {
          from { opacity: 0; transform: translateY(-18px);}
          to { opacity: 1; transform: none;}
        }
        .navbar-links-mobile .nav-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .navbar-links-mobile .nav-menu-title {
          font-weight: 700;
          font-size: 1.25rem;
          color: #2563eb;
          letter-spacing: .7px;
        }
        .navbar-links-mobile .menu-close-btn {
          background: none;
          border: none;
          font-size: 2.1rem;
          color: #222;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.12s;
          padding: 0.2rem 0.7rem;
        }
        .navbar-links-mobile .menu-close-btn:hover {
          background: #e0edff;
          color: #2563eb;
        }
        .navbar-links-mobile .nav-section {
          margin-bottom: 1.7rem;
        }
        .navbar-links-mobile a,
        .navbar-links-mobile button,
        .navbar-links-mobile .navbar-link-disabled {
          display: block;
          width: 100%;
          padding: 1rem 1.1rem;
          font-size: 1.14rem;
          color: #202942;
          background: none;
          border: none;
          border-radius: 7px;
          text-align: left;
          margin-bottom: 0.6rem;
          font-weight: 700;
          text-decoration: none;
          transition: background .15s, color .14s;
          box-shadow: 0 0.5px 1.5px #0001;
          position: relative;
        }
        .navbar-links-mobile a.active,
        .navbar-links-mobile a:hover,
        .navbar-links-mobile button:hover {
          background: #e9f1ff;
          color: #2563eb;
        }
        .navbar-links-mobile a.active::after {
          content: '';
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
        }
        .navbar-links-mobile .navbar-link-disabled {
          pointer-events: none;
          opacity: 0.6;
          background: none !important;
          color: #aaa !important;
          cursor: not-allowed;
        }
        .navbar-links-mobile .nav-btn {
          margin: 0.7rem 0 0 0;
          border-radius: 14px;
          width: 100%;
          font-size: 1.08rem;
        }
        @media (max-width: 900px) {
          .nav-inner {
            padding-left: 0.8rem;
            padding-right: 0.8rem;
          }
          .navbar-links-desktop {
            display: none;
          }
        }
      `}</style>
      <nav className="nav-root" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <div className="nav-brand">
            <NavLink to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img
                src={fitspotLogo}
                alt={`${NAV_LABELS.brand} Logo`}
              />
              <span>
                {NAV_LABELS.brand}
              </span>
            </NavLink>
          </div>

          <div className="navbar-links-desktop">
            {NAV_LINKS.map(link =>
              link.protected && !user ? (
                <span
                  className="navbar-link navbar-link-disabled"
                  key={link.to}
                  title="Please log in first"
                >
                  {link.label} <span style={{ fontSize: "0.95em" }}>(login required)</span>
                </span>
              ) : (
                <NavLink
                  to={link.to}
                  key={link.to}
                  className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}
                >
                  {link.label}
                </NavLink>
              )
            )}
            {user && USER_LINKS.map(link => (
              <NavLink
                to={link.to}
                key={link.to}
                className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-icons">
            <button
              className="navbar-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(open => !open)}
            >
              <span className="hamburger-icon" />
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
                <button className="nav-btn" onClick={handleLogout}>
                  {NAV_LABELS.logout}
                </button>
                <span className="nav-avatar" title={user.email}>{getInitials(user)}</span>
              </>
            )}
          </div>
        </div>

        {/* Hamburger menu overlay */}
        <div
          className={`navbar-overlay${menuOpen ? " open" : ""}`}
          ref={overlayRef}
          style={{ pointerEvents: menuOpen ? "auto" : "none" }}
        >
          {menuOpen && (
            <div className="navbar-links-mobile" id="mobile-nav" aria-label="Mobile navigation">
              <div className="nav-menu-header">
                <div className="nav-menu-title">Menu</div>
                <button
                  className="menu-close-btn"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={0}
                >
                  &times;
                </button>
              </div>
              <div className="nav-section">
                {NAV_LINKS.map(link =>
                  link.protected && !user ? (
                    <span
                      className="navbar-link-disabled"
                      key={link.to}
                      title="Please log in first"
                    >
                      {link.label} (login required)
                    </span>
                  ) : (
                    <NavLink
                      to={link.to}
                      key={link.to}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      {link.label}
                    </NavLink>
                  )
                )}
                {user && USER_LINKS.map(link => (
                  <NavLink
                    to={link.to}
                    key={link.to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="nav-section">
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
                  <button
                    className="nav-btn"
                    style={{ width: "100%", textAlign: "left" }}
                    onClick={handleLogout}
                  >
                    {NAV_LABELS.logout}
                  </button>
                )}
                {user && (
                  <span className="nav-avatar" style={{ marginTop: 16, marginLeft: 0 }}>{getInitials(user)}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
