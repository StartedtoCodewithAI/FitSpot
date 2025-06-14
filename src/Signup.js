import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation (English full name)
    if (
      !/^[A-Za-z ]+$/.test(fullName.trim()) ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      setMessage('Please fill all required fields. Full name must be in English.');
      setLoading(false);
      return;
    }

    // Create user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          fullName: fullName.trim(),
          ...(username.trim() && { username: username.trim() }),
        },
      },
    });

    if (signUpError) {
      setMessage(signUpError.message);
      setLoading(false);
      return;
    }

    // Insert into profiles table (you can ignore result/errors for now)
    await supabase.from('profiles').insert([
      {
        email: email.trim(),
        username: username.trim() || null,
        full_name: fullName.trim(),
      },
    ]);

    setMessage('Signup successful! Please check your email to confirm your account.');
    setLoading(false);
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name (English only)"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username (optional)"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}
