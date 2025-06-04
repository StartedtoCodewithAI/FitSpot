import React, { useState } from "react";
import QRCode from "qrcode.react";
import axios from "axios";

export default function Profile() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with actual user ID logic in the future
      const userId = "user123";

      const response = await axios.post("https://fitspot-backend-production.up.railway.app/api/generate", {
        userId,
      });

      setToken(response.data.token);
    } catch (err) {
      setError("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Your Profile</h1>
      <p>Generate your single-use, 1-day QR code for gym access.</p>

      <button onClick={generateQR} style={buttonStyle} disabled={loading}>
        {loading ? "Generating..." : "Generate QR Code"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {token && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Your QR Code (valid today only)</h3>
          <QRCode value={token} size={200} />
          <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>Show this code at the gym entrance</p>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
