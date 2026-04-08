import React, { createContext, useState, useEffect } from 'react';
import UniversalStorage from '../utils/UniversalStorage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      console.log("Using baseURL:", apiClient.defaults.baseURL);
      const response = await apiClient.post('/auth/login', { email, password });
      console.log("Login API Response Status:", response.status);
      console.log("Login successful content:", !!response.data);
      const { token, ...user } = response.data;
      
      setUserToken(token);
      setUserInfo(user);
      await UniversalStorage.setItem('userToken', token);
      await UniversalStorage.setItem('userInfo', JSON.stringify(user));
      
      return { success: true };
    } catch (e) {
      console.error("Login Error Detail:", {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data
      });

      let errorMessage = 'Login failed. Please try again.';
      
      if (!e.response) {
        errorMessage = 'Network Error: Cannot reach the server. Please check your internet or tunnel status.';
      } else if (e.response.status === 502 || e.response.status === 503 || e.response.status === 504) {
        errorMessage = 'Connection Error: The tunnel or backend is unresponsive. If on Wi-Fi, try using Local IP.';
      } else if (e.response.data && e.response.data.message) {
        errorMessage = e.response.data.message;
      } else {
        errorMessage = e.message || 'Login failed';
      }

      return { success: false, error: errorMessage };
    }
  };


  const register = async (userData) => {
    try {
      console.log("Sending registration request:", userData);
      const response = await apiClient.post('/auth/register', userData);
      console.log("Registration response:", response.data);
      const { token, ...user } = response.data;
      
      setUserToken(token);
      setUserInfo(user);
      await UniversalStorage.setItem('userToken', token);
      await UniversalStorage.setItem('userInfo', JSON.stringify(user));
      
      return { success: true };
    } catch (e) {
      console.log("Registration error details:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.message || 'Registration failed' };
    }
  };


  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await UniversalStorage.removeItem('userToken');
    await UniversalStorage.removeItem('userInfo');
  };

  const updateUserInfo = async (newUser) => {
    setUserInfo(newUser);
    await UniversalStorage.setItem('userInfo', JSON.stringify(newUser));
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Failed to send reset code' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, code, newPassword });
      return { success: true, message: response.data.message };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Failed to reset password' };
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await UniversalStorage.getItem('userToken');
      let user = await UniversalStorage.getItem('userInfo');
      
      if (token && user) {
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, register, logout, updateUserInfo, forgotPassword, resetPassword, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
