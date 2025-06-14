import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let email = userInput.trim();

    // If user input is not an email, treat it as username
    if (!email.includes('@')) {
      // Fetch all users with this username from Supabase Auth's admin API (not available on client side for non-service role)
      // Workaround: You must keep a 'profiles' table in your DB that links usernames to emails.
      let { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email)
        .single();

      if (error || !data) {
        setMessage('Username not found.');
        setLoading(false);
        return;
      }
      email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      localStorage.setItem('user', email);
      navigate('/profile');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email or Username"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
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
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}
