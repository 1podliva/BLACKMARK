import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Invalid token');
        const userRes = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) {
          const userData = await userRes.json();
          throw new Error(userData.message || 'Failed to fetch user profile');
        }
        const userData = await userRes.json();
        setUser(userData);
      } catch (err) {
        console.error('Token verification error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Помилка входу');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      const userRes = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.message || 'Failed to fetch user profile');
      setUser(userData);
    } catch (err) {
      throw new Error(err.message || 'Помилка входу');
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Помилка реєстрації');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      const userRes = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.message || 'Failed to fetch user profile');
      setUser(userData);
    } catch (err) {
      throw new Error(err.message || 'Помилка реєстрації');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};