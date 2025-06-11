import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    localStorage.setItem("user", JSON.stringify(form));
    setError("");
    navigate("/profile");
  }

  return (
    <div style={{
      maxWidth: 400,
      margin: "3rem auto",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 6px 24px rgba(0,0,0,0.11)",
      padding: "2.2rem 2.5rem"
    }}>
      <h2 style={{ textAlign: "center" }}>Sign up for FitSpot</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem", marginTop: "1.5rem" }}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <div>
          <label style={{ fontSize: "0.97rem", color: "#007bff", cursor: "pointer" }}>
            Upload avatar
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </label>
          {form.avatar && (
            <img
              src={form.avatar}
              alt="avatar preview"
              style={{ width: 56, height: 56, borderRadius: "50%", marginLeft: 10, verticalAlign: "middle", objectFit: "cover", border: "2px solid #e0e7ef" }}
            />
          )}
        </div>
        {error && <div style={{ color: "red", fontSize: "0.98rem" }}>{error}</div>}
        <button
          type="submit"
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 20,
            padding: "0.7rem 0",
            fontSize: "1.1rem",
            marginTop: "0.7rem"
          }}
        >
          Sign Up
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "1rem" }}>
        Already have an account? <Link to="/login" style={{ color: "#007bff" }}>Log in</Link>
      </div>
    </div>
  );
}
