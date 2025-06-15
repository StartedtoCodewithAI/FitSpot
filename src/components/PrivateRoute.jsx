import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      // Get Supabase session (fresh, not cached)
      const { data } = await supabase.auth.getSession();
      const storedUser = localStorage.getItem('user');
      // Authenticated if Supabase session OR localStorage user
      if (isMounted) {
        setIsAuthenticated(!!(data?.session || storedUser));
        setLoading(false);
      }
    }
    checkSession();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
