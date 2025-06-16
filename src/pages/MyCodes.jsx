import React, { useState } from "react";

export default function MyCodes() {
  // Test static data for rendering; no Supabase.
  const [codes] = useState([
    {
      code: "CODE123",
      gym: "Test Gym",
      date: "2025-06-16",
      time: "10:00",
      used: false,
    },
    {
      code: "USED456",
      gym: "Second Gym",
      date: "2025-05-10",
      time: "14:30",
      used: true,
    }
  ]);

  // Filter by used/active
  const [tab, setTab] = useState("active");
  const filtered =
    tab === "active"
      ? codes.filter((c) => !c.used)
      : codes.filter((c) => c.used);

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 24 }}>
      <h1>Test: MyCodes Page</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          style={{
            flex: 1,
            background: tab === "active" ? "#2563eb" : "#e0e7ef",
            color: tab === "active" ? "#fff" : "#2563eb",
            fontWeight: "bold",
            border: 0,
            borderRadius: 6,
            padding: "10px 0",
            cursor: "pointer",
          }}
          onClick={() => setTab("active")}
        >
          Active
        </button>
        <button
          style={{
            flex: 1,
            background: tab === "used" ? "#2563eb" : "#e0e7ef",
            color: tab === "used" ? "#fff" : "#2563eb",
            fontWeight: "bold",
            border: 0,
            borderRadius: 6,
            padding: "10px 0",
            cursor: "pointer",
          }}
          onClick={() => setTab("used")}
        >
          Used
        </button>
      </div>
      {filtered.length === 0 ? (
        <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
          No codes in this tab!
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((b, i) => (
            <li
              key={b.code}
              style={{
                background: "#f1f5f9",
                borderRadius: 12,
                padding: "1.2rem",
                marginBottom: 16,
                boxShadow: "0 2px 8px #2563eb13",
              }}
            >
              <div style={{ fontWeight: 700, color: "#2563eb" }}>
                {b.gym}
              </div>
              <div style={{ color: "#333" }}>
                <b>Date:</b> {b.date} <b>Time:</b> {b.time}
              </div>
              <div style={{ color: "#888" }}>
                <b>Status:</b> {b.used ? "Used" : "Active"}
              </div>
              <div style={{ color: "#888" }}>
                <b>Code:</b> <span style={{
                  background: "#dbeafe",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: "#2563eb"
                }}>{b.code}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
