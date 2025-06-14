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
      { to: "/mycodes", label: "My Codes", match: (p) => p === "/mycodes" },
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
      <style>{`/* styles omitted for brevity */`}</style>
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
