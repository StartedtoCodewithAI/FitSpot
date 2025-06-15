import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";
import ThemeToggle from "./ThemeToggle";

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
    return () => listener?.unsubscribe?.();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  }

  // Close mobile menu when route changes or on larger screens
  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("hashchange", closeMenu);
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("hashchange", closeMenu);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <style>{`
        .nav-root {
          width: 100%;
          background: #fff;
          border-bottom: 1px solid #e5e5e5;
          position: relative;
          z-index: 2000;
          box-sizing: border-box;
        }
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.6rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }
        .nav-brand {
          display: flex;
          align-items: center;
        }
        .nav-brand img {
          max-width: 100%;
          width: auto;
          height: 38px;
          border-radius: 8px;
          display: block;
        }
        .nav-brand span {
          color: var(--color-primary, #2563eb);
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: .5px;
          white-space: nowrap;
        }
        .navbar-links-desktop {
          display: flex;
          gap: 1.3rem;
          align-items: center;
        }
        .navbar-links-desktop a {
          color: #222;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.04rem;
          padding: .3rem 0.6rem;
          border-radius: 5px;
          transition: background .11s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .navbar-links-desktop a.active, .navbar-links-desktop a:hover {
          background: #e0edff;
          color: #2563eb;
        }
        .nav-icons {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .navbar-hamburger {
          display: none;
          font-size: 2rem;
          background: none;
          border: none;
          color: #444;
          cursor: pointer;
          padding: 0 0.3rem;
        }
        .nav-btn {
          margin-left: 0.2rem;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 0.39rem 1.1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background .16s;
          text-decoration: none;
          display: inline-block;
        }
        .nav-btn:hover {
          background: #174bbd;
          color: #fff;
        }
        @media (max-width: 900px) {
          .nav-inner {
            padding-left: 0.4rem;
            padding-right: 0.4rem;
          }
          .navbar-links-desktop {
            display: none;
          }
          .navbar-hamburger {
            display: inline-block;
          }
        }
        /* Hamburger menu overlay */
        .navbar-links-mobile {
          display: none;
        }
        @media (max-width: 900px) {
          .navbar-links-mobile {
            display: flex;
            flex-direction: column;
            position: fixed;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.98);
            z-index: 3000;
            padding: 2rem 1.2rem 2.5rem 1.2rem;
            box-sizing: border-box;
            overflow-y: auto;
            animation: fadeInNavMenu .18s;
          }
          @keyframes fadeInNavMenu {
            from { opacity: 0; transform: translateY(-12px);}
            to { opacity: 1; transform: none;}
          }
          .navbar-links-mobile a,
          .navbar-links-mobile button {
            display: block;
            width: 100%;
            padding: 0.9rem 0.8rem;
            font-size: 1.13rem;
            color: #222;
            background: none;
            border: none;
            border-radius: 7px;
            text-align: left;
            margin-bottom: 0.7rem;
            font-weight: 600;
            text-decoration: none;
            transition: background .13s;
          }
          .navbar-links-mobile a.active,
          .navbar-links-mobile a:hover,
          .navbar-links-mobile button:hover {
            background: #e0edff;
            color: #2563eb;
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

          <div className="nav-icons">
            <button
              className="navbar-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(open => !open)}
            >
              {menuOpen ? "\u2716" : "\u2630"}
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
              </>
            )}
          </div>
        </div>

        {/* Hamburger menu overlay */}
        {menuOpen && (
          <div
            className="navbar-links-mobile"
            id="mobile-nav"
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
                className="nav-btn"
                style={{ width: "100%", textAlign: "left" }}
                onClick={handleLogout}
              >
                {NAV_LABELS.logout}
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
