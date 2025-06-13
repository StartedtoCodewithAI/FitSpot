import React, { useEffect, useState } from "react";

export default function MyCodes() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
    setBookings(stored.reverse()); // show latest first
  }, []);

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "2rem" }}>My Session Codes</h1>
      {bookings.length === 0 && (
        <div style={{
          padding: "2rem", borderRadius: 12, background: "#f1f5f9",
          color: "#64748b", textAlign: "center"
        }}>
          You haven’t generated any session codes yet.
        </div>
      )}
      {bookings.map((b, idx) => (
        <div key={b.code + b.created + idx} style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 18px #2563eb11",
          marginBottom: "1.5rem",
          opacity: 1,
          border: `2px solid #22c55e`,
          transition: "opacity 0.2s"
        }}>
          <div style={{ padding: "1.2rem 1.5rem", display: "flex", alignItems: "center" }}>
            <div style={{
              fontSize: "2.1rem",
              fontWeight: 900,
              color: "#2563eb",
              background: "#e0f2fe",
              padding: "0.8rem 1.2rem",
              borderRadius: 12,
              letterSpacing: "0.22em",
              minWidth: 180,
              textAlign: "center",
              userSelect: "all"
            }}>
              {b.code}
            </div>
            <div style={{ flex: 1, marginLeft: "1.3rem" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0b2546" }}>
                {b.gym?.name || "(Unknown Gym)"}
              </div>
              <div style={{ color: "#64748b", fontSize: ".96rem", margin: ".22rem 0" }}>
                Date: {b.date} &nbsp;|&nbsp; Time: {b.time}
              </div>
            </div>
            {b.code && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${b.gym?.lat},${b.gym?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#38bdf8",
                  color: "#fff",
                  padding: "0.5rem 1.1rem",
                  borderRadius: 100,
                  fontWeight: 700,
                  fontSize: ".99rem",
                  marginLeft: "1rem",
                  textDecoration: "none"
                }}
              >
                Directions
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
