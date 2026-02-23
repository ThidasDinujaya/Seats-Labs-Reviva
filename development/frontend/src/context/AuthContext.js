import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (token) {

          try {
            const res = await authApi.getMe();
            if (res.success) {
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
            } else if (storedUser && storedUser !== "undefined") {
              setUser(JSON.parse(storedUser));
            }
          } catch (e) {
            console.error("Auth verify failed:", e);
            if (storedUser && storedUser !== "undefined") {
              setUser(JSON.parse(storedUser));
            } else {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          }
        }
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);

      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
