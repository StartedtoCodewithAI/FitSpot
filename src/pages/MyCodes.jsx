import React, { useEffect, useState } from "react";

// Helper: Is booking expired?
function isExpired(booking) {
  if (!booking.date || !booking.time) return false;
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  return bookingDateTime < new Date();
}

// Helper: Get user's name from localStorage
function getUserName() {
  const stored = localStorage.getItem("fitspot_user_name");
  if (!stored) return "athlete";
  return stored.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "athlete";
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

// Calculate max streak of consecutive booking days
function getMaxStreak(bookings) {
  const dates = Array.from(
    new Set(
      bookings
        .filter(b => b.date)
        .map(b => b.date)
        .sort((a, b) => new Date(b) - new Date(a))
    )
  );
  if (dates.length === 0) return 0;

  let maxStreak = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 1;
    }
  }
  return maxStreak;
}

export default function MyCodes() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("active");
  const [userName, setUserName] = useState("athlete");
  const [maxStreak, setMaxStreak] = useState(0);

  // For delete confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteIdx, setToDeleteIdx] = useState(null);

  useEffect(() => {
    setUserName(getUserName());
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
      setBookings(stored.reverse());
      setMaxStreak(getMaxStreak(stored));
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

  const confirmDeleteBooking = (bookingIdx) => {
    setToDeleteIdx(bookingIdx);
    setShowConfirm(true);
  };

  const deleteBooking = () => {
    const bookingIdx = toDeleteIdx;
    const allBookings = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
    const filteredBookings = allBookings.filter((_, idx) =>
      idx !== (allBookings.length - 1 - bookingIdx)
    );
    localStorage.setItem("fitspot_bookings", JSON.stringify(filteredBookings.reverse()));
    setBookings(filteredBookings);
    setMaxStreak(getMaxStreak(filteredBookings));
    setShowConfirm(false);
    setToDeleteIdx(null);
  };

  const filteredActive = bookings.filter(
    b => !isExpired(b) && (search.trim() === "" || (b.gym?.name || "").toLowerCase().includes(search.trim().toLowerCase()))
  );
  const filteredUsed = bookings.filter(
    b => isExpired(b) && (search.trim() === "" || (b.gym?.name || "").toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1rem", position: "relative" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "2rem", outline: 0 }} tabIndex={0} aria-label="My Session Codes">
        Welcome, {userName}! <span role="img" aria-label="waving hand">👋</span>
      </h1>

      {/* Streak Counter */}
      <div style={{
        background: "#f0fdf4",
        color: "#16a34a",
        padding: "0.85rem 1rem",
        borderRadius: 10,
        marginBottom: 20,
        fontWeight: 600,
        fontSize: "1.08rem",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: maxStreak > 1 ? "0 0 16px #4ade8035" : undefined
      }}>
        <span style={{ fontSize: "1.5rem" }}>🔥</span>
        {maxStreak > 1
          ? <>You’re on a <span style={{color:"#2563eb"}}>{maxStreak}-day streak</span>! Keep it up, {userName}!</>
          : <>No streak yet – book those sessions and start your fitness journey!</>
        }
      </div>

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
            <div style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{getRandomSaying()}</div>
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
                  <div
                    style={{
                      flex: 1,
                      minWidth: 120,
                      marginLeft: "1.3rem",
                      display: "flex",
                      flexDirection: "column",
                      wordBreak: "normal",
                      whiteSpace: "normal",
                      overflowWrap: "break-word"
                    }}
                  >
                    <div style={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#0b2546"
                    }}>
                      {b.gym?.name || "(Unknown Gym)"}
                    </div>
                    {b.gym?.address &&
                      <div style={{
                        color: "#64748b",
                        fontSize: ".96rem",
                        marginBottom: ".15rem"
                      }}>
                        Address: {b.gym.address}
                      </div>
                    }
                    <div style={{
                      color: "#64748b",
                      fontSize: ".96rem",
                      margin: ".22rem 0"
                    }}>
                      Date: {b.date} &nbsp;|&nbsp; Time: {b.time}
                    </div>
                  </div>
                  {b.code && !expired && b.gym?.lat && b.gym?.lng && (
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
                <div
                  style={{
                    flex: 1,
                    minWidth: 120,
                    marginLeft: "1.3rem",
                    display: "flex",
                    flexDirection: "column",
                    wordBreak: "normal",
                    whiteSpace: "normal",
                    overflowWrap: "break-word"
                  }}
                >
                  <div style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#0b2546"
                  }}>
                    {b.gym?.name || "(Unknown Gym)"}
                  </div>
                  {b.gym?.address &&
                    <div style={{
                      color: "#64748b",
                      fontSize: ".96rem",
                      marginBottom: ".15rem"
                    }}>
                      Address: {b.gym.address}
                    </div>
                  }
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
                <button
                  onClick={() => confirmDeleteBooking(idx)}
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

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            left: 0, top: 0, right: 0, bottom: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
          <div style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: 12,
            boxShadow: "0 2px 10px #0002",
            maxWidth: 320,
            minWidth: 250,
            textAlign: "center"
          }}>
            <div style={{ fontSize: "1.2rem", marginBottom: 20 }}>
              Are you sure you want to delete this expired session code?
            </div>
            <button
              onClick={deleteBooking}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.6rem 1.6rem",
                fontWeight: 700,
                fontSize: "1.05rem",
                marginRight: 14,
                cursor: "pointer"
              }}
            >Yes, Delete</button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                background: "#f1f5f9",
                color: "#2563eb",
                border: "1px solid #2563eb",
                borderRadius: 8,
                padding: "0.6rem 1.6rem",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: "pointer"
              }}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
