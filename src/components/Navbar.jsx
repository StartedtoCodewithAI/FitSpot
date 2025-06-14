import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import fitspotLogo from "../assets/FitSpot.png";

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
        background: "#fff",
        borderBottom: "1px solid #e0e7ef",
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
          <span style={{ color: "#2563eb", fontWeight: 800, fontSize: "1.25rem", letterSpacing: ".5px" }}>
            FitSpot
          </span>
        </Link>
        <Link to="/gyms" style={{ color: "#334155", textDecoration: "none", marginLeft: 24, fontWeight: 600 }}>
          Gyms
        </Link>
        <Link to="/about" style={{ color: "#334155", textDecoration: "none", marginLeft: 24, fontWeight: 600 }}>
          About
        </Link>
        {user && (
          <>
            <Link to="/profile" style={{ color: "#334155", textDecoration: "none", marginLeft: 24, fontWeight: 600 }}>
              Profile
            </Link>
            <Link to="/my-codes" style={{ color: "#334155", textDecoration: "none", marginLeft: 24, fontWeight: 600 }}>
              My Codes
            </Link>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {!user ? (
          <>
            <Link
              to="/login"
              style={{
                color: "#2563eb",
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
                background: "#2563eb",
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
              background: "#f1f5f9",
              color: "#dc2626",
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
