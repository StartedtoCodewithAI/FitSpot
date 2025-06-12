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

  // Menu content as a function for reuse
  function MenuContent({ onClick }) {
    return (
      <>
        <li>
          <Link
            to="/"
            className={location.pathname === "/" ? "active" : ""}
            onClick={onClick}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/gyms"
            className={location.pathname.startsWith("/gyms") ? "active" : ""}
            onClick={onClick}
          >
            Gyms
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className={location.pathname === "/about" ? "active" : ""}
            onClick={onClick}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className={location.pathname === "/profile" ? "active" : ""}
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
            <button className="nav-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={location.pathname === "/login" ? "active" : ""}
              onClick={onClick}
            >
              Login
            </Link>
          )}
        </li>
      </>
    );
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

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
        li a, .nav-btn {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: color 0.3s, background 0.3s;
          border: none;
          background: none;
          cursor: pointer;
        }
        li a.active, .nav-btn.active {
          color: #ffe082;
        }
        li a:hover, .nav-btn:hover {
          color: #bbdefb;
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
        /* Mobile Styles */
        @media (max-width: 768px) {
          ul {
            display: none;
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
          <ul
            className="open"
            style={{
              position: 'fixed',
              top: 56, // nav height (adjust if your nav is a different height)
              right: 0,
              left: 'auto',
              background: '#fff',
              color: '#1976d2',
              flexDirection: 'column',
              padding: '1rem 0.5rem',
              width: '90vw',
              maxWidth: 320,
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e3e6ea',
              opacity: 1,
              pointerEvents: 'auto',
              zIndex: 2000,
              margin: 0
            }}
          >
            <MenuContent onClick={() => setIsOpen(false)} />
          </ul>
          {/* Optional: click outside to close */}
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
