import React, { useEffect, useState, useCallback, useRef } from "react";
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
  myCalendar: "My Calendar",
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
  { to: "/my-calendar", label: NAV_LABELS.myCalendar },
];

function getInitials(user) {
  if (!user) return "";
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent body scroll when mobile menu is open
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

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setAvatarMenuOpen(false);
  }, [location]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = e => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Avatar dropdown: close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [avatarMenuOpen]);

  // Overlay click for closing mobile menu
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
    setAvatarMenuOpen(false);
    navigate("/login");
  }

  function getDisplayName(user) {
    if (!user) return "";
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.email) return user.email;
    return "";
  }

  return (
    <>
      <style>{`
        .nav-root { width: 100%; background: #fff; border-bottom: 1px solid #e5e8ef; position: sticky; top: 0; z-index: 2000;}
        .nav-inner { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 0.7rem 2rem 0.7rem 1.5rem; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          width: 100%; 
        }
        .nav-brand { display: flex; align-items: center; gap: 0.75rem; }
        .nav-brand img { height: 40px; border-radius: 10px; }
        .nav-brand span { color: #2563eb; font-weight: 800; font-size: 1.4rem; letter-spacing: .5px; }
        .navbar-links-desktop { display: flex; gap: 1.8rem; align-items: center; }
        .navbar-link { color: #202942; text-decoration: none; font-weight: 600; font-size: 1.06rem; padding: .45rem 1.05rem; border-radius: 6px; transition: background .15s, color .15s; white-space: nowrap; }
        .navbar-link.active, .navbar-link:hover { background: #f3f6ff; color: #2563eb; }
        .navbar-link-disabled { pointer-events: none; opacity: 0.6; background: none !important; color: #aaa !important; cursor: not-allowed; }
        .nav-icons { display: flex; align-items: center; gap: 0.8rem; z-index: 10001; position: relative; }
        .navbar-hamburger { display: none; flex-direction: column; justify-content: center; align-items: center; width: 42px; height: 42px; border: none; background: none; border-radius: 10px; margin-left: 0.4rem; cursor: pointer; transition: background 0.13s; }
        .navbar-hamburger:hover { background: #f3f6ff; }
        .hamburger-icon, .hamburger-icon::before, .hamburger-icon::after { display: block; background: #222; height: 3.3px; border-radius: 2px; width: 28px; transition: all .21s cubic-bezier(.4,1,.3,1); content: ''; position: relative;}
        .hamburger-icon::before, .hamburger-icon::after { content: ''; position: absolute; left: 0; width: 28px; height: 3.3px; background: #222; border-radius: 2px;}
        .hamburger-icon::before { top: -9px; }
        .hamburger-icon::after { top: 9px; }
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon { background: transparent;}
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon::before { transform: translateY(9px) rotate(45deg);}
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon::after { transform: translateY(-9px) rotate(-45deg);}
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
          box-shadow: 0 1px 8px #2563eb13;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          transition: background .16s, box-shadow .16s;
          white-space: nowrap; /* prevent wrapping for "Sign Up" */
        }
        .nav-btn:hover { background: #174bbd; color: #fff;}
        .nav-avatar-menu { position: relative; display: inline-block; }
        .nav-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2563eb22; color: #2563eb; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #2563eb55; margin-left: 0.6rem; transition: box-shadow .13s;}
        .nav-avatar:focus { outline: none; box-shadow: 0 0 0 2px #2563eb55; }
        /* --- THE FIXED DROPDOWN --- */
        .avatar-dropdown {
          position: fixed !important;
          right: 2rem;
          top: 4.3rem;
          min-width: 170px;
          background: #fff;
          border: 1px solid #e5e8ef;
          border-radius: 8px;
          box-shadow: 0 6px 24px #2222;
          z-index: 2147483647 !important;
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0;
        }
        .avatar-dropdown .dropdown-link { padding: 0.7rem 1.1rem; background: none; color: #202942; border: none; text-align: left; text-decoration: none; font-size: 1rem; cursor: pointer; transition: background 0.13s, color 0.13s;}
        .avatar-dropdown .dropdown-link:hover { background: #f3f6ff; color: #2563eb; }
        .navbar-overlay { display: none; }
        .navbar-overlay.open { display: flex; position: fixed; inset: 0; background: rgba(24,30,40,0.17); z-index: 99998; justify-content: center; align-items: flex-start; animation: overlayFadeIn .18s;}
        @keyframes overlayFadeIn { from { opacity: 0;} to { opacity: 1;} }
        .navbar-links-mobile { display: none; background: #fff; border-radius: 22px; margin-top: 3.2rem; box-shadow: 0 8px 40px #2224; min-width: 90vw; max-width: 400px; width: 98vw; padding: 2.1rem 1.5rem 2rem 1.5rem; box-sizing: border-box; overflow-y: auto; animation: fadeInNavMenu .18s; flex-direction: column; position: fixed; top: 0; right: 0; left: 0; z-index: 99999;}
        .navbar-links-mobile.open { display: flex !important; }
        @keyframes fadeInNavMenu { from { opacity: 0; transform: translateY(-18px);} to { opacity: 1; transform: none;} }
        .nav-menu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
        .nav-menu-title { font-weight: 700; font-size: 1.13rem; letter-spacing: 0.5px;}
        .menu-close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #aaa; transition: color .13s;}
        .menu-close-btn:hover { color: #2563eb; }
        .nav-section { margin-bottom: 1.1rem; display: flex; flex-direction: column; gap: 0.5rem;}
        .mobile-profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.3rem;
        }
        .mobile-profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #2563eb22;
          color: #2563eb;
          font-size: 1.5rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #2563eb55;
          margin-bottom: 0.5rem;
        }
        .mobile-profile-name {
          font-size: 1.06rem;
          font-weight: 700;
          color: #202942;
        }
        .mobile-profile-email {
          font-size: 0.98rem;
          color: #666;
        }

        @media (max-width: 900px) {
          .navbar-links-desktop { display: none; }
          .navbar-hamburger { display: flex; }
        }
        /* Make navbar narrower on very small screens */
        @media (max-width: 600px) {
          .nav-inner {
            padding: 0.7rem 0.6rem;
          }
          .nav-btn {
            padding: 0.39rem 0.5rem;
          }
        }
      `}</style>
      <nav className="nav-root" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <div className="nav-brand">
            <NavLink to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img src={fitspotLogo} alt={`${NAV_LABELS.brand} Logo`} />
              <span>{NAV_LABELS.brand}</span>
            </NavLink>
          </div>
          <div className="navbar-links-desktop">
            {NAV_LINKS.map(link =>
              link.protected && !user ? (
                <span className="navbar-link navbar-link-disabled" key={link.to} title="Please log in first">
                  {link.label} <span style={{ fontSize: "0.95em" }}>(login required)</span>
                </span>
              ) : (
                <NavLink to={link.to} key={link.to} className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}>
                  {link.label}
                </NavLink>
              )
            )}
            {user && (
              <div className="nav-avatar-menu" ref={avatarMenuRef}>
                <button
                  className="nav-avatar"
                  title={user.email}
                  onClick={() => setAvatarMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={avatarMenuOpen}
                  style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                >
                  {getInitials(user)}
                </button>
                {avatarMenuOpen && (
                  <div className="avatar-dropdown" role="menu">
                    <NavLink to="/profile" className="dropdown-link" onClick={() => setAvatarMenuOpen(false)}>Profile</NavLink>
                    <NavLink to="/my-codes" className="dropdown-link" onClick={() => setAvatarMenuOpen(false)}>My Codes</NavLink>
                    <NavLink to="/my-bookings" className="dropdown-link" onClick={() => setAvatarMenuOpen(false)}>My Bookings</NavLink>
                    <NavLink to="/my-calendar" className="dropdown-link" onClick={() => setAvatarMenuOpen(false)}>My Calendar</NavLink>
                    <button className="dropdown-link" onClick={async () => { await handleLogout(); setAvatarMenuOpen(false); }}>Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="nav-icons">
            {/* Hamburger menu comes first */}
            <button
              className="navbar-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(open => !open)}
            >
              <span className="hamburger-icon" />
            </button>
            <NotificationBell />
            <ThemeToggle aria-label="Toggle dark mode" />
            {!user ? (
              <>
                <NavLink to="/login" className="nav-btn">{NAV_LABELS.login}</NavLink>
                <NavLink to="/signup" className="nav-btn">{NAV_LABELS.signup}</NavLink>
              </>
            ) : null}
          </div>
        </div>
        <div className={`navbar-overlay${menuOpen ? " open" : ""}`} ref={overlayRef}>
          {menuOpen && (
            <div className={`navbar-links-mobile open`} id="mobile-nav" aria-label="Mobile navigation">
              <div className="nav-menu-header">
                <div className="nav-menu-title">Menu</div>
                <button className="menu-close-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)} tabIndex={0}>
                  &times;
                </button>
              </div>
              {user && (
                <div className="mobile-profile-header">
                  <div className="mobile-profile-avatar">{getInitials(user)}</div>
                  <div className="mobile-profile-name">{getDisplayName(user)}</div>
                  <div className="mobile-profile-email">{user.email}</div>
                </div>
              )}
              <div className="nav-section">
                {NAV_LINKS.map(link =>
                  link.protected && !user ? (
                    <span className="navbar-link-disabled" key={link.to} title="Please log in first">
                      {link.label} (login required)
                    </span>
                  ) : (
                    <NavLink to={link.to} key={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
                      {link.label}
                    </NavLink>
                  )
                )}
                {user && USER_LINKS.map(link => (
                  <NavLink to={link.to} key={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="nav-section">
                {!user ? (
                  <>
                    <NavLink to="/login" className="nav-btn">{NAV_LABELS.login}</NavLink>
                    <NavLink to="/signup" className="nav-btn">{NAV_LABELS.signup}</NavLink>
                  </>
                ) : (
                  <button className="nav-btn" style={{ width: "100%", textAlign: "left" }} onClick={handleLogout}>
                    {NAV_LABELS.logout}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
