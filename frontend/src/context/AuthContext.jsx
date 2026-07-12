import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api.client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate existing local session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.warn('Session verification check failed:', error.message);
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('accessToken', token);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Backend session logout notification failed:', error.message);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setLoading(false);
    }
  };

  const registerStudent = async (studentData) => {
    try {
      const response = await apiClient.post('/auth/register/student', studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed.';
    }
  };

  const registerEmployer = async (employerData) => {
    try {
      const response = await apiClient.post('/auth/register/employer', employerData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed.';
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Email verification link invalid or expired.';
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Request failed.';
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Password reset request expired.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        registerStudent,
        registerEmployer,
        verifyEmail,
        forgotPassword,
        resetPassword,
        checkAuth,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
