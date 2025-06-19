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
        .navbar {
          width: 100%;
          background: #fff;
          border-bottom: 1px solid #e5e8ef;
          position: sticky;
          top: 0;
          z-index: 2000;
        }
        .navbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          max-width: 100vw;
          padding: 0 0.5rem;
          position: relative;
        }
        .navbar-col {
          display: flex;
          align-items: center;
          min-width: 44px;
        }
        .navbar-col.left, .navbar-col.right {
          flex: 0 0 auto;
          z-index: 3;
        }
        .navbar-col.center {
          flex: 1 1 0%;
          justify-content: center;
          min-width: 0;
          pointer-events: auto;
          z-index: 2;
        }
        .nav-brand-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          pointer-events: auto;
          max-width: 100%;
        }
        .nav-brand-logo {
          height: 32px;
          width: 32px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .nav-brand-word {
          color: #2563eb;
          font-weight: 800;
          font-size: 1.14rem;
          letter-spacing: .5px;
          margin-left: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 110px;
          display: block;
        }
        @media (max-width: 440px) {
          .nav-brand-word {
            max-width: 70vw;
            font-size: 0.98rem;
          }
        }
        .navbar-hamburger {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          border-radius: 50%;
          cursor: pointer;
        }
        .navbar-hamburger:active,
        .navbar-hamburger:focus {
          background: #f3f6ff;
        }
        .hamburger-icon,
        .hamburger-icon::before,
        .hamburger-icon::after {
          background: #222;
          height: 3px;
          width: 22px;
          border-radius: 2px;
          content: '';
          display: block;
          position: relative;
          transition: all .24s cubic-bezier(.4,1,.3,1);
        }
        .hamburger-icon::before,
        .hamburger-icon::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 3px;
        }
        .hamburger-icon::before { top: -7px; }
        .hamburger-icon::after { top: 7px; }
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon { background: transparent;}
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon::before { transform: translateY(7px) rotate(45deg);}
        .navbar-hamburger[aria-expanded="true"] .hamburger-icon::after { transform: translateY(-7px) rotate(-45deg);}
        .nav-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 16px;
          padding: 0.39rem 1.1rem;
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
        .nav-avatar-menu { position: relative; display: inline-block; }
        .nav-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2563eb22; color: #2563eb; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #2563eb55; margin-left: 0.4rem; transition: box-shadow .13s;}
        .nav-avatar:focus { outline: none; box-shadow: 0 0 0 2px #2563eb55; }
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
        .nav-section-col { margin-bottom: 1.1rem; display: flex; flex-direction: column; gap: 0.5rem;}
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
        @media (max-width: 600px) {
          .navbar-row { padding: 0 0.05rem; }
          .nav-brand-logo { height: 25px; width: 25px;}
          .nav-brand-word { font-size: 0.91rem;}
          .nav-btn { font-size: 0.93rem; padding: 0.37rem 0.7rem;}
        }
      `}</style>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-row">
          {/* Hamburger (left) */}
          <div className="navbar-col left">
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
          {/* Center Brand */}
          <div className="navbar-col center">
            <NavLink to="/" className="nav-brand-link">
              <img src={fitspotLogo} alt={NAV_LABELS.brand + " Logo"} className="nav-brand-logo" />
              <span className="nav-brand-word">{NAV_LABELS.brand}</span>
            </NavLink>
          </div>
          {/* Notification, theme, avatar/login (right) */}
          <div className="navbar-col right">
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
        {/* Mobile menu overlay and links */}
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
              <div className="nav-section-col">
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
              <div className="nav-section-col">
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
