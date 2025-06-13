import React, { useEffect, useState } from "react";

// Helper function to check if a booking is expired
function isExpired(booking) {
  if (!booking.date || !booking.time) return false;
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  return bookingDateTime < new Date();
}

export default function MyCodes() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#code-created") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    }
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
      setBookings(stored.reverse());
      setFiltered(stored.reverse());
      setLoading(false);
    } catch (e) {
      setError("There was an error loading your session codes.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(bookings);
    } else {
      const q = search.trim().toLowerCase();
      setFiltered(
        bookings.filter(b =>
          (b.gym?.name || "").toLowerCase().includes(q)
        )
      );
    }
  }, [search, bookings]);

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(-1), 1500);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <h1
        style={{
          color: "#2563eb",
          marginBottom: "2rem",
          outline: 0
        }}
        tabIndex={0}
        aria-label="My Session Codes"
      >
        My Session Codes
      </h1>

      {showSuccess && (
        <div
          style={{
            background: "#d1fae5",
            color: "#065f46",
            padding: "1rem",
            borderRadius: 8,
            marginBottom: 20,
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.1rem"
          }}
          aria-live="polite"
        >
          Success! Your code has been created.
        </div>
      )}

      <input
        type="text"
        value={search}
        placeholder="Search by gym name"
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: ".75rem 1rem",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          marginBottom: "1.5rem",
          fontSize: "1rem"
        }}
        aria-label="Search by gym name"
      />

      {loading && (
        <div style={{ textAlign: "center", color: "#2563eb" }} aria-live="polite">
          <span className="spinner" aria-hidden="true" style={{
            display: "inline-block",
            width: 22,
            height: 22,
            border: "3px solid #38bdf8",
            borderTop: "3px solid #2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginRight: 8,
            verticalAlign: "middle"
          }} />
          Loading your session codes...
          <style>
            {`
              @keyframes spin { 0% {transform:rotate(0deg);} 100% {transform:rotate(360deg);} }
            `}
          </style>
        </div>
      )}

      {error && (
        <div style={{
          color: "#dc2626",
          background: "#fee2e2",
          padding: "1rem",
          borderRadius: 8,
          marginBottom: 20,
          textAlign: "center"
        }} role="alert">
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          padding: "2rem",
          borderRadius: 12,
          background: "#f1f5f9",
          color: "#64748b",
          textAlign: "center"
        }}>
          You haven’t generated any session codes yet.
        </div>
      )}

      {filtered.map((b, idx) => {
        const expired = isExpired(b);
        return (
          <div key={b.code + b.created + idx}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 18px #2563eb11",
              marginBottom: "1.5rem",
              opacity: 1,
              border: expired
                ? "2px solid #dc2626"
                : "2px solid #22c55e",
              transition: "opacity 0.2s"
            }}
            aria-label={`Session code for ${b.gym?.name || "Unknown Gym"}`}
          >
            <div style={{
              padding: "1.2rem 1.5rem",
              display: "flex",
              alignItems: "flex-start", // top-align map and text
              flexWrap: "wrap"
            }}>
              <div style={{
                fontSize: "2.1rem",
                fontWeight: 900,
                color: expired ? "#dc2626" : "#2563eb",
                background: expired ? "#fee2e2" : "#e0f2fe",
                padding: "0.8rem 1.2rem",
                borderRadius: 12,
                letterSpacing: "0.22em",
                minWidth: 180,
                textAlign: "center",
                userSelect: "all",
                position: "relative"
              }}>
                {b.code || <span style={{ color: "#64748b" }}>(No Code)</span>}
                {b.code && (
                  <button
                    aria-label="Copy code"
                    style={{
                      marginLeft: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      color: "#22d3ee",
                      verticalAlign: "middle"
                    }}
                    onClick={() => copyCode(b.code, idx)}
                    tabIndex={0}
                  >
                    📋
                  </button>
                )}
                {copiedIndex === idx && (
                  <span style={{
                    position: "absolute",
                    top: -30,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#f0fdf4",
                    color: "#22c55e",
                    padding: "0.2rem 0.8rem",
                    borderRadius: 6,
                    fontSize: ".95rem",
                    fontWeight: 700
                  }}>
                    Copied!
                  </span>
                )}
              </div>
              <div style={{
                flex: 1,
                minWidth: 0,
                marginLeft: "1.3rem",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#0b2546"
                }}>
                  {b.gym?.name || "(Unknown Gym)"}
                </div>
                <div style={{
                  color: "#64748b",
                  fontSize: ".96rem",
                  margin: ".22rem 0"
                }}>
                  Date: {b.date} &nbsp;|&nbsp; Time: {b.time}
                  {expired && (
                    <span
                      style={{
                        color: "#dc2626",
                        marginLeft: 10,
                        fontWeight: 600,
                        fontSize: ".98rem"
                      }}
                      aria-label="Session expired"
                    >
                      (Expired)
                    </span>
                  )}
                </div>
                {/* Inline Map Preview (Embedded Google Map - no API key required) */}
                {b.gym?.lat && b.gym?.lng && (
                  <div style={{
                    width: "100%",
                    maxWidth: 300,
                    minWidth: 200,
                    margin: "8px 0",
                    borderRadius: 8,
                    overflow: "hidden"
                  }}>
                    <iframe
                      title="Gym location map preview"
                      width="100%"
                      height="150"
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        display: "block"
                      }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${b.gym.lat},${b.gym.lng}&hl=es;z=15&output=embed`}
                    />
                  </div>
                )}
              </div>
              {/* Directions button only if code exists and not expired */}
              {b.code && !expired && (
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
                    marginTop: "0.5rem",
                    textDecoration: "none",
                    height: 40,
                    display: "flex",
                    alignItems: "center"
                  }}
                  aria-label={`Directions to ${b.gym?.name || "gym"}`}
                >
                  Directions
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
