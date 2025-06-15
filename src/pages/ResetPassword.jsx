import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/login'
    });
    setMessage(error ? error.message : "Recovery email sent! Check your inbox.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "1.6rem", color: "#2563eb" }}>
        Reset Password
      </h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.8rem 1.2rem",
            borderRadius: 10,
            border: "1px solid #e0e7ef",
            fontSize: "1rem",
            marginBottom: "1rem",
            background: "#f9fafb"
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#2563eb",
            color: "#fff",
            padding: "0.85rem",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "1.07rem",
            cursor: "pointer",
            marginBottom: "1rem",
            boxShadow: "0 1px 8px #2563eb13"
          }}
        >
          Send Reset Link
        </button>
      </form>
      {message && (
        <div style={{
          textAlign: "center",
          color: message.startsWith('Recovery email') ? "#22c55e" : "#dc2626",
          marginTop: "0.8rem",
          fontWeight: 600,
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
