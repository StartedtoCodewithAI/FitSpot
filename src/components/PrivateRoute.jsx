import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkSession() {
      // Get Supabase session
      const { data, error } = await supabase.auth.getSession();
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      // Consider authenticated if either a Supabase session OR a stored user exists
      if ((data && data.session) || storedUser) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    }
    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
