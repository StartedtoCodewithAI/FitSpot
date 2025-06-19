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
    setAvatarMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = e => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-brand-center {
          position: absolute;
          left: 0; right: 0;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          text-align: center;
          width: fit-content;
          top: 0; bottom: 0; height: 62px;
        }
        .nav-brand-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .nav-brand-center img { height: 40px; border-radius: 10px; }
        .nav-brand-center span { color: #2563eb; font-weight: 800; font-size: 1.4rem; letter-spacing: .5px; margin-left: 9px;}
        .nav-left,
        .nav-right {
          position: absolute;
          top: 0;
          height: 100%;
          display: flex;
          align-items: center;
        }
        .nav-left { left: 14px; }
        .nav-right { right: 18px; gap: 0.7rem; }
        .navbar-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 42px;
          height: 42px;
          border: none;
          background: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.13s;
        }
        .navbar-hamburger:hover { background: #f3f6ff; }
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
          left: 0;
          width: 28px;
          height: 3.3px;
          background: #222;
          border-radius: 2px;
        }
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
          white-space: nowrap;
        }
        .nav-btn:hover { background: #174bbd; color: #fff;}
        @media (max-width: 900px) {
          .nav-inner { padding-left: 0.2rem; padding-right: 0.2rem;}
        }
      `}</style>
      <nav className="nav-root" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          {/* Left: Hamburger */}
          <div className="nav-left">
            <button
              className="navbar-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(open => !open)}
            >
              <span className="hamburger-icon" />
            </button>
          </div>
          {/* Center: Brand */}
          <div className="nav-brand-center">
            <NavLink to="/" className="nav-brand-link">
              <img src={fitspotLogo} alt={`${NAV_LABELS.brand} Logo`} />
              <span>{NAV_LABELS.brand}</span>
            </NavLink>
          </div>
          {/* Right: Notification, Theme, Login/Signup or Avatar */}
          <div className="nav-right">
            <NotificationBell />
            <ThemeToggle aria-label="Toggle dark mode" />
            {!user ? (
              <>
                <NavLink to="/login" className="nav-btn">{NAV_LABELS.login}</NavLink>
                <NavLink to="/signup" className="nav-btn">{NAV_LABELS.signup}</NavLink>
              </>
            ) : (
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
        </div>
        {/* Mobile menu overlay and links (unchanged from your version) */}
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
