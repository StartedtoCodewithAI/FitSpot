import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from '../components/SearchBar';

export default function Signup() {
  // State for the signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State for the search bar (for consistency, optional to use)
  const [searchTerm, setSearchTerm] = useState('');

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Please fill all required fields.');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setMessage(signUpError.message);
    } else {
      setMessage('Signup successful! Please check your email to confirm your account.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2.5rem 1rem" }}>
      {/* Fancy Search Bar at the top, just like in Gyms/MyCodes */}
      <div style={{ margin: "18px 0 18px 0", maxWidth: 420 }}>
        <SearchBar
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search (does nothing here)..."
        />
      </div>

      {/* Signup form card */}
      <div style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 12px #2563eb18",
        padding: "2.1rem 2rem 1.7rem 2rem",
        margin: "0 auto",
        maxWidth: 380
      }}>
        <h2 style={{ 
          textAlign: "center", 
          fontSize: "2rem", 
          fontWeight: 800, 
          marginBottom: "1.6rem", 
          color: "#2563eb" 
        }}>
          Sign Up
        </h2>
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.8rem 1.2rem",
              borderRadius: 10,
              border: "1px solid #e0e7ef",
              fontSize: "1rem",
              boxSizing: "border-box",
              marginBottom: "0.9rem",
              background: "#f9fafb"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.8rem 1.2rem",
              borderRadius: 10,
              border: "1px solid #e0e7ef",
              fontSize: "1rem",
              boxSizing: "border-box",
              marginBottom: "1.1rem",
              background: "#f9fafb"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#2563eb",
              color: "#fff",
              padding: "0.85rem",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1.07rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem",
              boxShadow: "0 1px 8px #2563eb13"
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        {message && (
          <div style={{
            textAlign: "center",
            color: message.startsWith('Signup successful') ? "#22c55e" : "#dc2626",
            marginTop: "0.8rem",
            fontWeight: 600,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
