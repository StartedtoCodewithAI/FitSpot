import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/FitSpot.png";
import MobileMenuPortal from "./MobileMenuPortal";

function stringToInitials(name) {
  if (!name) return "";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  // Responsive: update on resize
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Menu content as a function for reuse
  function MenuContent({ onClick, mobile = false }) {
    // For mobile, use blue text and yellow active. For desktop, white text and yellow active.
    return (
      <>
        <li>
          <Link
            to="/"
            className={`menu-link${location.pathname === "/" ? " active" : ""}`}
            onClick={onClick}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/gyms"
            className={`menu-link${location.pathname.startsWith("/gyms") ? " active" : ""}`}
            onClick={onClick}
          >
            Gyms
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className={`menu-link${location.pathname === "/about" ? " active" : ""}`}
            onClick={onClick}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className={`menu-link${location.pathname === "/profile" ? " active" : ""}`}
            onClick={onClick}
            style={{ display: "flex", alignItems: "center" }}
          >
            {user ? (
              user.avatar ? (
                <img
                  src={user.avatar}
                  className="avatar-nav"
                  alt="avatar"
                />
              ) : (
                <div className="avatar-nav">
                  {stringToInitials(user.name)}
                </div>
              )
            ) : null}
            Profile
          </Link>
        </li>
        <li>
          {user ? (
            <button className="nav-btn menu-link" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`menu-link${location.pathname === "/login" ? " active" : ""}`}
              onClick={onClick}
            >
              Login
            </Link>
          )}
        </li>
      </>
    );
  }

  return (
    <>
      <style>{`
        nav {
          background-color: #1976d2;
          padding: 0.5rem 1rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
        }
        .logo {
          height: 40px;
          cursor: pointer;
        }
        .flex-spacer {
          flex: 1 1 auto;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          position: relative;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          cursor: pointer;
          margin-left: 1rem;
        }
        .bar {
          height: 3px;
          width: 100%;
          background-color: #fff;
          border-radius: 2px;
          margin: 3px 0;
          transition: all 0.3s ease;
        }
        /* DESKTOP MENU */
        ul {
          list-style: none;
          display: flex;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        li {
          display: flex;
          align-items: center;
        }
        .menu-link {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: color 0.3s, background 0.3s;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
        }
        .menu-link.active {
          color: #ffe082; /* yellow highlight */
        }
        .menu-link:hover, .nav-btn.menu-link:hover {
          color: #bbdefb; /* blue highlight */
          background: #1657b7;
        }
        .avatar-nav {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 0.5rem;
          border: 2px solid #fff;
          background: #e0e7ef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #336699;
        }
        /* MOBILE MENU */
        @media (max-width: 768px) {
          ul {
            display: none;
          }
          .mobile-portal-menu {
            display: flex !important;
            flex-direction: column !important;
            gap: 0;
            position: fixed;
            top: 56px;
            right: 0;
            left: auto;
            background: #fff;
            color: #1976d2;
            padding: 1rem 0.5rem;
            width: 90vw;
            max-width: 320px;
            border-radius: 16px 0 0 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            border: 1px solid #e3e6ea;
            opacity: 1;
            pointer-events: auto;
            z-index: 2000;
            margin: 0;
            animation: slideInMenu .25s cubic-bezier(0.7,0,0.3,1);
          }
          @keyframes slideInMenu {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }
          .mobile-portal-menu li {
            padding: 0.75rem 1.5rem;
            justify-content: flex-start;
          }
          .mobile-portal-menu .menu-link {
            font-size: 1.15rem;
            color: #1976d2;
            font-weight: 600;
            border-radius: 8px;
            background: none;
            padding: 0.5rem 0.75rem;
            transition: background 0.2s, color 0.2s;
            width: 100%;
            text-align: left;
          }
          .mobile-portal-menu .menu-link.active {
            color: #ffe082;
            background: none;
          }
          .mobile-portal-menu .menu-link:hover,
          .mobile-portal-menu .menu-link:focus {
            background: #e3e6ea;
            color: #0d47a1;
          }
          .hamburger {
            display: flex;
            margin-left: 0;
          }
        }
      `}</style>
      <nav>
        <div className="navbar-container">
          <Link to="/">
            <img src={logo} alt="FitSpot Logo" className="logo" />
          </Link>
          <div className="flex-spacer"></div>
          <div className="nav-actions">
            <button
              className="hamburger"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              <span
                className="bar"
                style={{
                  transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                }}
              />
              <span className="bar" style={{ opacity: isOpen ? 0 : 1 }} />
              <span
                className="bar"
                style={{
                  transform: isOpen ? "rotate(-45deg) translate(6px, -6px)" : "none",
                }}
              />
            </button>
            {/* Desktop menu */}
            <ul>
              <MenuContent onClick={() => setIsOpen(false)} />
            </ul>
          </div>
        </div>
      </nav>
      {/* Mobile menu in Portal */}
      {isOpen && isMobile && (
        <MobileMenuPortal>
          <ul className="mobile-portal-menu open">
            <MenuContent onClick={() => setIsOpen(false)} mobile />
          </ul>
          {/* Overlay to close */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1999,
              background: 'rgba(0,0,0,0.01)'
            }}
          />
        </MobileMenuPortal>
      )}
    </>
  );
}
