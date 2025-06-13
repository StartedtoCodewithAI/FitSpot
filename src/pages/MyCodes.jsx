import React, { useEffect, useState } from "react";

// Helper function to check if a booking is expired
function isExpired(booking) {
  if (!booking.date || !booking.time) return false;
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  return bookingDateTime < new Date();
}

// Funny gym-themed sayings
const funnySayings = [
  "You crushed it, gym champ! 💪",
  "Booking done! Time to lift your spirits—and some weights!",
  "Look at you go! Gains are coming. 🏋️",
  "There you go, player! You did it 😉",
  "Booking confirmed: excuses cancelled. 🛑",
  "Time to get those reps in! 🏆",
  "Sweat now, shine later. Your journey starts!",
  "Flex mode activated. See you at the gym!",
  "Nice! Your muscles just sent a thank you card.",
  "Let’s get physical... at the gym! 🎶",
];

function getRandomSaying() {
  return funnySayings[Math.floor(Math.random() * funnySayings.length)];
}

export default function MyCodes() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("active");
  const [showFunny, setShowFunny] = useState(false);
  const [funnyText, setFunnyText] = useState("");

  useEffect(() => {
    // Show funny notification if redirected after booking
    if (window.location.hash === "#funny-success") {
      setFunnyText(getRandomSaying());
      setShowFunny(true);
      setTimeout(() => setShowFunny(false), 3500);
      window.location.hash = "";
    }
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
      setBookings(stored.reverse());
      setLoading(false);
    } catch (e) {
      setError("There was an error loading your session codes.");
      setLoading(false);
    }
  }, []);

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(-1), 1500);
  };

  // Delete used code
  const deleteBooking = (bookingIdx) => {
    const allBookings = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
    // bookings are displayed in reverse, so map to correct index
    const filteredBookings = allBookings.filter((_, idx) =>
      idx !== (allBookings.length - 1 - bookingIdx)
    );
    localStorage.setItem("fitspot_bookings", JSON.stringify(filteredBookings.reverse()));
    setBookings(filteredBookings);
  };

  // Filter bookings
  const filteredActive = bookings.filter(
    b => !isExpired(b) && (search.trim() === "" || (b.gym?.name || "").toLowerCase().includes(search.trim().toLowerCase()))
  );
  const filteredUsed = bookings.filter(
    b => isExpired(b) && (search.trim() === "" || (b.gym?.name || "").toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "2rem", outline: 0 }} tabIndex={0} aria-label="My Session Codes">
        My Session Codes
      </h1>

      {/* Fancy funny notification */}
      {showFunny && (
        <div
          style={{
            background: "linear-gradient(90deg,#fef08a,#a7f3d0)",
            color: "#713f12",
            padding: "1.1rem",
            borderRadius: 14,
            marginBottom: 22,
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.15rem",
            boxShadow: "0 10px 32px #fde04755",
            position: "relative",
            overflow: "hidden",
            animation: "pop-bounce 0.7s cubic-bezier(.36,1.56,.64,1) both"
          }}
          aria-live="polite"
        >
          🏋️‍♂️ {funnyText} 🏋️‍♀️
          <style>
            {`
              @keyframes pop-bounce {
                0% { transform: scale(0.8); opacity: 0; }
                60% { transform: scale(1.12); opacity: 1; }
                100% { transform: scale(1); }
              }
              .confetti {
                position: absolute;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                opacity: 0.7;
                animation: confetti-fall 1.6s linear forwards;
              }
              @keyframes confetti-fall {
                0% { top: -15px; }
                100% { top: 80px; }
              }
            `}
          </style>
          {/* Fancy confetti */}
          <span className="confetti" style={{background:'#fbbf24', left:'20%', animationDelay:'0.08s'}}></span>
          <span className="confetti" style={{background:'#34d399', left:'40%', animationDelay:'0.18s'}}></span>
          <span className="confetti" style={{background:'#60a5fa', left:'60%', animationDelay:'0.28s'}}></span>
          <span className="confetti" style={{background:'#f472b6', left:'80%', animationDelay:'0.38s'}}></span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          style={{
            flex: 1,
            padding: "0.7rem 0",
            background: activeTab === "active" ? "#2563eb" : "#f1f5f9",
            color: activeTab === "active" ? "#fff" : "#2563eb",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background 0.16s"
          }}
          onClick={() => setActiveTab("active")}
        >Active</button>
        <button
          style={{
            flex: 1,
            padding: "0.7rem 0",
            background: activeTab === "used" ? "#2563eb" : "#f1f5f9",
            color: activeTab === "used" ? "#fff" : "#2563eb",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background 0.16s"
          }}
          onClick={() => setActiveTab("used")}
        >Used</button>
      </div>

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

      {/* Active Codes */}
      {activeTab === "active" && (
        filteredActive.length === 0 ? (
          <div style={{
            padding: "2rem",
            borderRadius: 12,
            background: "#f1f5f9",
            color: "#64748b",
            textAlign: "center"
          }}>
            You haven’t generated any active session codes yet.
          </div>
        ) : (
          filteredActive.map((b, idx) => {
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
                  alignItems: "flex-start",
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
                    </div>
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
          })
        )
      )}

      {/* Used Codes */}
      {activeTab === "used" && (
        filteredUsed.length === 0 ? (
          <div style={{
            padding: "2rem",
            borderRadius: 12,
            background: "#f1f5f9",
            color: "#64748b",
            textAlign: "center"
          }}>
            You have no used session codes.
          </div>
        ) : (
          filteredUsed.map((b, idx) => (
            <div key={b.code + b.created + idx}
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 18px #2563eb11",
                marginBottom: "1.5rem",
                border: "2px solid #dc2626",
                opacity: 1
              }}
              aria-label={`Expired session code for ${b.gym?.name || "Unknown Gym"}`}
            >
              <div style={{
                padding: "1.2rem 1.5rem",
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap"
              }}>
                <div style={{
                  fontSize: "2.1rem",
                  fontWeight: 900,
                  color: "#dc2626",
                  background: "#fee2e2",
                  padding: "0.8rem 1.2rem",
                  borderRadius: 12,
                  letterSpacing: "0.22em",
                  minWidth: 180,
                  textAlign: "center",
                  userSelect: "all",
                  position: "relative"
                }}>
                  {b.code || <span style={{ color: "#64748b" }}>(No Code)</span>}
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
                  </div>
                </div>
                {/* Delete button for used codes */}
                <button
                  onClick={() => deleteBooking(idx)}
                  aria-label="Delete expired session code"
                  style={{
                    marginLeft: "1rem",
                    background: "#fff",
                    color: "#dc2626",
                    border: "1.5px solid #dc2626",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    padding: "0.5rem 1.1rem",
                    cursor: "pointer",
                    alignSelf: "flex-start"
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
