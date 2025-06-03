import React, { useState } from "react";
import QRCode from "qrcode.react";

export default function Profile() {
  const [generatedCode, setGeneratedCode] = useState("");

  // For demo, generate a simple code with current date and random ID
  function generateQRCode() {
    const code = `FitSpot-${new Date().toISOString().slice(0,10)}-${Math.random().toString(36).substring(2,10)}`;
    setGeneratedCode(code);
  }

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Your Profile</h1>
      <button 
        onClick={generateQRCode} 
        style={{ padding: "1rem 2rem", fontSize: "1rem", cursor: "pointer", marginBottom: "1rem" }}
      >
        Generate 1-Time QR Code for Today
      </button>

      {generatedCode && (
        <div>
          <QRCode value={generatedCode} size={256} />
          <p style={{ marginTop: "1rem" }}>Show this QR code at any partner gym to workout today!</p>
        </div>
      )}
    </div>
  );
}
