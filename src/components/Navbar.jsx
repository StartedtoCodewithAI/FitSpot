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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function MenuContent({ onClick }) {
    const menuItems = [
      { to: "/", label: "Home", match: (p) => p === "/" },
      { to: "/gyms", label: "Gyms", match: (p) => p.startsWith("/gyms") },
      { to: "/my-codes", label: "My Codes", match: (p) => p === "/my-codes" },
      { to: "/about", label: "About", match: (p) => p === "/about" },
      { to: "/profile", label: "Profile", match: (p) => p === "/profile" },
    ];

    return (
      <>
        {menuItems.map(({ to, label, match }) => (
          <li key={to}>
            <Link
              to={to}
              className={`menu-link${match(location.pathname) ? " active" : ""}`}
              onClick={onClick}
              style={label === "Profile" ? { display: "flex", alignItems: "center" } : undefined}
            >
              {label === "Profile" && user ? (
                user.avatar ? (
                  <img src={user.avatar} className="avatar-nav" alt="avatar" />
                ) : (
                  <div className="avatar-nav">{stringToInitials(user.name)}</div>
                )
              ) : null}
              {label}
            </Link>
          </li>
        ))}
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
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 0.5rem 1rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.10);
          backdrop-filter: blur(4px);
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
          height: 44px;
          cursor: pointer;
          filter: drop-shadow(0 2px 8px rgba(60,60,60,0.10));
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
          width: 38px;
          height: 38px;
          background: transparent;
          border: none;
          cursor: pointer;
          margin-left: 1rem;
          z-index: 3000;
        }
        .bar {
          height: 4px;
          width: 100%;
          background: linear-gradient(90deg,#a3a3a3 0%,#71717a 100%);
          border-radius: 2px;
          margin: 5px 0;
          transition: all 0.3s cubic-bezier(0.68,-0.55,0.27,1.55);
          box-shadow: 0 2px 8px #a3a3a344;
        }
        ul {
          list-style: none;
          display: flex;
          gap: 2rem;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        li {
          display: flex;
          align-items: center;
        }
        .menu-link {
          color: #27272a;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
          transition: color 0.3s, box-shadow 0.3s, background 0.3s;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 11px;
          padding: 0.6rem 1.1rem;
          position: relative;
          overflow: hidden;
          outline: none;
        }
        .menu-link.active {
          color: #52525b;
          box-shadow: 0 0 0 0px #a3a3a3, 0 8px 32px 0 rgba(160,160,160,0.08);
          background: rgba(180,180,180,0.12);
          border-bottom: 3px solid #8d8d92;
          border-image: none;
        }
        .menu-link:hover, .menu-link:focus {
          color: #52525b;
          background: linear-gradient(90deg,#e5e7eb 60%,#f3f4f6 100%);
          box-shadow: 0 2px 16px 0 #d4d4d466;
        }
        .nav-btn.menu-link {
          background: linear-gradient(90deg,#a3a3a3 0%,#d4d4d4 100%);
          color: #27272a;
          font-weight: 700;
          border-radius: 11px;
          margin-left: 0.4em;
          padding: 0.6rem 1.1rem;
          box-shadow: 0 2px 8px #a3a3a355;
          border: none;
          transition: filter 0.2s;
        }
        .nav-btn.menu-link:hover {
          filter: brightness(1.08);
        }
        .avatar-nav {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 0.5rem;
          border: 2px solid #fff;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: #52525b;
          box-shadow: 0 2px 8px #a1a1aa80;
        }
        /* Glassy grey mobile menu */
        @media (max-width: 768px) {
          ul {
            display: none;
          }
          .mobile-portal-menu {
            display: flex !important;
            flex-direction: column !important;
            gap: 0;
            position: fixed;
            top: 58px;
            right: 0;
            left: auto;
            min-height: 60vh;
            background: linear-gradient(135deg,rgba(229,231,235,0.97) 20%,rgba(243,244,246,0.98) 100%);
            color: #27272a;
            padding: 1.3rem 0.5rem 1.5rem 0.5rem;
            width: 94vw;
            max-width: 345px;
            border-radius: 22px 0 0 22px;
            box-shadow: 0 12px 48px 0 #bdbdbdbb, 0 4px 32px 0 #a3a3a380;
            border: 1px solid #e5e7eb;
            opacity: 1;
            pointer-events: auto;
            z-index: 2000;
            margin: 0;
            animation: glassSlideIn .35s cubic-bezier(0.7,0,0.3,1);
            backdrop-filter: blur(13px) saturate(140%);
          }
          @keyframes glassSlideIn {
            0% { transform: translateX(120%); opacity: 0;}
            100% { transform: translateX(0); opacity: 1;}
          }
          .mobile-portal-menu li {
            padding: 0.95rem 1.6rem;
            justify-content: flex-start;
          }
          .mobile-portal-menu .menu-link {
            font-size: 1.18rem;
            font-weight: 700;
            color: #27272a;
            border-radius: 11px;
            background: none;
            padding: 0.7rem 1.1rem;
            transition: background 0.2s, color 0.2s;
            width: 100%;
            text-align: left;
            box-shadow: none;
            border-bottom: none;
          }
          .mobile-portal-menu .menu-link.active {
            color: #8d8d92;
            text-shadow: 0 0 6px #a3a3a344;
            background: rgba(180,180,180,0.13);
            border-left: 5px solid #8d8d92;
            border-image: none;
          }
          .mobile-portal-menu .menu-link:hover,
          .mobile-portal-menu .menu-link:focus {
            background: linear-gradient(90deg,#e5e7eb 0%,#f3f4f6 100%);
            color: #52525b;
            text-shadow: 0 2px 8px #a3a3a3cc;
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
                  transform: isOpen ? "rotate(45deg) translate(7px, 7px)" : "none",
                }}
              />
              <span className="bar" style={{ opacity: isOpen ? 0 : 1 }} />
              <span
                className="bar"
                style={{
                  transform: isOpen ? "rotate(-45deg) translate(9px, -9px)" : "none",
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
            <MenuContent onClick={() => setIsOpen(false)} />
          </ul>
          {/* Overlay to close */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1999,
              background: 'rgba(0,0,0,0.04)'
            }}
          />
        </MobileMenuPortal>
      )}
    </>
  );
}
