import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/FitSpot.png";

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

  return (
    <>
      <style>{`
        nav {
          background-color: #1976d2; /* Updated to modern Material blue */
          padding: 0.5rem 1rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          height: 40px;
          cursor: pointer;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .bar {
          height: 3px;
          width: 100%;
          background-color: #fff;
          border-radius: 2px;
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
          transition: color 0.3s ease, background 0.3s;
          border: none;
          background: none;
          cursor: pointer;
        }
        li a.active, .nav-btn.active {
          color: #ffe082;
          background: none;
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
          .hamburger {
            display: flex;
          }
          ul {
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background-color: #1976d2; /* Updated dropdown to match navbar */
            flex-direction: column;
            padding: 1rem 0;
            display: none;
          }
          ul.open {
            display: flex;
          }
          ul li {
            padding: 0.75rem 1rem;
            justify-content: flex-start;
          }
          ul li a, ul li .nav-btn {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <nav>
        <div className="container">
          <Link to="/">
            <img src={logo} alt="FitSpot Logo" className="logo" />
          </Link>

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

          <ul className={isOpen ? "open" : ""}>
            <li>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/gyms"
                className={location.pathname.startsWith("/gyms") ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                Gyms
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={location.pathname === "/about" ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={location.pathname === "/profile" ? "active" : ""}
                onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
