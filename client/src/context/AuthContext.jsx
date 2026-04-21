import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Resolves to Render backend in prod, or Vite dev proxy in local dev
const AUTH_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/auth`
  : '/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${AUTH_BASE}/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    
    if (data.success) {
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    }
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${AUTH_BASE}/register`, { name, email, password }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    
    if (data.success) {
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateBudget = async (category, amount) => {
    try {
      const { data } = await axios.put(`${AUTH_BASE}/budget`, { category, amount }, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        withCredentials: true,
      });
      if (data.success) {
        const updatedUser = { ...data.data, token: user.token };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.error('Failed to update budget', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBudget }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

