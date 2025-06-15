import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      // Only trust Supabase session!
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setIsAuthenticated(!!data?.session);
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
