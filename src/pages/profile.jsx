import React, { useState } from "react";
import QRCode from "qrcode.react";

export default function Profile() {
  const [code, setCode] = useState("");
  const [generatedAt, setGeneratedAt] = useState(null);

  function generateCode() {
    const now = new Date();
    const codeString = `FITSPOT-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    setCode(codeString);
    setGeneratedAt(now);
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>My QR Access Pass</h1>
      <p>Click the button to generate your single-use gym access code.</p>
      <button
        onClick={generateCode}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "8px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Generate QR Code
      </button>

      {code && (
        <div style={{ marginTop: "2rem" }}>
          <QRCode value={code} size={200} />
          <p style={{ marginTop: "1rem" }}>Code: <strong>{code}</strong></p>
          <p>Generated at: {generatedAt.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
