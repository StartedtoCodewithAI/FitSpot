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
      // Look up email in 'profiles' table by username
      let { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email)
        .single();

      if (error || !data?.email) {
        setMessage('Your email or password are not correct.');
        setLoading(false);
        return;
      }
      email = data.email;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setMessage('Your email or password are not correct.');
    } else {
      // Optionally fetch and save user profile here if needed
      localStorage.setItem('user', email);
      navigate('/profile');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Login to FitSpot</h2>
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
      {message && (
        <div style={{ color: 'red', marginTop: '1em' }}>
          {message}
        </div>
      )}
    </div>
  );
}
