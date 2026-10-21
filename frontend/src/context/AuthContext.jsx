import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hms_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hms_token');
      const storedUser = localStorage.getItem('hms_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh user profile from API in background
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('hms_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('[Auth] Session check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('hms_token', newToken);
        localStorage.setItem('hms_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message || 'Login failed.' };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials or server error.';
      return { success: false, message };
    }
  };

  const register = async (patientData) => {
    try {
      const res = await api.post('/auth/register', patientData);
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('hms_token', newToken);
        localStorage.setItem('hms_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration error. Please check your details.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
