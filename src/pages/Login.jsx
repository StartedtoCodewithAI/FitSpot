import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/ssr';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Please fill all required fields.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // Fetch user details and save to localStorage for use elsewhere if needed
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    setMessage('Login successful! Redirecting...');
    setTimeout(() => {
      navigate('/gyms'); // redirect to gyms page after login
    }, 900);

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2.5rem 1rem" }}>
      {/* Login form card */}
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
          Log In
        </h2>
        <form onSubmit={handleLogin}>
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "1.1rem" }}>
          <Link to="/reset-password" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: "0.97rem" }}>
            Forgot Password?
          </Link>
        </div>
        {message && (
          <div style={{
            textAlign: "center",
            color: message.startsWith('Login successful') ? "#22c55e" : "#dc2626",
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
