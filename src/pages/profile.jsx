import React, { useState } from "react";
import QRCode from "qrcode.react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://fitspot-backend-production.up.railway.app";

export default function Profile() {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generateQRCode() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers here if needed
        },
        body: JSON.stringify({
          userId: "USER_ID_HERE", // Replace with actual logged-in user ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await response.json();
      setQrCodeData(data.code); // Assuming backend returns { code: "abc123" }
    } catch (err) {
      setError(err.message || "Error generating QR code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Your Profile</h1>

      <button onClick={generateQRCode} disabled={loading}>
        {loading ? "Generating..." : "Generate Daily QR Code"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {qrCodeData && (
        <div style={{ marginTop: "1rem" }}>
          <QRCode value={qrCodeData} size={256} />
          <p>Show this QR code at partner gyms to enter for the day.</p>
        </div>
      )}
    </div>
  );
}
