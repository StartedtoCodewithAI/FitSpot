import React, { useEffect, useState } from "react";

function getAllSessionCodes() {
  // Get all items from localStorage that are fitspot session codes
  const codes = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith("fitspot-sessioncode-")) {
      try {
        codes.push(JSON.parse(localStorage.getItem(k)));
      } catch {}
    }
  }
  // Sort by generatedAt descending
  return codes.sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
}

function statusInfo(code) {
  const now = Date.now();
  if (code.used) return { label: "Used", color: "#e11d48" };
  if (now > code.expiresAt) return { label: "Expired", color: "#64748b" };
  return { label: "Active", color: "#22c55e" };
}

export default function MyCodes() {
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    setCodes(getAllSessionCodes());
    // Optionally, set up a timer to refresh status every minute
    const interval = setInterval(() => setCodes(getAllSessionCodes()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <h1 style={{ color: "#2563eb", marginBottom: "2rem" }}>My Session Codes</h1>
      {codes.length === 0 && (
        <div style={{
          padding: "2rem", borderRadius: 12, background: "#f1f5f9",
          color: "#64748b", textAlign: "center"
        }}>
          You haven’t generated any session codes yet.
        </div>
      )}
      {codes.map((code, idx) => {
        const status = statusInfo(code);
        return (
          <div key={code.code} style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 18px #2563eb11",
            marginBottom: "1.5rem",
            opacity: status.label === "Active" ? 1 : 0.7,
            border: `2px solid ${status.color}`,
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
                {code.code}
              </div>
              <div style={{ flex: 1, marginLeft: "1.3rem" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0b2546" }}>
                  {code.gymName || "(Unknown Gym)"}
                </div>
                <div style={{ color: "#64748b", fontSize: ".96rem", margin: ".22rem 0" }}>
                  Generated: {code.generatedAt ? new Date(code.generatedAt).toLocaleString() : "-"}
                </div>
                <div style={{ color: "#64748b", fontSize: ".96rem" }}>
                  Expires: {new Date(code.expiresAt).toLocaleString()}
                </div>
                {code.used && (
                  <div style={{ color: "#e11d48", fontSize: ".96rem" }}>
                    Used: {code.usedAt ? new Date(code.usedAt).toLocaleString() : "-"}
                  </div>
                )}
              </div>
              <div style={{
                background: status.color,
                color: "#fff",
                padding: "0.4rem 1rem",
                borderRadius: 100,
                fontWeight: 700,
                fontSize: ".99rem",
                marginLeft: "1rem"
              }}>
                {status.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}
