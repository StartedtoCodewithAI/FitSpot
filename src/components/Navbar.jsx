import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/FitSpot.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
        nav {
          background-color: #007bff;
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
        }
        li a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: color 0.3s ease;
        }
        li a:hover {
          color: #cce4ff;
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
            background-color: #007bff;
            flex-direction: column;
            padding: 1rem 0;
            display: none;
          }
          ul.open {
            display: flex;
          }
          ul li {
            padding: 0.75rem 1rem;
          }
          ul li a {
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
              <Link to="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/gyms" onClick={() => setIsOpen(false)}>
                Gyms
              </Link>
            </li>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setIsOpen(false)}>
                About
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
