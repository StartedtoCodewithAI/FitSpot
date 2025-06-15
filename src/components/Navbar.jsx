import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";
import ThemeToggle from "./ThemeToggle"; // <-- import the toggle!

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setUser(sessionData?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  }

  return (
    <nav
      style={{
        background: "var(--color-bg-light)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0.7rem 2.2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={fitspotLogo} alt="FitSpot Logo" style={{ height: 38, marginRight: 12, borderRadius: 8 }} />
          <span style={{
            color: "var(--color-primary)",
            fontWeight: 800,
            fontSize: "1.25rem",
            letterSpacing: ".5px"
          }}>
            FitSpot
          </span>
        </Link>
        <Link to="/gyms" style={{
          color: "var(--color-primary-dark)",
          textDecoration: "none",
          marginLeft: 24,
          fontWeight: 600
        }}>
          Gyms
        </Link>
        <Link to="/about" style={{
          color: "var(--color-primary-dark)",
          textDecoration: "none",
          marginLeft: 24,
          fontWeight: 600
        }}>
          About
        </Link>
        {user && (
          <>
            <Link to="/profile" style={{
              color: "var(--color-primary-dark)",
              textDecoration: "none",
              marginLeft: 24,
              fontWeight: 600
            }}>
              Profile
            </Link>
            <Link to="/my-codes" style={{
              color: "var(--color-primary-dark)",
              textDecoration: "none",
              marginLeft: 24,
              fontWeight: 600
            }}>
              My Codes
            </Link>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <ThemeToggle /> {/* <-- add the theme toggle here */}
        {!user ? (
          <>
            <Link
              to="/login"
              style={{
                color: "var(--color-primary)",
                textDecoration: "none",
                fontWeight: 600,
                marginRight: 18
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                borderRadius: 6,
                padding: "0.5rem 1.2rem",
                fontWeight: 600,
                textDecoration: "none"
              }}
            >
              Sign Up
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              background: "var(--color-text-dark)",
              color: "var(--color-danger)",
              border: "none",
              borderRadius: 7,
              padding: "0.48rem 1.2rem",
              fontWeight: 600,
              fontSize: ".98rem",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
