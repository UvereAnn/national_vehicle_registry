import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nvr_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
  try {
    const res = await api.get('/auth/me');
    setUser(res.data);
  } catch (err) {
    // Only logout if token is actually invalid, not on network errors
    if (err.response?.status === 401 || err.response?.status === 403) {
      logout();
    } else {
      // Network/server error — keep user logged in
      const stored = localStorage.getItem('nvr_token');
      if (stored) {
        try {
          const payload = JSON.parse(atob(stored.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            setUser({ id: payload.id, name: payload.name, email: payload.email, role: payload.role });
          } else {
            logout();
          }
        } catch { logout(); }
      }
    }
  } finally {
    setLoading(false);
  }
  };

  const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('nvr_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  } catch (err) {
    // Make sure error propagates to LoginPage
    throw err;
  }
};

  const logout = () => {
    localStorage.removeItem('nvr_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
