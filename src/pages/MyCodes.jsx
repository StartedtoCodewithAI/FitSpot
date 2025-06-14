import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

// Helper: format date to "YYYY-MM-DD"
function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "";
}

// Helper: status label
function getStatusLabel(session) {
  if (!session.date) return "";
  const today = new Date();
  const sessionDate = new Date(session.date);
  today.setHours(0, 0, 0, 0);
  sessionDate.setHours(0, 0, 0, 0);
  if (sessionDate.getTime() > today.getTime()) return "Upcoming";
  if (sessionDate.getTime() === today.getTime()) return "Today";
  return "Past";
}

export default function MyCodes() {
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [maxStreak, setMaxStreak] = useState(0);
  const [copiedCode, setCopiedCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalSession, setModalSession] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
      setCodes(stored);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user.name || "");

      const sorted = stored
        .filter(b => b.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      let streak = 1, maxStreakVal = 1;
      for (let i = 1; i < sorted.length; ++i) {
        const prev = new Date(sorted[i - 1].date);
        const curr = new Date(sorted[i].date);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          streak++;
          maxStreakVal = Math.max(maxStreakVal, streak);
        } else {
          streak = 1;
        }
      }
      setMaxStreak(maxStreakVal);
    } catch {
      setError("Failed to load codes.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(""), 1400);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  // --- FIX: Show loading first, only check userName after loading is false
  if (loading) {
    return <div style={{textAlign:"center",marginTop:40}}>Loading...</div>;
  }
  if (!userName) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Please log in to see your codes.
      </div>
    );
  }

  function handleDelete(code) {
    if (window.confirm("Delete this code?")) {
      const updated = codes.filter(b => b.code !== code);
      setCodes(updated);
      localStorage.setItem("fitspot_bookings", JSON.stringify(updated));
    }
  }

  function handleCopy(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
  }

  function exportToCSV() {
    const header = "Code,Gym,Date,Time,Used\n";
    const rows = codes.map(b =>
      [b.code, b.gym?.name, b.date, b.time, b.used ? "Yes" : "No"].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_fitspot_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleMarkAsUsed(code) {
    if (!window.confirm("Mark this session as used?")) return;
    const updated = codes.map(b =>
      b.code === code ? { ...b, used: true } : b
    );
    setCodes(updated);
    localStorage.setItem("fitspot_bookings", JSON.stringify(updated));
  }

  function openModal(session) {
    setModalSession(session);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setModalSession(null);
  }

  const lowerSearch = search.toLowerCase();
  const filteredActive = codes.filter(
    b =>
      !b.used &&
      (!lowerSearch ||
        b.gym?.name?.toLowerCase().includes(lowerSearch) ||
        b.code?.toLowerCase().includes(lowerSearch))
  );
  const filteredUsed = codes.filter(
    b =>
      b.used &&
      (!lowerSearch ||
        b.gym?.name?.toLowerCase().includes(lowerSearch) ||
        b.code?.toLowerCase().includes(lowerSearch))
  );

  function SessionModal({ session, onClose }) {
    if (!session) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(30,41,59,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99,
        }}
        onClick={onClose}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "2rem 2.2rem",
            minWidth: 320,
            maxWidth: "90vw",
            boxShadow: "0 6px 30px #2563eb29",
            position: "relative"
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close session details"
            style={{
              position: "absolute", top: 14, right: 18,
              background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer"
            }}
          >×</button>
          <h2 style={{ color: "#2563eb" }}>Session Details</h2>
          <div style={{ margin: "1.1rem 0" }}>
            <div><strong>Code:</strong> <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{session.code}</span></div>
            <div><strong>Gym:</strong> {session.gym?.name}</div>
            <div><strong>Date:</strong> {formatDate(session.date)}</div>
            <div><strong>Time:</strong> {session.time}</div>
            <div><strong>Status:</strong> {getStatusLabel(session)}</div>
            <div><strong>Used:</strong> {session.used ? "Yes" : "No"}</div>
            {session.gym?.lat && session.gym?.lng && (
              <div style={{ marginTop: 10 }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${session.gym.lat},${session.gym.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                    fontWeight: 600
                  }}
                >Get directions</a>
              </div>
            )}
          </div>
          <button
            onClick={() => { handleCopy(session.code); }}
            style={{
              background: "#e0e7ef",
              color: "#2563eb",
              border: "none",
              borderRadius: 7,
              padding: "0.5rem 1.1rem",
              fontWeight: 700,
              fontSize: ".97rem",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Copy Code
          </button>
          {!session.used && (
            <button
              onClick={() => { handleMarkAsUsed(session.code); onClose(); }}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "0.5rem 1.1rem",
                fontWeight: 700,
                fontSize: ".97rem",
                cursor: "pointer"
              }}
            >
              Mark as Used
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1rem", position: "relative" }}>
      <h1 style={{ textAlign: "center", color: "#2563eb", marginBottom: 18 }}>My Session Codes</h1>
      <button
        onClick={exportToCSV}
        style={{
          marginBottom: 16,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: "1rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          float: "right"
        }}
      >
        Export as CSV
      </button>
      <div style={{ clear: "both" }} />

      <div style={{
        background: "#f1f5f9",
        borderRadius: 12,
        padding: "18px 16px",
        margin: "0 0 24px 0",
        color: "#2563eb",
        fontWeight: 600,
        fontSize: "1.09rem",
        textAlign: "center"
      }}>
        <span style={{ fontSize: "1.5rem" }}>🔥</span>
        {maxStreak > 1
          ? <>You’re on a <span style={{ color: "#2563eb" }}>{maxStreak}-day streak</span>! Keep it up, {userName}!</>
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

      {/* Fancy Search Bar */}
      <SearchBar
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by gym name or code"
      />

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
            textAlign: "center",
            color: "#64748b",
            marginTop: 28
          }}>
            No active codes found.
          </div>
        ) : (
          <div>
            {filteredActive.map(b => (
              <div key={b.code} style={{
                background: "#fff",
                border: "1px solid #e0e7ef",
                borderRadius: 10,
                padding: "1.2rem 1rem 1.2rem 1.5rem",
                marginBottom: 18,
                boxShadow: "0 2px 10px #2563eb10",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
              }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.45rem",
                    color: "#2563eb",
                    letterSpacing: ".16em",
                    background: "#f1f5f9",
                    padding: "8px 18px",
                    borderRadius: 12,
                    marginRight: 18,
                    cursor: "pointer"
                  }}
                  tabIndex={0}
                  aria-label="View session details"
                  onClick={() => openModal(b)}
                  onKeyPress={e => { if (e.key === "Enter") openModal(b); }}
                  title="Click for details"
                >
                  {b.code}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700 }}>{b.gym?.name}</div>
                  <div style={{ color: "#64748b", fontSize: ".97rem" }}>
                    {formatDate(b.date)} &middot; {b.time}
                    <span style={{
                      marginLeft: 10,
                      padding: "2px 10px",
                      background: "#f1f5f9",
                      borderRadius: 8,
                      fontSize: ".92rem",
                      color: "#2563eb"
                    }}>
                      {getStatusLabel(b)}
                    </span>
                  </div>
                  {/* Add Google Maps link for directions */}
                  {b.gym?.lat && b.gym?.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${b.gym.lat},${b.gym.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        color: "#2563eb",
                        fontWeight: 600,
                        textDecoration: "underline"
                      }}
                    >
                      Get directions
                    </a>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleCopy(b.code)}
                    style={{
                      background: "#e0e7ef",
                      color: "#2563eb",
                      border: "none",
                      borderRadius: 7,
                      padding: "0.5rem 1rem",
                      fontWeight: 700,
                      fontSize: ".97rem",
                      cursor: "pointer"
                    }}
                    aria-label={`Copy code ${b.code}`}
                  >
                    {copiedCode === b.code ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleMarkAsUsed(b.code)}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: 7,
                      padding: "0.5rem 1.1rem",
                      fontWeight: 700,
                      fontSize: ".97rem",
                      cursor: "pointer"
                    }}
                  >
                    Mark as Used
                  </button>
                  <button
                    onClick={() => handleDelete(b.code)}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: 7,
                      padding: "0.5rem 1.1rem",
                      fontWeight: 700,
                      fontSize: ".97rem",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Used Codes */}
      {activeTab === "used" && (
        filteredUsed.length === 0 ? (
          <div style={{
            padding: "2rem",
            borderRadius: 12,
            background: "#f1f5f9",
            textAlign: "center",
            color: "#64748b",
            marginTop: 28
          }}>
            No used codes found.
          </div>
        ) : (
          <div>
            {filteredUsed.map(b => (
              <div key={b.code} style={{
                background: "#fff",
                border: "1px solid #e0e7ef",
                borderRadius: 10,
                padding: "1.2rem 1rem 1.2rem 1.5rem",
                marginBottom: 18,
                boxShadow: "0 2px 10px #2563eb10",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: 0.7,
                flexWrap: "wrap"
              }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.45rem",
                    color: "#64748b",
                    letterSpacing: ".16em",
                    background: "#f1f5f9",
                    padding: "8px 18px",
                    borderRadius: 12,
                    marginRight: 18,
                    cursor: "pointer"
                  }}
                  tabIndex={0}
                  aria-label="View session details"
                  onClick={() => openModal(b)}
                  onKeyPress={e => { if (e.key === "Enter") openModal(b); }}
                  title="Click for details"
                >
                  {b.code}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700 }}>{b.gym?.name}</div>
                  <div style={{ color: "#64748b", fontSize: ".97rem" }}>
                    {formatDate(b.date)} &middot; {b.time}
                    <span style={{
                      marginLeft: 10,
                      padding: "2px 10px",
                      background: "#f1f5f9",
                      borderRadius: 8,
                      fontSize: ".92rem",
                      color: "#2563eb"
                    }}>
                      {getStatusLabel(b)}
                    </span>
                  </div>
                  {/* Add Google Maps link for directions */}
                  {b.gym?.lat && b.gym?.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${b.gym.lat},${b.gym.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        color: "#2563eb",
                        fontWeight: 600,
                        textDecoration: "underline"
                      }}
                    >
                      Get directions
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(b.code)}
                  style={{
                    background: "#e0e7ef",
                    color: "#2563eb",
                    border: "none",
                    borderRadius: 7,
                    padding: "0.5rem 1rem",
                    fontWeight: 700,
                    fontSize: ".97rem",
                    cursor: "pointer"
                  }}
                  aria-label={`Copy code ${b.code}`}
                >
                  {copiedCode === b.code ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Session details modal */}
      {showModal && <SessionModal session={modalSession} onClose={closeModal} />}
    </div>
  );
}
