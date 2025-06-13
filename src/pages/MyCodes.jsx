import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";

export default function MyCodes() {
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
      setCodes(stored);
      setLoading(false);

      // Optional: calculate streak or other stats
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user.name || "");

      // Calculate streak
      const sorted = stored
        .filter(b => b.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      let streak = 1, maxStreak = 1;
      for (let i = 1; i < sorted.length; ++i) {
        const prev = new Date(sorted[i - 1].date);
        const curr = new Date(sorted[i].date);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 1;
        }
      }
      setMaxStreak(maxStreak);
    } catch {
      setError("Failed to load codes.");
      setLoading(false);
    }
  }, []);

  function handleDelete(code) {
    if (window.confirm("Delete this code?")) {
      const updated = codes.filter(b => b.code !== code);
      setCodes(updated);
      localStorage.setItem("fitspot_bookings", JSON.stringify(updated));
    }
  }

  // Filtering
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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 1rem", position: "relative" }}>
      <h1 style={{ textAlign: "center", color: "#2563eb", marginBottom: 18 }}>My Session Codes</h1>
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

      {/* Fancy Search Bar */}
      <SearchBar
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by gym name"
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
                gap: 16
              }}>
                <div style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "1.45rem",
                  color: "#2563eb",
                  letterSpacing: ".16em",
                  background: "#f1f5f9",
                  padding: "8px 18px",
                  borderRadius: 12,
                  marginRight: 18
                }}>
                  {b.code}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{b.gym?.name}</div>
                  <div style={{ color: "#64748b", fontSize: ".97rem" }}>
                    {b.date} &middot; {b.time}
                  </div>
                </div>
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
                opacity: 0.7
              }}>
                <div style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "1.45rem",
                  color: "#64748b",
                  letterSpacing: ".16em",
                  background: "#f1f5f9",
                  padding: "8px 18px",
                  borderRadius: 12,
                  marginRight: 18
                }}>
                  {b.code}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{b.gym?.name}</div>
                  <div style={{ color: "#64748b", fontSize: ".97rem" }}>
                    {b.date} &middot; {b.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
