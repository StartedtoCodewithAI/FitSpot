import React, { useState } from "react";

export default function Profile() {
  const [code, setCode] = useState("");

  // Dummy function to simulate generating a one-time code
  function generateCode() {
    const newCode = Math.random().toString(36).slice(-8).toUpperCase();
    setCode(newCode);
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
      <h1>Your Profile</h1>
      <p>Generate your one-time access code for today:</p>
      <button
        onClick={generateCode}
        style={{
          padding: "1rem 2rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1.1rem",
        }}
      >
        Generate Code
      </button>

      {code && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Your One-Time Code:</h3>
          <code
            style={{
              fontSize: "2rem",
              backgroundColor: "#f0f0f0",
              padding: "1rem 2rem",
              borderRadius: "8px",
              display: "inline-block",
              letterSpacing: "0.2em",
            }}
          >
            {code}
          </code>
          <p style={{ marginTop: "1rem", fontStyle: "italic" }}>
            Show this code at any partner gym to get access for the day.
          </p>
        </div>
      )}
    </div>
  );
}
