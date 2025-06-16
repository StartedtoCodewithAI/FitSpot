import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

const NAV_LABELS = {
  brand: "FitSpot",
  gyms: "Gyms",
  about: "About",
  profile: "Profile",
  myCodes: "My Codes",
  myBookings: "My Bookings",
  myCalendar: "My Calendar", // <-- Added label
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
  { to: "/my-bookings", label: NAV_LABELS.myBookings },
  { to: "/my-calendar", label: NAV_LABELS.myCalendar }, // <-- Added calendar link
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setUser(sessionData?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.unsubscribe?.();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = e => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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
      <style>{/* ...your styles remain unchanged... */}</style>
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
            <NotificationBell />
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
        >
          {menuOpen && (
            <div className={`navbar-links-mobile open`} id="mobile-nav" aria-label="Mobile navigation">
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
